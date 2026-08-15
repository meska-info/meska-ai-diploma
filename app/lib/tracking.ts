export type TrackingEventName =
  | "ViewContent"
  | "CTAOpenForm"
  | "FormStart"
  | "FormError"
  | "Lead"
  | "PricingView"
  | "LeadThankYouView"
  | "InitiateCheckout"
  | "MediaPlaceholderClick"
  | "CheckoutLinkPending";

export type TrackingParameters = Record<
  string,
  string | number | boolean | undefined
>;

declare global {
  interface Window {
    __MESKA_EVENTS__?: Array<{
      event: TrackingEventName;
      parameters: TrackingParameters;
      timestamp: string;
    }>;
  }
}

const onceKeys = new Set<string>();

export function createEventId(prefix: string) {
  const random =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `${prefix}-${random}`;
}

export function trackEvent(
  event: TrackingEventName,
  parameters: TrackingParameters = {},
  options?: { onceKey?: string },
) {
  if (typeof window === "undefined") return;

  if (options?.onceKey) {
    const storageKey = `meska-event:${options.onceKey}`;
    if (onceKeys.has(storageKey) || sessionStorage.getItem(storageKey)) return;
    onceKeys.add(storageKey);
    sessionStorage.setItem(storageKey, "1");
  }

  const safeParameters = Object.fromEntries(
    Object.entries(parameters).filter(
      ([key, value]) =>
        value !== undefined &&
        !["name", "email", "phone", "mobile", "job", "company"].includes(
          key.toLowerCase(),
        ),
    ),
  );

  const payload = {
    event,
    parameters: safeParameters,
    timestamp: new Date().toISOString(),
  };

  window.__MESKA_EVENTS__ = window.__MESKA_EVENTS__ ?? [];
  window.__MESKA_EVENTS__.push(payload);
  console.info("[Meska tracking · local only]", JSON.stringify(payload));
}

export function captureAttribution() {
  if (typeof window === "undefined") return {};

  const supported = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_term",
    "utm_content",
    "fbclid",
  ];
  const current = new URLSearchParams(window.location.search);
  const stored = sessionStorage.getItem("meska-attribution");
  const attribution: Record<string, string> = stored ? JSON.parse(stored) : {};

  supported.forEach((key) => {
    const value = current.get(key);
    if (value) attribution[key] = value;
  });

  sessionStorage.setItem("meska-attribution", JSON.stringify(attribution));
  return attribution;
}
