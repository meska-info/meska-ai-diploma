import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "../../../lib/cronAuth";
import { countRows, recordPipelineEvent, supabaseConfig } from "../../../lib/leadStore";
import { isConversionsApiConfigured } from "../../../lib/metaConversions";

export const dynamic = "force-dynamic";

/**
 * Daily pipeline-health check (Vercel Cron). Counts, for the last 24 hours:
 * leads saved, Sheet syncs that failed or are stuck past 60 minutes, server
 * Meta Leads that failed or are stuck, n8n webhook failures, rejected lead
 * requests and content-drift events. Any problem is logged as an error, stored
 * in lead_pipeline_events and, when PIPELINE_ALERT_WEBHOOK_URL is set (an n8n
 * webhook), posted there. Contains counts only — never lead data.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = supabaseConfig();
  if (!config) {
    return NextResponse.json({ error: "Lead service unavailable" }, { status: 503 });
  }

  const now = Date.now();
  const since = encodeURIComponent(new Date(now - 24 * 60 * 60 * 1000).toISOString());
  const stuckBefore = encodeURIComponent(new Date(now - 60 * 60 * 1000).toISOString());
  const recent = `created_at=gte.${since}`;

  const counts: Record<string, number | string> = {};
  const checks: Array<[string, string, string]> = [
    ["leads", "leads", recent],
    ["sheetFailed", "leads", `${recent}&sheet_sync_status=eq.failed`],
    [
      "sheetStuckOver60Min",
      "leads",
      `${recent}&sheet_sync_status=in.(pending,retrying)&created_at=lt.${stuckBefore}`,
    ],
    ["n8nFailed", "leads", `${recent}&n8n_status=eq.failed`],
    ["metaCapiFailed", "leads", `${recent}&capi_status=eq.failed`],
    ["rejectedRequests", "lead_pipeline_events", `${recent}&kind=eq.lead_rejected`],
    ["contentDrift", "lead_pipeline_events", `${recent}&kind=eq.content_drift`],
  ];
  if (isConversionsApiConfigured()) {
    checks.push([
      "metaCapiStuckOver60Min",
      "leads",
      `${recent}&capi_status=in.(pending,retrying)&created_at=lt.${stuckBefore}`,
    ]);
  }

  for (const [name, table, filter] of checks) {
    try {
      counts[name] = await countRows(config, table, filter);
    } catch (error) {
      counts[name] = error instanceof Error ? error.message : "unknown";
    }
  }

  const problems = Object.entries(counts).filter(
    ([name, value]) => name !== "leads" && value !== 0,
  );
  const report = {
    event: "meska.pipeline.health",
    site: "diploma.meska.ai",
    window: "24h",
    healthy: problems.length === 0,
    counts,
    metaConversionsApi: isConversionsApiConfigured() ? "configured" : "token_missing",
    checkedAt: new Date(now).toISOString(),
  };

  if (report.healthy) {
    console.info("Lead pipeline health", JSON.stringify(report));
  } else {
    console.error("Lead pipeline health problems", JSON.stringify(report));
  }
  await recordPipelineEvent(
    config,
    "health_check",
    report.healthy ? "healthy" : "problems",
    report,
  );

  const alertUrl = process.env.PIPELINE_ALERT_WEBHOOK_URL;
  let alert = "not_configured";
  if (alertUrl && !report.healthy) {
    try {
      const response = await fetch(alertUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.PIPELINE_ALERT_WEBHOOK_SECRET
            ? { "X-Meska-Webhook-Secret": process.env.PIPELINE_ALERT_WEBHOOK_SECRET }
            : {}),
        },
        body: JSON.stringify(report),
        cache: "no-store",
        signal: AbortSignal.timeout(8_000),
      });
      alert = response.ok ? "sent" : `failed_${response.status}`;
    } catch {
      alert = "failed_network";
    }
  } else if (alertUrl) {
    alert = "not_needed";
  }

  return NextResponse.json({ ...report, alert });
}
