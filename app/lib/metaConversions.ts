import { createHash } from "node:crypto";

/**
 * Server-side Meta Lead (Conversions API).
 *
 * The browser Pixel fires `Lead` on /thank-you with eventID = requestId. The
 * server sends the same event with event_id = request_id, so Meta pairs the two
 * and counts each lead once. Personal data is SHA-256 hashed before it leaves
 * the server; nothing here is sent to the browser.
 */

export const META_PIXEL_ID = "1982493002344234";
// Current Marketing API version (Conversions API is part of the Marketing API).
const DEFAULT_GRAPH_API_VERSION = "v25.0";
// Meta rejects website events older than seven days.
export const CONVERSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type ConversionContext = {
  fbp?: string;
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
  event_source_url?: string;
};

export type ConversionLead = {
  request_id: string;
  created_at: string;
  name: string;
  email: string;
  mobile: string;
  diploma_slug: string;
  programme_price_value?: number | null;
  /** Shopify variant ID of the chosen format; the browser Lead sends the same. */
  content_id?: string | null;
  attribution?: Record<string, string> | null;
  capi_context?: ConversionContext | null;
};

function sha256(value: string) {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

export function hashEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return normalized ? sha256(normalized) : undefined;
}

export function hashPhone(mobile: string) {
  // Digits only, including the country code (e.g. 201012345678).
  const digits = mobile.replace(/\D/g, "").replace(/^00/, "");
  return digits ? sha256(digits) : undefined;
}

export function hashNamePart(value: string | undefined) {
  const normalized = (value ?? "")
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\s.'’-]/gu, "");
  return normalized ? sha256(normalized) : undefined;
}

function splitName(fullName: string) {
  const parts = fullName.trim().split(/\s+/u).filter(Boolean);
  return {
    first: parts[0],
    last: parts.length > 1 ? parts[parts.length - 1] : undefined,
  };
}

/** Meta's fbc format, derived from the ad click id when the _fbc cookie is absent. */
export function fbcFromFbclid(fbclid: string | undefined, createdAt: string) {
  if (!fbclid) return undefined;
  const time = Date.parse(createdAt);
  return `fb.1.${Number.isFinite(time) ? time : Date.now()}.${fbclid}`;
}

function compact<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(
      ([, entry]) => entry !== undefined && entry !== null && entry !== "",
    ),
  ) as Partial<T>;
}

export function buildLeadConversionEvent(lead: ConversionLead) {
  const context = lead.capi_context ?? {};
  const { first, last } = splitName(lead.name);
  const createdAt = Date.parse(lead.created_at);
  const eventTime = Math.floor(
    (Number.isFinite(createdAt) ? createdAt : Date.now()) / 1000,
  );
  const email = hashEmail(lead.email);
  const phone = hashPhone(lead.mobile);
  const firstName = hashNamePart(first);
  const lastName = hashNamePart(last);

  return {
    event_name: "Lead",
    event_time: eventTime,
    event_id: lead.request_id,
    action_source: "website",
    event_source_url:
      context.event_source_url || "https://diploma.meska.ai/",
    user_data: compact({
      em: email ? [email] : undefined,
      ph: phone ? [phone] : undefined,
      fn: firstName ? [firstName] : undefined,
      ln: lastName ? [lastName] : undefined,
      fbp: context.fbp,
      fbc:
        context.fbc ||
        fbcFromFbclid(lead.attribution?.fbclid, lead.created_at),
      client_ip_address: context.client_ip_address,
      client_user_agent: context.client_user_agent,
    }),
    custom_data: compact({
      currency: "EGP",
      value:
        typeof lead.programme_price_value === "number"
          ? lead.programme_price_value
          : undefined,
      content_name: lead.diploma_slug,
      content_category: "professional_diploma",
      content_ids: lead.content_id ? [lead.content_id] : undefined,
      content_type: lead.content_id ? "product" : undefined,
    }),
  };
}

export function isConversionsApiConfigured() {
  return Boolean(process.env.META_CONVERSIONS_TOKEN);
}

export async function sendLeadConversion(
  lead: ConversionLead,
  fetchImplementation: typeof fetch = fetch,
) {
  const token = process.env.META_CONVERSIONS_TOKEN;
  if (!token) throw new Error("meta_conversions_token_missing");
  const createdAt = Date.parse(lead.created_at);
  if (Number.isFinite(createdAt) && Date.now() - createdAt > CONVERSION_MAX_AGE_MS) {
    throw new Error("meta_event_too_old");
  }

  const version = process.env.META_GRAPH_API_VERSION || DEFAULT_GRAPH_API_VERSION;
  const body: Record<string, unknown> = {
    data: [buildLeadConversionEvent(lead)],
  };
  const testEventCode = process.env.META_TEST_EVENT_CODE;
  if (testEventCode && process.env.VERCEL_ENV !== "production") {
    body.test_event_code = testEventCode;
  }

  const response = await fetchImplementation(
    `https://graph.facebook.com/${version}/${META_PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    },
  );
  if (!response.ok) {
    let code = "unknown";
    try {
      const errorBody = (await response.json()) as {
        error?: { code?: unknown; error_subcode?: unknown };
      };
      code = [errorBody.error?.code, errorBody.error?.error_subcode]
        .filter((part) => part !== undefined)
        .join("_") || "unknown";
    } catch {
      // Never log the response body: it can echo request data.
    }
    throw new Error(`meta_capi_${response.status}_${code}`);
  }
  const result = (await response.json()) as { events_received?: unknown };
  if (result.events_received !== 1) {
    throw new Error("meta_capi_not_received");
  }
}
