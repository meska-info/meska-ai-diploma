import { NextResponse } from "next/server";
import { isAuthorizedCronRequest } from "../../../lib/cronAuth";
import { ensureLinkedInKindColumn } from "../../../lib/googleSheets";
import {
  CAPI_MAX_ATTEMPTS,
  capiRetryFilter,
  runConversion,
  runSheetSync,
  SHEET_MAX_ATTEMPTS,
  type PipelineLead,
} from "../../../lib/leadPipeline";
import { rpc, selectLeads, supabaseConfig, updateLeads } from "../../../lib/leadStore";
import { isConversionsApiConfigured } from "../../../lib/metaConversions";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const BATCH_SIZE = 25;

/**
 * Retry job (Vercel Cron): re-delivers leads whose server-side Meta Lead or
 * Google Sheets sync did not go through on the first attempt, gives up on work
 * past its window, removes raw IP addresses older than 7 days, and keeps the
 * Sheet layout current. Meta and the IP purge run first: Google calls are the
 * slow part, and each step is time-limited and independent.
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

  // Leads older than two minutes are past their inline first attempt.
  const now = Date.now();
  const settledBefore = new Date(now - 2 * 60 * 1000).toISOString();
  const since = new Date(now - 14 * 24 * 60 * 60 * 1000).toISOString();
  const capiSince = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();

  // 1. Server-side Meta Lead retries (only once the token is configured), on a
  // schedule by lead age (capiRetryFilter), inside Meta's 7-day window.
  if (isConversionsApiConfigured()) {
    try {
      const pendingConversions = (await selectLeads(
        config,
        `select=*&capi_status=in.(pending,retrying)&capi_attempts=lt.${CAPI_MAX_ATTEMPTS}&created_at=gt.${encodeURIComponent(capiSince)}&${capiRetryFilter(now)}&order=created_at.asc&limit=${BATCH_SIZE}`,
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

  // 2. Give up on work past its window, so nothing stays "retrying" forever.
  try {
    await updateLeads(
      config,
      `capi_status=in.(pending,retrying)&created_at=lt.${encodeURIComponent(capiSince)}`,
      { capi_status: "failed", capi_error: "meta_event_too_old" },
    );
    await updateLeads(
      config,
      `sheet_sync_status=in.(pending,retrying)&created_at=lt.${encodeURIComponent(since)}`,
      { sheet_sync_status: "failed", sheet_sync_error: "sheet_retry_window_ended" },
    );
    summary.expired = "ok";
  } catch (error) {
    summary.expired = error instanceof Error ? error.message : "unknown";
  }

  // 3. Privacy: drop raw IP addresses older than 7 days.
  try {
    await rpc(config, "purge_lead_capi_ip");
    summary.ipPurge = "ok";
  } catch (error) {
    summary.ipPurge = error instanceof Error ? error.message : "unknown";
  }

  // 4. Google Sheets retries.
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

  // 5. Sheet layout: the "LinkedIn type" column next to LinkedIn (a no-op once added).
  const layout: Record<string, string> = {};
  for (const diploma of ["offline", "online"] as const) {
    try {
      layout[diploma] = await ensureLinkedInKindColumn(diploma, vercelOidcToken);
    } catch (error) {
      layout[diploma] = error instanceof Error ? error.message : "unknown";
    }
  }
  summary.sheetLayout = layout;

  console.info("Lead sync job", JSON.stringify(summary));
  return NextResponse.json({ ok: true, ...summary });
}
