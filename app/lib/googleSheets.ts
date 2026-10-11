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

function spreadsheetIdFor(diploma: DiplomaSlug) {
  const id = diploma === "offline" ? process.env.GOOGLE_SHEETS_OFFLINE_ID : process.env.GOOGLE_SHEETS_ONLINE_ID;
  if (!id) throw new Error(`google_sheet_${diploma}_missing`);
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

async function ensureEnrollmentHeaders(spreadsheetId: string, headers: Record<string, string>) {
  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Sheet1!A1:AQ1")}`,
    { cache: "no-store", headers },
  );
  if (!response.ok) throw new Error(`google_sheet_headers_read_${response.status}`);
  const body = (await response.json()) as { values?: unknown[][] };
  const existing = body.values?.[0] ?? [];
  const expected = [...LEGACY_QUALIFICATION_HEADERS, ...ENROLLMENT_SHEET_HEADERS];
  const firstColumn = 16;
  for (let index = 0; index < expected.length; index += 1) {
    const column = firstColumn + index;
    if (existing[column - 1]) continue;
    const update = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`Sheet1!${sheetColumn(column)}1`)}?valueInputOption=RAW`,
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

export async function syncLeadToGoogleSheets(lead: SheetLead, vercelOidcToken: string | null | undefined) {
  if (!vercelOidcToken) throw new Error("vercel_oidc_token_missing");
  return retry(async () => {
    const spreadsheetId = spreadsheetIdFor(lead.diploma_slug);
    const accessToken = await getGoogleAccessToken(vercelOidcToken);
    const headers = { Authorization: `Bearer ${accessToken}` };
    await ensureEnrollmentHeaders(spreadsheetId, headers);
    const leadIdsResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Sheet1!A:A")}?majorDimension=COLUMNS`,
      { cache: "no-store", headers },
    );
    if (!leadIdsResponse.ok) throw new Error(`google_sheet_read_${leadIdsResponse.status}`);
    const leadIdsBody = (await leadIdsResponse.json()) as { values?: unknown[][] };
    const leadIds = leadIdsBody.values?.[0] ?? [];
    const existingIndex = leadIds.findIndex((value) => value === lead.id);
    const row = sheetRowForLead(lead);
    if (existingIndex >= 0) {
      const rowNumber = existingIndex + 1;
      const updateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(`Sheet1!A${rowNumber}:AQ${rowNumber}`)}?valueInputOption=RAW`,
        {
          method: "PUT",
          headers: { ...headers, "Content-Type": "application/json" },
          body: JSON.stringify({ majorDimension: "ROWS", values: [row] }),
          cache: "no-store",
        },
      );
      if (!updateResponse.ok) throw new Error(`google_sheet_update_${updateResponse.status}`);
      return;
    }
    const appendResponse = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Sheet1!A:AQ")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ majorDimension: "ROWS", values: [row] }),
        cache: "no-store",
      },
    );
    if (!appendResponse.ok) throw new Error(`google_sheet_append_${appendResponse.status}`);
  });
}
