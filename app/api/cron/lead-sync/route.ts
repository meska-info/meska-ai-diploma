import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "../../../lib/cronAuth";
import { ensureLinkedInKindColumn } from "../../../lib/googleSheets";
import {
  CAPI_MAX_ATTEMPTS,
  runConversion,
  runSheetSync,
  SHEET_MAX_ATTEMPTS,
  type PipelineLead,
} from "../../../lib/leadPipeline";
import { rpc, selectLeads, supabaseConfig } from "../../../lib/leadStore";
import { isConversionsApiConfigured } from "../../../lib/metaConversions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH_SIZE = 25;

/**
 * Retry job (Vercel Cron): re-delivers leads whose Google Sheets sync or
 * server-side Meta Lead did not go through on the first attempt, keeps the
 * Sheet layout current, and removes raw IP addresses older than 7 days.
 */
export async function GET(request: Request) {
  if (!isAuthorizedCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const config = supabaseConfig();
  if (!config) {
    return NextResponse.json({ error: "Lead service unavailable" }, { status: 503 });
  }
  const vercelOidcToken =
    request.headers.get("x-vercel-oidc-token") ?? process.env.VERCEL_OIDC_TOKEN;
  const summary: Record<string, unknown> = {};

  // 1. Sheet layout: add the "LinkedIn type" column next to LinkedIn (once).
  const layout: Record<string, string> = {};
  for (const diploma of ["offline", "online"] as const) {
    try {
      layout[diploma] = await ensureLinkedInKindColumn(diploma, vercelOidcToken);
    } catch (error) {
      layout[diploma] = error instanceof Error ? error.message : "unknown";
    }
  }
  summary.sheetLayout = layout;

  // Leads older than two minutes are past their inline first attempt.
  const settledBefore = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  const since = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

  // 2. Google Sheets retries.
  try {
    const pendingSheets = (await selectLeads(
      config,
      `select=*&sheet_sync_status=in.(pending,retrying)&sheet_sync_attempts=lt.${SHEET_MAX_ATTEMPTS}&created_at=lt.${encodeURIComponent(settledBefore)}&created_at=gt.${encodeURIComponent(since)}&order=created_at.asc&limit=${BATCH_SIZE}`,
    )) as unknown as PipelineLead[];
    let synced = 0;
    for (const lead of pendingSheets) {
      if (await runSheetSync(config, lead, vercelOidcToken)) synced += 1;
    }
    summary.sheets = { pending: pendingSheets.length, synced };
  } catch (error) {
    summary.sheets = { error: error instanceof Error ? error.message : "unknown" };
  }

  // 3. Server-side Meta Lead retries (only once the token is configured).
  if (isConversionsApiConfigured()) {
    try {
      const capiSince = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      const pendingConversions = (await selectLeads(
        config,
        `select=*&capi_status=in.(pending,retrying)&capi_attempts=lt.${CAPI_MAX_ATTEMPTS}&created_at=lt.${encodeURIComponent(settledBefore)}&created_at=gt.${encodeURIComponent(capiSince)}&order=created_at.asc&limit=${BATCH_SIZE}`,
      )) as unknown as PipelineLead[];
      let sent = 0;
      for (const lead of pendingConversions) {
        if (await runConversion(config, lead)) sent += 1;
      }
      summary.metaCapi = { pending: pendingConversions.length, sent };
    } catch (error) {
      summary.metaCapi = { error: error instanceof Error ? error.message : "unknown" };
    }
  } else {
    summary.metaCapi = { skipped: "meta_conversions_token_missing" };
  }

  // 4. Privacy: drop raw IP addresses older than 7 days.
  try {
    await rpc(config, "purge_lead_capi_ip");
    summary.ipPurge = "ok";
  } catch (error) {
    summary.ipPurge = error instanceof Error ? error.message : "unknown";
  }

  console.info("Lead sync job", JSON.stringify(summary));
  return NextResponse.json({ ok: true, ...summary });
}
