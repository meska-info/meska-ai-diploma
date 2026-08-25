export type TrackingEventName =
  | "ViewContent"
  | "CTAOpenForm"
  | "FormStart"
  | "FormError"
  | "FormSubmit"
  | "Lead"
  | "PricingView"
  | "LeadThankYouView"
  | "InitiateCheckout"
  | "FormatSelect"
  | "CapabilitySelect"
  | "VideoPlay"
  | "MediaPlaceholderClick"
  | "CheckoutLinkPending";

export type TrackingParameters = Record<
  string,
  string | number | boolean | undefined
>;

export const META_PIXEL_ID = "1982493002344234";

type MetaPixelFunction = (
  command: "init" | "track" | "trackCustom",
  eventOrPixelId: string,
  parameters?: TrackingParameters,
  options?: { eventID?: string },
) => void;

declare global {
  interface Window {
    fbq?: MetaPixelFunction & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[][];
      loaded?: boolean;
      version?: string;
    };
    _fbq?: MetaPixelFunction;
    __MESKA_META_PIXEL_INITIALIZED__?: boolean;
    __MESKA_META_PAGEVIEWS__?: string[];
    __MESKA_EVENTS__?: Array<{
      event: TrackingEventName;
      parameters: TrackingParameters;
      timestamp: string;
    }>;
  }
}

const onceKeys = new Set<string>();

export function readSessionValue(key: string) {
  try {
    return window.sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeSessionValue(key: string, value: string) {
  try {
    window.sessionStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

export function removeSessionValue(key: string) {
  try {
    window.sessionStorage.removeItem(key);
  } catch {
    // Restricted mobile/privacy contexts may disable storage entirely.
  }
}

const standardMetaEvents = new Set<TrackingEventName>([
  "ViewContent",
  "Lead",
  "InitiateCheckout",
]);

export function initializeMetaPixel() {
  if (typeof window === "undefined" || window.__MESKA_META_PIXEL_INITIALIZED__) {
    return;
  }

  if (!window.fbq) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue?.push(args);
    }) as MetaPixelFunction & {
      callMethod?: (...args: unknown[]) => void;
      queue?: unknown[][];
      loaded?: boolean;
      version?: string;
    };
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    window._fbq = fbq;
  }

  window.fbq("init", META_PIXEL_ID);
  window.__MESKA_META_PIXEL_INITIALIZED__ = true;
}

export function trackMetaPageView(pathname: string) {
  if (
    typeof window === "undefined" ||
    !window.__MESKA_META_PIXEL_INITIALIZED__ ||
    !window.fbq
  ) {
    return;
  }

  const pageviews = (window.__MESKA_META_PAGEVIEWS__ ??= []);
  if (pageviews.at(-1) === pathname) return;
  pageviews.push(pathname);
  window.fbq("track", "PageView");
}

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
    if (onceKeys.has(storageKey) || readSessionValue(storageKey)) return;
    onceKeys.add(storageKey);
    writeSessionValue(storageKey, "1");
  }

  const safeParameters = Object.fromEntries(
    Object.entries(parameters).filter(
      ([key, value]) =>
        value !== undefined &&
        ![
          "name",
          "fullname",
          "full_name",
          "email",
          "phone",
          "mobile",
          "job",
          "company",
          "website",
        ].includes(key.toLowerCase()),
    ),
  );

  const payload = {
    event,
    parameters: safeParameters,
    timestamp: new Date().toISOString(),
  };

  window.__MESKA_EVENTS__ = window.__MESKA_EVENTS__ ?? [];
  window.__MESKA_EVENTS__.push(payload);
  console.info("[Meska tracking]", JSON.stringify(payload));

  if (window.__MESKA_META_PIXEL_INITIALIZED__ && window.fbq) {
    const eventId =
      typeof safeParameters.event_id === "string"
        ? safeParameters.event_id
        : undefined;
    const options = eventId ? { eventID: eventId } : undefined;
    window.fbq(
      standardMetaEvents.has(event) ? "track" : "trackCustom",
      event,
      safeParameters,
      options,
    );
  }
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
  const stored = readSessionValue("meska-attribution");
  let attribution: Record<string, string> = {};
  if (stored) {
    try {
      attribution = JSON.parse(stored) as Record<string, string>;
    } catch {
      attribution = {};
    }
  }

  supported.forEach((key) => {
    const value = current.get(key);
    if (value) attribution[key] = value;
  });

  writeSessionValue("meska-attribution", JSON.stringify(attribution));
  return attribution;
}
