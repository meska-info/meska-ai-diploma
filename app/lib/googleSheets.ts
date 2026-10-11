type DiplomaSlug = "offline" | "online";

export type SheetParticipant = {
  fullName?: string;
  name?: string;
  email: string;
};

export type SheetLead = {
  id: string;
  request_id: string;
  created_at: string;
  name: string;
  email: string;
  mobile: string;
  linkedin_url: string | null;
  years_experience: string | null;
  payment_preference: string | null;
  programme_price: string | null;
  programme_price_value: number | null;
  current_wave: string | null;
  current_wave_start_date: string | null;
  start_timing: string | null;
  diploma_slug: DiplomaSlug;
  lead_source: string;
  source_context: string;
  attribution: Record<string, string>;
  enrollment_type?: "individual" | "team";
  seats?: number;
  tier_rate?: number | string;
  price_per_seat?: number;
  quoted_total?: number;
  company_name?: string | null;
  job_title?: string | null;
  copilot_licence?: string | null;
  joining_readiness?: string | null;
  licence_acknowledged?: boolean;
  submitter_is_participant?: boolean;
  participants?: SheetParticipant[] | null;
  participants_count?: number;
  payment_path?: "now" | "invoice" | "send" | null;
  payer_email?: string | null;
  checkout_url?: string | null;
  status?: "lead" | "checkout_started" | "invoice_requested" | "payment_link_shared";
  checkout_started_at?: string | null;
  invoice_requested_at?: string | null;
  repeat_submission?: boolean;
  updated_at?: string | null;
};

const LEGACY_QUALIFICATION_HEADERS = [
  "linkedin_url",
  "years_experience",
  "payment_preference",
  "programme_price",
  "programme_price_value",
  "current_wave",
  "current_wave_start_date",
  "start_timing",
] as const;

const COPILOT_BASE_HEADERS = [
  "created_at",
  "request_id",
  "record_id",
  "name",
  "email",
  "mobile",
  "linkedin_url",
  "years_experience",
  "payment_preference",
  "joining_readiness",
  "cohort_label",
  "onboarding_date",
  "first_session_date",
  "source_context",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "referrer",
  "landing_url",
] as const;

export const ENROLLMENT_SHEET_HEADERS = [
  "Enrollment Type",
  "Seats",
  "Discount %",
  "Price per Seat (EGP)",
  "Total (EGP)",
  "Company",
  "Job Title",
  "Copilot Licence",
  "Licence Acknowledged",
  "Submitter Attending",
  "Participants Added",
  "Participants",
  "Payment Path",
  "Payer Email",
  "Status",
  "Checkout Link",
  "Checkout Started At",
  "Invoice Requested At",
  "Repeat Submission",
  "Last Updated",
] as const;

function humanPaymentPreference(value: string | null | undefined) {
  return value === "enterprise" ? "Enterprise arrangement"
    : value === "installments" ? "0% installments (Sympl)"
      : value === "full" ? "Pay in full" : "";
}

function humanReadiness(value: string | null | undefined) {
  if (value === "later" || value === "later_wave") return "Next cohort";
  if (value === "upcoming" || value === "current_wave") return "Upcoming cohort";
  if (value === "discuss_upcoming") return "Discuss upcoming cohort";
  return "";
}

function humanLicence(value: string | null | undefined) {
  return ({ yes: "Yes", no: "No", unsure: "Not sure", all: "All", some: "Some", none: "None" } as Record<string, string>)[value ?? ""] ?? "";
}

function humanPaymentPath(value: string | null | undefined) {
  return ({ now: "Pay now", invoice: "Invoice", send: "Sent to manager" } as Record<string, string>)[value ?? ""] ?? "";
}

function humanStatus(value: string | null | undefined) {
  return ({ lead: "Lead", checkout_started: "Checkout started", invoice_requested: "Invoice requested", payment_link_shared: "Payment link shared" } as Record<string, string>)[value ?? "lead"] ?? "Lead";
}

function cairoDate(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Cairo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? "";
  return `${part("year")}-${part("month")}-${part("day")} ${part("hour")}:${part("minute")}`;
}

export function enrollmentSheetValues(lead: SheetLead) {
  const participants = Array.isArray(lead.participants) ? lead.participants : [];
  const enrollmentType = lead.enrollment_type ?? "individual";
  return [
    enrollmentType === "team" ? "Team" : "Individual",
    lead.seats ?? 1,
    Math.round(Number(lead.tier_rate ?? 0) * 100),
    lead.price_per_seat ?? 30_000,
    lead.quoted_total ?? lead.programme_price_value ?? 30_000,
    lead.company_name ?? "",
    lead.job_title ?? "",
    humanLicence(lead.copilot_licence),
    lead.licence_acknowledged ? "Yes" : "No",
    enrollmentType === "team" ? (lead.submitter_is_participant === false ? "No" : "Yes") : "",
    lead.participants_count ?? participants.length,
    participants.map((participant) => `${participant.fullName ?? participant.name ?? ""} <${participant.email}>`).join("; "),
    humanPaymentPath(lead.payment_path),
    lead.payer_email ?? "",
    humanStatus(lead.status),
    lead.checkout_url ?? "",
    cairoDate(lead.checkout_started_at),
    cairoDate(lead.invoice_requested_at),
    lead.repeat_submission ? "Yes" : "No",
    cairoDate(lead.updated_at ?? lead.created_at),
  ];
}

export function sheetRowForLead(lead: SheetLead) {
  const attribution = lead.attribution ?? {};
  return [
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
    lead.linkedin_url ?? "",
    lead.enrollment_type === "team" ? "" : lead.years_experience ?? "",
    humanPaymentPreference(lead.payment_preference),
    lead.programme_price ?? "",
    lead.programme_price_value ?? "",
    lead.current_wave ?? "",
    lead.current_wave_start_date ?? "",
    humanReadiness(lead.joining_readiness ?? lead.start_timing),
    ...enrollmentSheetValues(lead),
  ];
}

export function copilotSheetRowForLead(lead: SheetLead) {
  const attribution = lead.attribution ?? {};
  return [
    lead.created_at,
    lead.request_id,
    lead.id,
    lead.name,
    lead.email,
    lead.mobile,
    lead.linkedin_url ?? "",
    lead.enrollment_type === "team" ? "" : lead.years_experience ?? "",
    humanPaymentPreference(lead.payment_preference),
    humanReadiness(lead.joining_readiness ?? lead.start_timing),
    lead.current_wave ?? "",
    "2026-11-04",
    "2026-11-09",
    lead.source_context,
    attribution.utm_source ?? "",
    attribution.utm_medium ?? "",
    attribution.utm_campaign ?? "",
    attribution.utm_term ?? "",
    attribution.utm_content ?? "",
    attribution.fbclid ?? "",
    attribution.referrer ?? "",
    attribution.landing_url ?? "",
    ...enrollmentSheetValues(lead),
  ];
}

async function getGoogleAccessToken(vercelOidcToken: string) {
  const projectNumber = process.env.GCP_PROJECT_NUMBER;
  const poolId = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
  const providerId = process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;
  const serviceAccountEmail = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
  if (!projectNumber || !poolId || !providerId || !serviceAccountEmail) throw new Error("google_federation_config_missing");

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
  if (!exchangeResponse.ok) throw new Error(`google_sts_${exchangeResponse.status}`);
  const exchangeBody = (await exchangeResponse.json()) as { access_token?: unknown };
  if (typeof exchangeBody.access_token !== "string") throw new Error("google_sts_token_missing");

  const impersonationResponse = await fetch(
    `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${encodeURIComponent(serviceAccountEmail)}:generateAccessToken`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${exchangeBody.access_token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ lifetime: "3600s", scope: ["https://www.googleapis.com/auth/spreadsheets"] }),
      cache: "no-store",
    },
  );
  if (!impersonationResponse.ok) throw new Error(`google_impersonation_${impersonationResponse.status}`);
  const impersonationBody = (await impersonationResponse.json()) as { accessToken?: unknown };
  if (typeof impersonationBody.accessToken !== "string") throw new Error("google_impersonation_token_missing");
  return impersonationBody.accessToken;
}

function spreadsheetIdFor(lead: Pick<SheetLead, "diploma_slug" | "lead_source">) {
  const id = lead.lead_source === "copilot-course" && process.env.GOOGLE_SHEETS_COPILOT_ID
    ? process.env.GOOGLE_SHEETS_COPILOT_ID
    : lead.diploma_slug === "offline"
    ? process.env.GOOGLE_SHEETS_OFFLINE_ID
    : process.env.GOOGLE_SHEETS_ONLINE_ID;
  if (!id) throw new Error(`google_sheet_${lead.diploma_slug}_missing`);
  return id;
}

async function retry<T>(operation: () => Promise<T>, attempts = 3) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt + 1 < attempts) await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));
    }
  }
  throw lastError;
}

function sheetColumn(column: number) {
  return column <= 26 ? String.fromCharCode(64 + column) : `A${String.fromCharCode(64 + column - 26)}`;
}

type SheetProperties = {
  sheetId: number;
  title: string;
  columnCount: number;
};

const LEGACY_BASE_COLUMN_COUNT = 23;
const COPILOT_BASE_COLUMN_COUNT = COPILOT_BASE_HEADERS.length;

export function enrollmentColumnsToAppend(columnCount: number, requiredColumnCount = 43) {
  return Math.max(0, requiredColumnCount - Math.max(0, Math.trunc(columnCount)));
}

export function sheetA1Range(title: string, range: string) {
  return `'${title.replaceAll("'", "''")}'!${range}`;
}

async function getSheetProperties(spreadsheetId: string, headers: Record<string, string>) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}?fields=${encodeURIComponent("sheets.properties(sheetId,title,index,hidden,gridProperties.columnCount)")}`,
    { cache: "no-store", headers },
  );
  if (!response.ok) throw new Error(`google_sheet_metadata_${response.status}`);
  const body = (await response.json()) as {
    sheets?: Array<{
      properties?: {
        sheetId?: unknown;
        title?: unknown;
        index?: unknown;
        hidden?: unknown;
        gridProperties?: { columnCount?: unknown };
      };
    }>;
  };
  const visibleSheets = (body.sheets ?? [])
    .map((sheet) => sheet.properties)
    .filter((properties) => properties && properties.hidden !== true)
    .sort((left, right) => Number(left?.index ?? 0) - Number(right?.index ?? 0));
  const properties = visibleSheets[0];
  if (
    typeof properties?.sheetId !== "number" ||
    typeof properties.title !== "string" ||
    typeof properties.gridProperties?.columnCount !== "number"
  ) {
    throw new Error("google_sheet_properties_missing");
  }
  return {
    sheetId: properties.sheetId,
    title: properties.title,
    columnCount: properties.gridProperties.columnCount,
  } satisfies SheetProperties;
}

async function ensureEnrollmentColumns(
  spreadsheetId: string,
  properties: SheetProperties,
  headers: Record<string, string>,
  requiredColumnCount: number,
) {
  const length = enrollmentColumnsToAppend(properties.columnCount, requiredColumnCount);
  if (!length) return;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}:batchUpdate`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [{
          updateSheetProperties: {
            properties: {
              sheetId: properties.sheetId,
              gridProperties: { columnCount: properties.columnCount + length },
            },
            fields: "gridProperties.columnCount",
          },
        }],
      }),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error(`google_sheet_columns_${response.status}`);
}

async function ensureEnrollmentHeaders(
  spreadsheetId: string,
  properties: SheetProperties,
  headers: Record<string, string>,
  existingHeaders: readonly string[],
  baseColumnCount: number,
) {
  const lastColumn = sheetColumn(baseColumnCount + ENROLLMENT_SHEET_HEADERS.length);
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetA1Range(properties.title, `A1:${lastColumn}1`))}`,
    { cache: "no-store", headers },
  );
  if (!response.ok) throw new Error(`google_sheet_headers_read_${response.status}`);
  const body = (await response.json()) as { values?: unknown[][] };
  const existing = body.values?.[0] ?? [];
  const expected = [...existingHeaders, ...ENROLLMENT_SHEET_HEADERS];
  const firstColumn = baseColumnCount - existingHeaders.length + 1;
  for (let index = 0; index < expected.length; index += 1) {
    const column = firstColumn + index;
    if (existing[column - 1]) continue;
    const update = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetA1Range(properties.title, `${sheetColumn(column)}1`))}?valueInputOption=RAW`,
      {
        method: "PUT",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ majorDimension: "ROWS", values: [[expected[index]]] }),
        cache: "no-store",
      },
    );
    if (!update.ok) throw new Error(`google_sheet_headers_${update.status}`);
  }
}

function sheetPlanForLead(lead: SheetLead) {
  if (lead.lead_source === "copilot-course") {
    const baseColumnCount = COPILOT_BASE_COLUMN_COUNT;
    const lastColumn = sheetColumn(baseColumnCount + ENROLLMENT_SHEET_HEADERS.length);
    return {
      baseColumnCount,
      baseLastColumn: sheetColumn(baseColumnCount),
      existingHeaders: [] as readonly string[],
      keyColumn: "C",
      lastColumn,
      row: copilotSheetRowForLead(lead),
    };
  }
  const baseColumnCount = LEGACY_BASE_COLUMN_COUNT;
  return {
    baseColumnCount,
    baseLastColumn: sheetColumn(baseColumnCount),
    existingHeaders: LEGACY_QUALIFICATION_HEADERS,
    keyColumn: "A",
    lastColumn: sheetColumn(baseColumnCount + ENROLLMENT_SHEET_HEADERS.length),
    row: sheetRowForLead(lead),
  };
}

async function latestLeadForSync(lead: SheetLead) {
  if (lead.lead_source !== "copilot-course") return lead;
  const supabaseUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) return lead;
  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, "")}/rest/v1/leads?id=eq.${encodeURIComponent(lead.id)}&select=*`,
    {
      cache: "no-store",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
    },
  );
  if (!response.ok) return lead;
  const rows = await response.json() as SheetLead[];
  return rows[0] ?? lead;
}

async function readLeadIds(
  spreadsheetId: string,
  title: string,
  keyColumn: string,
  headers: Record<string, string>,
) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetA1Range(title, `${keyColumn}:${keyColumn}`))}?majorDimension=COLUMNS`,
    { cache: "no-store", headers },
  );
  if (!response.ok) throw new Error(`google_sheet_read_${response.status}`);
  const body = (await response.json()) as { values?: unknown[][] };
  return body.values?.[0] ?? [];
}

async function appendSheetRow(
  spreadsheetId: string,
  title: string,
  baseLastColumn: string,
  row: unknown[],
  headers: Record<string, string>,
) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetA1Range(title, `A:${baseLastColumn}`))}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ majorDimension: "ROWS", values: [row] }),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error(`google_sheet_append_${response.status}`);
}

async function updateSheetRow(
  spreadsheetId: string,
  title: string,
  lastColumn: string,
  rowNumber: number,
  row: unknown[],
  headers: Record<string, string>,
) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetA1Range(title, `A${rowNumber}:${lastColumn}${rowNumber}`))}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ majorDimension: "ROWS", values: [row] }),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error(`google_sheet_update_${response.status}`);
}

async function clearDuplicateRows(
  spreadsheetId: string,
  title: string,
  lastColumn: string,
  duplicateIndexes: number[],
  headers: Record<string, string>,
) {
  if (!duplicateIndexes.length) return;
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchClear`,
    {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        ranges: duplicateIndexes.map((index) =>
          sheetA1Range(title, `A${index + 1}:${lastColumn}${index + 1}`)),
      }),
      cache: "no-store",
    },
  );
  if (!response.ok) throw new Error(`google_sheet_duplicates_${response.status}`);
}

export async function syncLeadToGoogleSheets(lead: SheetLead, vercelOidcToken: string | null | undefined) {
  if (!vercelOidcToken) throw new Error("vercel_oidc_token_missing");
  return retry(async () => {
    const currentLead = await latestLeadForSync(lead);
    const spreadsheetId = spreadsheetIdFor(currentLead);
    const accessToken = await getGoogleAccessToken(vercelOidcToken);
    const headers = { Authorization: `Bearer ${accessToken}` };
    const properties = await getSheetProperties(spreadsheetId, headers);
    const plan = sheetPlanForLead(currentLead);
    await ensureEnrollmentColumns(
      spreadsheetId,
      properties,
      headers,
      plan.baseColumnCount + ENROLLMENT_SHEET_HEADERS.length,
    );
    await ensureEnrollmentHeaders(
      spreadsheetId,
      properties,
      headers,
      plan.existingHeaders,
      plan.baseColumnCount,
    );
    let leadIds = await readLeadIds(spreadsheetId, properties.title, plan.keyColumn, headers);
    let matchingIndexes = leadIds.flatMap((value, index) => value === currentLead.id ? [index] : []);
    if (!matchingIndexes.length) {
      await appendSheetRow(
        spreadsheetId,
        properties.title,
        plan.baseLastColumn,
        plan.row,
        headers,
      );
      await new Promise((resolve) => setTimeout(resolve, 150));
      leadIds = await readLeadIds(spreadsheetId, properties.title, plan.keyColumn, headers);
      matchingIndexes = leadIds.flatMap((value, index) => value === currentLead.id ? [index] : []);
    }
    const canonicalIndex = matchingIndexes[0];
    if (canonicalIndex === undefined) throw new Error("google_sheet_row_unconfirmed");
    await updateSheetRow(
      spreadsheetId,
      properties.title,
      plan.lastColumn,
      canonicalIndex + 1,
      plan.row,
      headers,
    );
    await clearDuplicateRows(
      spreadsheetId,
      properties.title,
      plan.lastColumn,
      matchingIndexes.slice(1),
      headers,
    );
  });
}
