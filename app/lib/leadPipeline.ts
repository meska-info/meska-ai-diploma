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
      sheet_sync_status: attempts >= SHEET_MAX_ATTEMPTS ? "failed" : "retrying",
      sheet_sync_attempts: attempts,
      sheet_sync_error: errorText(error),
    });
    return false;
  }
}

export async function runConversion(config: SupabaseConfig, lead: PipelineLead) {
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
