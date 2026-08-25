import { createSign } from "node:crypto";

type DiplomaSlug = "offline" | "online";

export type SheetLead = {
  id: string;
  request_id: string;
  created_at: string;
  name: string;
  email: string;
  mobile: string;
  diploma_slug: DiplomaSlug;
  lead_source: string;
  source_context: string;
  attribution: Record<string, string>;
};

function base64Url(value: string | Buffer) {
  return Buffer.from(value)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getGoogleAccessToken() {
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!serviceAccountEmail || !privateKey) {
    throw new Error("google_credentials_missing");
  }

  const now = Math.floor(Date.now() / 1000);
  const unsignedToken = `${base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64Url(
    JSON.stringify({
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
      iss: serviceAccountEmail,
      scope: "https://www.googleapis.com/auth/spreadsheets",
    }),
  )}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsignedToken);
  signer.end();
  const assertion = `${unsignedToken}.${base64Url(signer.sign(privateKey))}`;

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      assertion,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
    }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`google_auth_${response.status}`);
  const body = (await response.json()) as { access_token?: unknown };
  if (typeof body.access_token !== "string") {
    throw new Error("google_auth_token_missing");
  }
  return body.access_token;
}

function spreadsheetIdFor(diploma: DiplomaSlug) {
  const id =
    diploma === "offline"
      ? process.env.GOOGLE_SHEETS_OFFLINE_ID
      : process.env.GOOGLE_SHEETS_ONLINE_ID;
  if (!id) throw new Error(`google_sheet_${diploma}_missing`);
  return id;
}

export async function syncLeadToGoogleSheets(lead: SheetLead) {
  const spreadsheetId = spreadsheetIdFor(lead.diploma_slug);
  const accessToken = await getGoogleAccessToken();
  const headers = { Authorization: `Bearer ${accessToken}` };
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
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent("Sheet1!A:N")}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
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
