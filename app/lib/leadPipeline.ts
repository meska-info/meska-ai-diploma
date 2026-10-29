import { siteContent, type DiplomaId } from "../content";
import { syncLeadToGoogleSheets, type SheetLead } from "./googleSheets";
import { triggerLeadAutomation } from "./leadAutomation";
import {
  CONVERSION_MAX_AGE_MS,
  isConversionsApiConfigured,
  sendLeadConversion,
  type ConversionLead,
} from "./metaConversions";
import { updateLeadStatus, type SupabaseConfig } from "./leadStore";
import { shopifyVariantId } from "./metaProduct";

export type PipelineLead = SheetLead & ConversionLead & {
  sheet_sync_attempts?: number | null;
  capi_attempts?: number | null;
};

/** Sheets can be retried for this long; after that the lead is marked failed. */
export const SHEET_MAX_ATTEMPTS = 12;
export const CAPI_MAX_ATTEMPTS = 10;

/**
 * Preview and Production share one Supabase project. Only Production leads are
 * queued for the Sheet retry job and the server-side Meta Lead; Preview leads
 * are stored as "legacy" for both, so they never reach the live Sheets or Meta.
 */
export function isProductionDeployment() {
  return process.env.VERCEL_ENV === "production";
}

const HOUR_MS = 60 * 60 * 1000;
// Server Lead retry schedule by lead age: [attempts made below this count, minimum age].
// Attempts 2–3 within minutes, then two attempts each at 1 h, 6 h, 24 h and 72 h,
// so a token or permission problem fixed within three days still delivers.
export const CAPI_RETRY_TIERS: ReadonlyArray<readonly [number, number]> = [
  [3, 2 * 60 * 1000],
  [5, HOUR_MS],
  [7, 6 * HOUR_MS],
  [9, 24 * HOUR_MS],
  [CAPI_MAX_ATTEMPTS, 72 * HOUR_MS],
];

/** PostgREST `or` filter selecting server Leads that are due for a retry now. */
export function capiRetryFilter(now = Date.now()) {
  let below = 0;
  const tiers = CAPI_RETRY_TIERS.map(([attemptsBelow, minAge]) => {
    const tier = `and(capi_attempts.gte.${below},capi_attempts.lt.${attemptsBelow},created_at.lt."${new Date(now - minAge).toISOString()}")`;
    below = attemptsBelow;
    return tier;
  });
  return `or=${encodeURIComponent(`(${tiers.join(",")})`)}`;
}

function errorText(error: unknown) {
  return (error instanceof Error ? error.message : "unknown").slice(0, 300);
}

function logFailure(step: string, error: unknown, lead: PipelineLead) {
  console.error(
    "Lead background integration failed",
    JSON.stringify({
      step,
      code: errorText(error),
      requestId: lead.request_id,
      diplomaSlug: lead.diploma_slug,
    }),
  );
}

export async function runSheetSync(
  config: SupabaseConfig,
  lead: PipelineLead,
  vercelOidcToken: string | null | undefined,
) {
  const attempts = (lead.sheet_sync_attempts ?? 0) + 1;
  try {
    await syncLeadToGoogleSheets(lead, vercelOidcToken);
    await updateLeadStatus(config, lead.request_id, {
      sheet_sync_status: "synced",
      sheet_sync_attempts: attempts,
      sheet_synced_at: new Date().toISOString(),
      sheet_sync_error: null,
    });
    return true;
  } catch (error) {
    logFailure("google_sheets", error, lead);
    await updateLeadStatus(config, lead.request_id, {
      sheet_sync_status:
        attempts >= SHEET_MAX_ATTEMPTS || !isProductionDeployment() ? "failed" : "retrying",
      sheet_sync_attempts: attempts,
      sheet_sync_error: errorText(error),
    });
    return false;
  }
}

export async function runConversion(config: SupabaseConfig, lead: PipelineLead) {
  if (!isProductionDeployment()) return false;
  if (!isConversionsApiConfigured()) {
    // Stays "pending" so the retry job sends it once the token is configured.
    return false;
  }
  const attempts = (lead.capi_attempts ?? 0) + 1;
  const createdAt = Date.parse(lead.created_at);
  const expired =
    Number.isFinite(createdAt) && Date.now() - createdAt > CONVERSION_MAX_AGE_MS;
  try {
    if (expired) throw new Error("meta_event_too_old");
    const diploma = siteContent.diplomas[lead.diploma_slug as DiplomaId];
    await sendLeadConversion({
      ...lead,
      content_id: diploma ? shopifyVariantId(diploma.checkoutUrl) : undefined,
    });
    await updateLeadStatus(config, lead.request_id, {
      capi_status: "sent",
      capi_attempts: attempts,
      capi_sent_at: new Date().toISOString(),
      capi_error: null,
    });
    return true;
  } catch (error) {
    logFailure("meta_capi", error, lead);
    await updateLeadStatus(config, lead.request_id, {
      capi_status:
        expired || attempts >= CAPI_MAX_ATTEMPTS ? "failed" : "retrying",
      capi_attempts: attempts,
      capi_error: errorText(error),
    });
    return false;
  }
}

export async function runAutomation(config: SupabaseConfig, lead: PipelineLead) {
  try {
    await triggerLeadAutomation(lead);
    await updateLeadStatus(config, lead.request_id, {
      n8n_status: "sent",
      n8n_error: null,
    });
    return true;
  } catch (error) {
    // n8n stays fail-open: the lead is already saved. The failure is logged
    // and stored so the daily pipeline-health check can count it.
    logFailure("n8n", error, lead);
    console.error(
      "n8n webhook failed",
      JSON.stringify({ code: `n8n_webhook_${errorText(error)}`, requestId: lead.request_id }),
    );
    await updateLeadStatus(config, lead.request_id, {
      n8n_status: "failed",
      n8n_error: errorText(error),
    });
    return false;
  }
}
