/**
 * Small Supabase REST helpers for the lead pipeline (server only).
 *
 * Every write that touches the pipeline-status columns added by
 * supabase/migrations/20261028_lead_pipeline_status.sql is tolerant: if the
 * migration has not been applied yet, the lead itself is still saved and
 * only the status bookkeeping is skipped (and logged).
 */

export type SupabaseConfig = { url: string; key: string };

export function supabaseConfig(): SupabaseConfig | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return { url: url.replace(/\/$/, ""), key };
}

function headers(config: SupabaseConfig, extra: Record<string, string> = {}) {
  return {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    "Content-Type": "application/json",
    ...extra,
  };
}

async function errorCode(response: Response) {
  try {
    const body = (await response.json()) as { code?: unknown };
    return typeof body.code === "string" ? body.code : "unknown";
  } catch {
    return "unknown";
  }
}

/** PostgREST codes for a column/table that does not exist (migration pending). */
export function isSchemaMissingCode(code: string) {
  return code === "PGRST204" || code === "PGRST205" || code === "42703" || code === "42P01";
}

export const pipelineColumns = [
  "linkedin_url_raw",
  "linkedin_kind",
  "suspected_spam",
  "capi_context",
] as const;

/**
 * Inserts the lead. If the new pipeline columns are not in the database yet,
 * retries once without them so a lead is never lost to a pending migration.
 */
export async function insertLead(
  config: SupabaseConfig,
  row: Record<string, unknown>,
) {
  const endpoint = `${config.url}/rest/v1/leads?select=*`;
  const init = (body: Record<string, unknown>): RequestInit => ({
    method: "POST",
    headers: headers(config, {
      Prefer: "return=representation,resolution=ignore-duplicates",
    }),
    body: JSON.stringify(body),
    cache: "no-store",
  });

  let response = await fetch(endpoint, init(row));
  let legacySchema = false;
  if (!response.ok) {
    const code = await errorCode(response.clone());
    if (response.status === 400 && isSchemaMissingCode(code)) {
      legacySchema = true;
      console.warn(
        "Lead pipeline columns missing",
        JSON.stringify({ step: "supabase", code: "migration_pending" }),
      );
      const legacyRow = Object.fromEntries(
        Object.entries(row).filter(
          ([key]) => !(pipelineColumns as readonly string[]).includes(key),
        ),
      );
      response = await fetch(endpoint, init(legacyRow));
    }
  }
  return { response, legacySchema };
}

export async function selectLeadByRequestId(
  config: SupabaseConfig,
  requestId: string,
) {
  const response = await fetch(
    `${config.url}/rest/v1/leads?request_id=eq.${encodeURIComponent(requestId)}&select=*`,
    { headers: headers(config), cache: "no-store" },
  );
  if (!response.ok) return [];
  return (await response.json()) as Record<string, unknown>[];
}

export async function updateLeadStatus(
  config: SupabaseConfig,
  requestId: string,
  patch: Record<string, unknown>,
) {
  try {
    const response = await fetch(
      `${config.url}/rest/v1/leads?request_id=eq.${encodeURIComponent(requestId)}`,
      {
        method: "PATCH",
        headers: headers(config, { Prefer: "return=minimal" }),
        body: JSON.stringify(patch),
        cache: "no-store",
      },
    );
    if (!response.ok) {
      console.warn(
        "Lead status update failed",
        JSON.stringify({
          step: "supabase_status",
          status: response.status,
          code: await errorCode(response),
          requestId,
        }),
      );
    }
  } catch {
    console.warn(
      "Lead status update failed",
      JSON.stringify({ step: "supabase_status", code: "network", requestId }),
    );
  }
}

export async function selectLeads(config: SupabaseConfig, query: string) {
  const response = await fetch(`${config.url}/rest/v1/leads?${query}`, {
    headers: headers(config),
    cache: "no-store",
  });
  if (!response.ok) {
    throw new Error(`supabase_select_${response.status}_${await errorCode(response)}`);
  }
  return (await response.json()) as Record<string, unknown>[];
}

/** Counts rows matching a PostgREST filter without returning them. */
export async function countRows(
  config: SupabaseConfig,
  table: string,
  filter: string,
) {
  const response = await fetch(
    `${config.url}/rest/v1/${table}?select=id&${filter}`,
    {
      method: "HEAD",
      headers: headers(config, { Prefer: "count=exact" }),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error(`supabase_count_${table}_${response.status}`);
  const range = response.headers.get("content-range") ?? "";
  const total = Number(range.split("/")[1]);
  return Number.isFinite(total) ? total : 0;
}

/** Non-PII pipeline events (rejections, content drift, alerts). Best-effort. */
export async function recordPipelineEvent(
  config: SupabaseConfig,
  kind: string,
  code: string,
  detail: Record<string, unknown> = {},
) {
  try {
    const response = await fetch(`${config.url}/rest/v1/lead_pipeline_events`, {
      method: "POST",
      headers: headers(config, { Prefer: "return=minimal" }),
      body: JSON.stringify({ kind, code, detail }),
      cache: "no-store",
    });
    if (!response.ok) {
      console.warn(
        "Pipeline event not recorded",
        JSON.stringify({ kind, code, status: response.status }),
      );
    }
  } catch {
    console.warn("Pipeline event not recorded", JSON.stringify({ kind, code }));
  }
}

export async function rpc(
  config: SupabaseConfig,
  name: string,
  args: Record<string, unknown> = {},
) {
  const response = await fetch(`${config.url}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: headers(config),
    body: JSON.stringify(args),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`supabase_rpc_${name}_${response.status}`);
  return response;
}
