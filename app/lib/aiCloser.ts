import type { Diploma, DiplomaId } from "../content";

export const AI_CLOSER_CONTEXT_ENDPOINT =
  "https://n8n-qrsy.srv1573769.hstgr.cloud/webhook/meska-diploma-ai-closer-context";
export const AI_CLOSER_EVENT_ENDPOINT =
  "https://n8n-qrsy.srv1573769.hstgr.cloud/webhook/meska-diploma-ai-closer-event";

// The Shopify offer is created asynchronously after the lead is stored, so the
// first context read usually lands while `lead_offers` is still `pending`.
export const AI_CLOSER_POLL_INTERVAL_MS = 3_000;
export const AI_CLOSER_POLL_MAX_MS = 90_000;
export const ADVISOR_AUTO_OPEN_DEADLINE_MS = 12_000;
// The popup opens on its own only after the visitor has had time on the page.
export const ADVISOR_AUTO_OPEN_DELAY_MS = 40_000;

export const AI_CLOSER_EVENT_TYPES = [
  "chat_started",
  "chat_message",
  "qualification_update",
  "pricing_interest",
  "curriculum_interest",
  "schedule_interest",
  "payment_interest",
  "checkout_intent",
  "human_handoff",
  "lost",
] as const;

export type AiCloserEventType = (typeof AI_CLOSER_EVENT_TYPES)[number];
export type AiCloserOfferState =
  | "offer_pending"
  | "offer_ready"
  | "expired"
  | "unavailable";

export type SafeAiCloserContext = {
  schemaVersion: "1";
  leadVerified: boolean;
  firstName?: string;
  diplomaSlug?: DiplomaId;
  offerState: AiCloserOfferState;
  offer: null | {
    discountPercent?: number;
    discountCode?: string;
    startsAt?: string;
    expiresAt?: string;
  };
  safeMessage: string;
};

export type SafeAiCloserEvent = {
  schemaVersion: "1";
  event: AiCloserEventType;
  eventId: string;
  occurredAt: string;
  conversationId?: string;
  summary?: string;
  stage?: string;
  score?: number;
  primaryGoal?: string;
  primaryUseCase?: string;
  primaryObjection?: string;
  urgency?: string;
  purchaseReadiness?: string;
};

const EVENT_TYPES = new Set<string>(AI_CLOSER_EVENT_TYPES);
const EVENT_ID_PATTERN = /^[A-Za-z0-9._:-]{8,128}$/;
const STAGES = new Set([
  "submitted",
  "chat_engaged",
  "qualified",
  "warm",
  "hot",
  "checkout_intent",
  "human_handoff",
  "lost",
]);

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return undefined;
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return cleaned || undefined;
}

export function redactSalesText(value: unknown, maxLength = 200) {
  if (typeof value !== "string") return undefined;
  const redacted = value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/[\w.+-]+@[\w-]+\.[\w.-]+/g, "[email]")
    .replace(/https?:\/\/\S+/gi, "[link]")
    .replace(/\+?\d[\d\s().-]{6,}\d/g, (match) =>
      (match.match(/\d/g) ?? []).length >= 8 ? "[number]" : match,
    )
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
  return redacted || undefined;
}

export function formatOfferExpiry(expiresAt: string | undefined) {
  if (!expiresAt) return undefined;
  const expiryTime = new Date(expiresAt).getTime();
  if (!Number.isFinite(expiryTime)) return undefined;
  try {
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: "Africa/Cairo",
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(expiryTime));
  } catch {
    return undefined;
  }
}

export function isPendingOfferState(context: SafeAiCloserContext | null) {
  return context?.leadVerified === true && context.offerState === "offer_pending";
}

function unavailableContext(): SafeAiCloserContext {
  return {
    schemaVersion: "1",
    leadVerified: false,
    offerState: "unavailable",
    offer: null,
    safeMessage:
      "Personalized enrollment details are unavailable right now. You can still ask general Diploma questions.",
  };
}

export function normalizeAiCloserContext(
  input: unknown,
  expectedDiploma: DiplomaId,
  now = Date.now(),
): SafeAiCloserContext {
  if (!input || typeof input !== "object") return unavailableContext();
  const raw = input as Record<string, unknown>;
  const diplomaSlug = raw.diploma_slug;
  if (
    raw.schema_version !== "1" ||
    raw.lead_verified !== true ||
    diplomaSlug !== expectedDiploma
  ) {
    return unavailableContext();
  }
  const verifiedDiplomaSlug = diplomaSlug as DiplomaId;

  const firstName = cleanText(raw.first_name, 60)?.split(/\s+/u)[0];
  const rawOfferState = raw.offer_state;
  const offerState: AiCloserOfferState =
    rawOfferState === "offer_pending" ||
    rawOfferState === "offer_ready" ||
    rawOfferState === "expired"
      ? rawOfferState
      : "unavailable";
  const base = {
    schemaVersion: "1" as const,
    leadVerified: true,
    firstName,
    diplomaSlug: verifiedDiplomaSlug,
  };

  if (offerState === "offer_pending") {
    return {
      ...base,
      offerState,
      offer: null,
      safeMessage:
        "Your private enrollment offer is still being prepared. You can continue asking about the Diploma while it is finalized.",
    };
  }

  const rawOffer =
    raw.offer && typeof raw.offer === "object"
      ? (raw.offer as Record<string, unknown>)
      : null;
  const discountPercent = Number(rawOffer?.discount_percent);
  const discountCode = cleanText(rawOffer?.discount_code, 100);
  const startsAt = cleanText(rawOffer?.starts_at, 60);
  const expiresAt = cleanText(rawOffer?.expires_at, 60);

  if (offerState === "offer_ready") {
    const expiryTime = expiresAt ? new Date(expiresAt).getTime() : Number.NaN;
    if (
      !Number.isFinite(discountPercent) ||
      discountPercent <= 0 ||
      discountPercent > 100 ||
      !discountCode ||
      !Number.isFinite(expiryTime) ||
      expiryTime <= now
    ) {
      return {
        ...base,
        offerState: "unavailable",
        offer: null,
        safeMessage:
          "Your enrollment advisor is ready. Personalized offer details are unavailable right now.",
      };
    }
    return {
      ...base,
      offerState,
      offer: { discountPercent, discountCode, startsAt, expiresAt },
      safeMessage: "Your verified private enrollment offer is ready.",
    };
  }

  if (offerState === "expired") {
    return {
      ...base,
      offerState,
      offer: {
        discountPercent:
          Number.isFinite(discountPercent) && discountPercent > 0
            ? discountPercent
            : undefined,
        expiresAt,
      },
      safeMessage:
        "Your previous private offer is no longer active. I can still help with the correct next enrollment step.",
    };
  }

  return {
    ...base,
    offerState: "unavailable",
    offer: null,
    safeMessage:
      "Your enrollment advisor is ready. Personalized offer details are unavailable right now.",
  };
}

export function buildVerifiedAdvisorMessages(
  context: SafeAiCloserContext | null,
  {
    firstName,
    diplomaSlug,
    currentOffer,
    language = "en",
    applicationReceived = true,
  }: {
    firstName?: string;
    diplomaSlug?: DiplomaId;
    currentOffer?: Pick<Diploma, "id" | "priceValue" | "currency"> &
      Partial<Pick<Diploma, "wave" | "startDate" | "schedule" | "location">>;
    language?: "en" | "ar";
    applicationReceived?: boolean;
  } = {},
) {
  const verified = context?.leadVerified ? context : null;
  const name = cleanText(verified?.firstName ?? firstName, 60);
  const slug = verified?.diplomaSlug ?? diplomaSlug;
  const arabic = language === "ar";
  const format = slug === "online"
    ? arabic ? "أونلاين (Online)" : "Online"
    : slug === "offline"
      ? arabic ? "أوفلاين (Offline)" : "Offline"
      : "";
  const label = `AI Copilot Diploma${format ? ` — ${format}` : ""}`;
  const greeting = arabic
    ? `أهلًا${name ? ` يا ${name}` : ""} 👋${applicationReceived ? " طلبك وصلنا، ومش محتاج تبعت أي بيانات تاني." : ""}`
    : `Hi${name ? ` ${name}` : ""} 👋${applicationReceived ? " We've received your application." : ""}`;

  // The welcome is the agent's own first message, so stating the track here is
  // what keeps the conversation on the format the visitor applied for.
  const matchingOffer = currentOffer && currentOffer.id === slug ? currentOffer : null;
  const trackDetails = matchingOffer
    ? [
        matchingOffer.wave && matchingOffer.startDate
          ? `${matchingOffer.wave} · ${matchingOffer.startDate}`
          : undefined,
        matchingOffer.schedule,
        matchingOffer.location,
      ].filter(Boolean).map((line) => `- ${line}`).join("\n")
    : "";
  const recap = format
    ? [
        arabic ? `إنت مسجل في ${label}:` : `You applied for the ${label}:`,
        trackDetails,
      ].filter(Boolean).join("\n")
    : arabic
      ? "MESKA شركة مصرية متخصصة في تعليم الـAI بشكل عملي للمهنيين."
      : "MESKA is an Egyptian company focused on practical AI training for professionals.";

  const expiry = formatOfferExpiry(verified?.offer?.expiresAt);
  const percent = verified?.offer?.discountPercent;
  const code = verified?.offer?.discountCode;
  const activeDiscount =
    verified?.offerState === "offer_ready" &&
    Boolean(expiry) &&
    Boolean(code) &&
    typeof percent === "number" &&
    Number.isFinite(percent) &&
    percent > 0 && percent <= 100;
  const expired = verified?.offerState === "expired";
  const discount = expired
    ? arabic ? "نافذة كود خصمك الشخصي انتهت." : "Your personal discount window has ended."
    : activeDiscount
      ? arabic
        ? `كود خصمك الشخصي ${percent}%: ${code}\nاكتبه في خانة الخصم في صفحة الدفع. صالح لحد ${expiry} بتوقيت القاهرة.`
        : `Your personal ${percent}% code: ${code}\nEnter it in the discount field at checkout. It expires on ${expiry} (Cairo time).`
      : arabic
        ? applicationReceived ? "راجع WhatsApp لكود خصمك الشخصي 10%." : "لو عندك كود خصم شخصي 10%، راجع WhatsApp."
        : applicationReceived ? "Check WhatsApp for your personal 10% code." : "If you have a personal 10% code, check WhatsApp.";

  const fullPrice = matchingOffer &&
    matchingOffer.currency === "EGP" &&
    Number.isFinite(matchingOffer.priceValue) && matchingOffer.priceValue > 0
      ? matchingOffer.priceValue : null;
  const money = (value: number) => `EGP ${new Intl.NumberFormat("en-GB", {
    maximumFractionDigits: 2,
  }).format(value)}`;
  const price = fullPrice === null ? "" : activeDiscount
    ? arabic
      ? `السعر بالكود: ${money(fullPrice * (1 - percent! / 100))}؛ السعر الكامل: ${money(fullPrice)}.`
      : `With your code: ${money(fullPrice * (1 - percent! / 100))}; full tuition: ${money(fullPrice)}.`
    : arabic ? `السعر الكامل: ${money(fullPrice)}.` : `Full tuition: ${money(fullPrice)}.`;

  const closing = format
    ? arabic
      ? `تحب أبعتلك لينك الدفع للـ${format}؟ أو اسألني أي سؤال عنه.`
      : `Want your ${format} payment link? Or ask me anything about it.`
    : arabic
      ? "لو عندك أي استفسار تاني، اسألني هنا."
      : "If you have any other questions, ask me here.";

  return [
    `${greeting}\n\n${recap}`,
    [discount, price, closing].filter(Boolean).join("\n\n"),
  ];
}

export function parseSafeAiCloserContext(
  input: unknown,
  expectedDiploma: DiplomaId,
): SafeAiCloserContext | null {
  if (!input || typeof input !== "object") return null;
  const value = input as Partial<SafeAiCloserContext>;
  if (
    value.schemaVersion !== "1" ||
    typeof value.leadVerified !== "boolean" ||
    value.offerState === undefined ||
    !["offer_pending", "offer_ready", "expired", "unavailable"].includes(
      value.offerState,
    ) ||
    typeof value.safeMessage !== "string" ||
    value.safeMessage.length > 500
  ) {
    return null;
  }
  if (value.leadVerified && value.diplomaSlug !== expectedDiploma) return null;
  if (
    value.diplomaSlug !== undefined &&
    value.diplomaSlug !== "offline" &&
    value.diplomaSlug !== "online"
  ) {
    return null;
  }
  return value as SafeAiCloserContext;
}

export function validateAiCloserEvent(
  input: unknown,
  now = Date.now(),
): SafeAiCloserEvent | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  for (const forbidden of [
    "requestId",
    "request_id",
    "leadId",
    "lead_id",
    "chatbaseAgentId",
    "chatbase_agent_id",
  ]) {
    if (Object.hasOwn(raw, forbidden)) return null;
  }

  const event = cleanText(raw.event, 50);
  const eventId = cleanText(raw.eventId ?? raw.event_id, 128);
  const occurredAt = cleanText(raw.occurredAt ?? raw.occurred_at, 60);
  if (!event || !EVENT_TYPES.has(event) || !eventId || !EVENT_ID_PATTERN.test(eventId)) {
    return null;
  }
  const occurredTime = occurredAt ? new Date(occurredAt).getTime() : Number.NaN;
  if (
    !Number.isFinite(occurredTime) ||
    occurredTime > now + 5 * 60 * 1000 ||
    occurredTime < now - 7 * 24 * 60 * 60 * 1000
  ) {
    return null;
  }

  const conversationId = cleanText(
    raw.conversationId ?? raw.conversation_id,
    200,
  );
  const stage = cleanText(raw.stage, 40);
  if (stage && !STAGES.has(stage)) return null;
  let score: number | undefined;
  if (raw.score !== undefined && raw.score !== null && raw.score !== "") {
    const numericScore = Number(raw.score);
    if (!Number.isFinite(numericScore)) return null;
    score = Math.max(0, Math.min(100, Math.round(numericScore)));
  }

  return {
    schemaVersion: "1",
    event: event as AiCloserEventType,
    eventId,
    occurredAt: new Date(occurredTime).toISOString(),
    conversationId,
    summary: cleanText(raw.summary ?? raw.note, 500),
    stage,
    score,
    primaryGoal: cleanText(raw.primaryGoal ?? raw.primary_goal, 500),
    primaryUseCase: cleanText(raw.primaryUseCase ?? raw.primary_use_case, 500),
    primaryObjection: cleanText(
      raw.primaryObjection ?? raw.primary_objection,
      500,
    ),
    urgency: cleanText(raw.urgency, 80),
    purchaseReadiness: cleanText(
      raw.purchaseReadiness ?? raw.purchase_readiness,
      120,
    ),
  };
}
