type DiplomaSlug = "offline" | "online";

export type SheetLead = {
  id: string;
  request_id: string;
  created_at: string;
  name: string;
  email: string;
  mobile: string;
  linkedin_url: string;
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

export async function syncLeadToGoogleSheets(
  lead: SheetLead,
  vercelOidcToken: string | null | undefined,
) {
  if (!vercelOidcToken) throw new Error("vercel_oidc_token_missing");
  const spreadsheetId = spreadsheetIdFor(lead.diploma_slug);
  const accessToken = await getGoogleAccessToken(vercelOidcToken);
  const headers = { Authorization: `Bearer ${accessToken}` };
  const qualificationHeadersResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Sheet1!O1:V1")}?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({
        majorDimension: "ROWS",
        values: [[
          "linkedin_url",
          "years_experience",
          "payment_preference",
          "programme_price",
          "programme_price_value",
          "current_wave",
          "current_wave_start_date",
          "start_timing",
        ]],
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
  const appendResponse = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Sheet1!A:V")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
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
            lead.linkedin_url,
            lead.years_experience,
            lead.payment_preference,
            lead.programme_price,
            lead.programme_price_value,
            lead.current_wave,
            lead.current_wave_start_date,
            lead.start_timing,
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
