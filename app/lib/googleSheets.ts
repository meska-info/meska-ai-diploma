type DiplomaSlug = "offline" | "online";

export type SheetLead = {
  id: string;
  request_id: string;
  created_at: string;
  name: string;
  email: string;
  mobile: string;
  linkedin_url: string;
  linkedin_kind?: string | null;
  years_experience: string;
  payment_preference: string;
  programme_price: string;
  programme_price_value: number;
  current_wave: string;
  current_wave_start_date: string;
  start_timing: string;
  diploma_slug: DiplomaSlug;
  lead_source: string;
  source_context: string;
  attribution: Record<string, string>;
};

async function getGoogleAccessToken(vercelOidcToken: string) {
  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  if (!projectNumber || !poolId || !providerId || !serviceAccountEmail) {
    throw new Error("google_federation_config_missing");
  }

  const audience = `//iam.googleapis.com/projects/${projectNumber}/locations/global/workloadIdentityPools/${poolId}/providers/${providerId}`;
  const exchangeResponse = await fetch("https://sts.googleapis.com/v1/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      audience,
      grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
      requested_token_type: "urn:ietf:params:oauth:token-type:access_token",
      scope: "https://www.googleapis.com/auth/cloud-platform",
      subject_token: vercelOidcToken,
      subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
    }),
    cache: "no-store",
  });
  if (!exchangeResponse.ok) {
    throw new Error(`google_sts_${exchangeResponse.status}`);
  }
  const exchangeBody = (await exchangeResponse.json()) as {
    access_token?: unknown;
  };
  if (typeof exchangeBody.access_token !== "string") {
    throw new Error("google_sts_token_missing");
  }

  const impersonationResponse = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(serviceAccountEmail)}:generateAccessToken`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${exchangeBody.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        lifetime: "3600s",
        scope: ["https://www.googleapis.com/auth/spreadsheets"],
      }),
      cache: "no-store",
    },
  );
  if (!impersonationResponse.ok) {
    throw new Error(`google_impersonation_${impersonationResponse.status}`);
  }
  const impersonationBody = (await impersonationResponse.json()) as {
    accessToken?: unknown;
  };
  if (typeof impersonationBody.accessToken !== "string") {
    throw new Error("google_impersonation_token_missing");
  }
  return impersonationBody.accessToken;
}

function spreadsheetIdFor(diploma: DiplomaSlug) {
  const id =
    diploma === "offline"
      ? process.env.GOOGLE_SHEETS_OFFLINE_ID
      : process.env.GOOGLE_SHEETS_ONLINE_ID;
  if (!id) throw new Error(`google_sheet_${diploma}_missing`);
  return id;
}

const legacyQualificationHeaders = [
  "linkedin_url",
  "years_experience",
  "payment_preference",
  "programme_price",
  "programme_price_value",
  "current_wave",
  "current_wave_start_date",
  "start_timing",
];

// Current layout: "linkedin_kind" (LinkedIn type) sits next to linkedin_url in
// column Q; the following columns move one to the right (R:X).
const qualificationHeaders = [
  "linkedin_url",
  "linkedin_kind",
  ...legacyQualificationHeaders.slice(1),
];

type SheetLayout = "current" | "legacy";

async function readHeaderRow(spreadsheetId: string, headers: Record<string, string>) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Sheet1!A1:Z1")}`,
    { cache: "no-store", headers },
  );
  if (!response.ok) throw new Error(`google_sheet_header_read_${response.status}`);
  const body = (await response.json()) as { values?: unknown[][] };
  return (body.values?.[0] ?? []).map((value) => String(value ?? ""));
}

/**
 * Column Q holds "linkedin_kind" once the sheet has been migrated. Sheets that
 * still have the previous layout (Q = years_experience) keep receiving rows in
 * that layout until ensureLinkedInKindColumn() inserts the column, so rows are
 * never misaligned.
 */
function layoutFromHeaders(headerRow: string[]): SheetLayout {
  const q = headerRow[16] ?? "";
  return q === "" || q === "linkedin_kind" ? "current" : "legacy";
}

async function sheetAccess(diploma: DiplomaSlug, vercelOidcToken: string | null | undefined) {
  if (!vercelOidcToken) throw new Error("vercel_oidc_token_missing");
  const spreadsheetId = spreadsheetIdFor(diploma);
  const accessToken = await getGoogleAccessToken(vercelOidcToken);
  return { spreadsheetId, headers: { Authorization: `Bearer ${accessToken}` } };
}

/**
 * One-time, idempotent layout migration: inserts the "LinkedIn type" column
 * right after the LinkedIn column (P) in Sheet1. Inserting a whole column
 * shifts existing data, filters and any sales-team columns consistently.
 * Called from the scheduled lead-sync job, not from the per-lead path.
 */
export async function ensureLinkedInKindColumn(
  diploma: DiplomaSlug,
  vercelOidcToken: string | null | undefined,
) {
  const { spreadsheetId, headers } = await sheetAccess(diploma, vercelOidcToken);
  const headerRow = await readHeaderRow(spreadsheetId, headers);
  if (layoutFromHeaders(headerRow) === "current") return "already_current";
  if (headerRow[15] !== "linkedin_url") return "unexpected_layout";

  const metaResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=${encodeURIComponent("sheets.properties(sheetId,title)")}`,
    { cache: "no-store", headers },
  );
  if (!metaResponse.ok) throw new Error(`google_sheet_meta_${metaResponse.status}`);
  const meta = (await metaResponse.json()) as {
    sheets?: Array<{ properties?: { sheetId?: number; title?: string } }>;
  };
  const sheetId = meta.sheets?.find((sheet) => sheet.properties?.title === "Sheet1")
    ?.properties?.sheetId;
  if (typeof sheetId !== "number") throw new Error("google_sheet1_missing");

  const insertResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            insertDimension: {
              range: { sheetId, dimension: "COLUMNS", startIndex: 16, endIndex: 17 },
              inheritFromBefore: true,
            },
          },
          {
            updateCells: {
              range: {
                sheetId,
                startRowIndex: 0,
                endRowIndex: 1,
                startColumnIndex: 16,
                endColumnIndex: 17,
              },
              rows: [{ values: [{ userEnteredValue: { stringValue: "linkedin_kind" } }] }],
              fields: "userEnteredValue",
            },
          },
        ],
      }),
      cache: "no-store",
    },
  );
  if (!insertResponse.ok) throw new Error(`google_sheet_insert_column_${insertResponse.status}`);
  return "migrated";
}

export async function syncLeadToGoogleSheets(
  lead: SheetLead,
  vercelOidcToken: string | null | undefined,
) {
  const { spreadsheetId, headers } = await sheetAccess(lead.diploma_slug, vercelOidcToken);
  const layout = layoutFromHeaders(await readHeaderRow(spreadsheetId, headers));
  const headerValues = layout === "current" ? qualificationHeaders : legacyQualificationHeaders;
  const headerRange = layout === "current" ? "Sheet1!P1:X1" : "Sheet1!P1:W1";
  const qualificationHeadersResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(headerRange)}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        majorDimension: "ROWS",
        values: [headerValues],
      }),
      cache: "no-store",
    },
  );
  if (!qualificationHeadersResponse.ok) {
    throw new Error(`google_sheet_headers_${qualificationHeadersResponse.status}`);
  }
  const requestIdsResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Sheet1!B:B")}?majorDimension=COLUMNS`,
    { cache: "no-store", headers },
  );
  if (!requestIdsResponse.ok) {
    throw new Error(`google_sheet_read_${requestIdsResponse.status}`);
  }
  const requestIdsBody = (await requestIdsResponse.json()) as {
    values?: unknown[][];
  };
  const requestIds = requestIdsBody.values?.[0] ?? [];
  if (requestIds.includes(lead.request_id)) return;

  const attribution = lead.attribution ?? {};
  const qualificationValues = [
    lead.linkedin_url,
    ...(layout === "current" ? [lead.linkedin_kind ?? ""] : []),
    lead.years_experience,
    lead.payment_preference,
    lead.programme_price,
    lead.programme_price_value,
    lead.current_wave,
    lead.current_wave_start_date,
    lead.start_timing,
  ];
  const appendRange = layout === "current" ? "Sheet1!A:X" : "Sheet1!A:W";
  const appendResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(appendRange)}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        majorDimension: "ROWS",
        values: [
          [
            lead.id,
            lead.request_id,
            lead.created_at,
            lead.name,
            lead.email,
            lead.mobile,
            lead.diploma_slug,
            `${lead.lead_source}:${lead.source_context}`,
            attribution.utm_source ?? "",
            attribution.utm_medium ?? "",
            attribution.utm_campaign ?? "",
            attribution.utm_term ?? "",
            attribution.utm_content ?? "",
            attribution.fbclid ?? "",
            "",
            ...qualificationValues,
          ],
        ],
      }),
      cache: "no-store",
    },
  );
  if (!appendResponse.ok) {
    throw new Error(`google_sheet_append_${appendResponse.status}`);
  }
}
