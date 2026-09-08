import type { DiplomaId } from "../content";

export const CHATBASE_AGENT_ID = "lui2mOdc0S4TJNx3RrGqi";
export const CHATBASE_SCRIPT_SRC = "https://www.chatbase.co/embed.min.js";
export const CHATBASE_ROUTE_PATHNAME = "/thank-you";
export const CHATBASE_EMBED_SCRIPT = `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="lui2mOdc0S4TJNx3RrGqi";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`;
export const CHATBASE_STATUS_EVENT = "meska:chatbase-status";
export const DIPLOMA_ADVISOR_CONTEXT_KEY = "meska_diploma_offer";
export const DIPLOMA_ADVISOR_AUTO_OPEN_KEY =
  "meska_diploma_advisor_auto_opened_v1";

const ADVISOR_CONTEXT_MAX_AGE_MS = 24 * 60 * 60 * 1000;

export type ChatbaseStatus = "loading" | "ready" | "unavailable";

export type DiplomaAdvisorContext = {
  leadId: string;
  firstName?: string;
  diplomaSlug: DiplomaId;
  storedAt: number;
};

export type ChatbaseApi = ((...args: unknown[]) => unknown) & {
  q?: unknown[][];
  open: (options?: { message?: string; hideMessage?: boolean }) => void;
  close: () => void;
  setOptions: (options: { initialMessages?: string[] }) => void;
};

declare global {
  interface Window {
    __MESKA_CHATBASE_STATUS__?: ChatbaseStatus;
    chatbase?: ChatbaseApi;
  }
}

function cleanFirstName(value: unknown) {
  if (typeof value !== "string") return undefined;
  const cleaned = value
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 60);
  return cleaned || undefined;
}

function parseJsonRecord(value: string | null) {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object"
      ? (parsed as Record<string, unknown>)
      : null;
  } catch {
    return null;
  }
}

function parseLeadState(value: string | null) {
  const parsed = parseJsonRecord(value);
  if (!parsed) return null;
  const eventId =
    typeof parsed.eventId === "string" ? parsed.eventId.trim() : "";
  const variant = parsed.variant;
  if (
    !eventId ||
    eventId.length > 100 ||
    (variant !== "offline" && variant !== "online")
  ) {
    return null;
  }
  return { eventId, variant } satisfies {
    eventId: string;
    variant: DiplomaId;
  };
}

export function serializeDiplomaAdvisorContext({
  leadId,
  firstName,
  diplomaSlug,
  storedAt = Date.now(),
}: Omit<DiplomaAdvisorContext, "storedAt"> & { storedAt?: number }) {
  return JSON.stringify({
    leadId: leadId.trim().slice(0, 100),
    firstName: cleanFirstName(firstName),
    diplomaSlug,
    storedAt,
  } satisfies DiplomaAdvisorContext);
}

export function resolveDiplomaAdvisorContext(
  storage: Pick<Storage, "getItem" | "removeItem"> = window.sessionStorage,
  now = Date.now(),
) {
  let contextRaw: string | null;
  let pendingRaw: string | null;
  let lastLeadRaw: string | null;
  try {
    contextRaw = storage.getItem(DIPLOMA_ADVISOR_CONTEXT_KEY);
    pendingRaw = storage.getItem("meska-pending-lead");
    lastLeadRaw = storage.getItem("meska-last-lead");
  } catch {
    return null;
  }

  const parsed = parseJsonRecord(contextRaw);
  const leadId = typeof parsed?.leadId === "string" ? parsed.leadId.trim() : "";
  const diplomaSlug = parsed?.diplomaSlug;
  const storedAt = parsed?.storedAt;
  const contextIsCurrent =
    leadId.length > 0 &&
    leadId.length <= 100 &&
    (diplomaSlug === "offline" || diplomaSlug === "online") &&
    typeof storedAt === "number" &&
    Number.isFinite(storedAt) &&
    storedAt <= now + 5 * 60 * 1000 &&
    now - storedAt <= ADVISOR_CONTEXT_MAX_AGE_MS;
  const matchingLead = [pendingRaw, lastLeadRaw]
    .map(parseLeadState)
    .some(
      (lead) =>
        lead?.eventId === leadId && lead.variant === diplomaSlug,
    );

  if (!contextIsCurrent || !matchingLead) {
    try {
      storage.removeItem(DIPLOMA_ADVISOR_CONTEXT_KEY);
    } catch {
      // Restricted privacy contexts may make session storage unavailable.
    }
    return null;
  }

  return {
    leadId,
    firstName: cleanFirstName(parsed?.firstName),
    diplomaSlug,
    storedAt,
  } satisfies DiplomaAdvisorContext;
}

export function buildAdvisorInitialMessages(context: DiplomaAdvisorContext) {
  const diplomaLabel =
    context.diplomaSlug === "online" ? "Online Diploma" : "Offline Diploma";
  return [
    context.firstName
      ? `Hi ${context.firstName} — your enquiry is in.`
      : `Your enquiry for the ${diplomaLabel} is in.`,
    `I can help with the ${diplomaLabel}, schedule, payment options, and enrollment next steps.`,
  ];
}

export function shouldAutoOpenAdvisor({
  status,
  hasContext,
  openedThisMount,
  storedOpenState,
}: {
  status: ChatbaseStatus;
  hasContext: boolean;
  openedThisMount: boolean;
  storedOpenState: string | null;
}) {
  return (
    status === "ready" &&
    hasContext &&
    !openedThisMount &&
    !storedOpenState
  );
}

export function isChatbaseRoute(pathname: string) {
  return pathname === CHATBASE_ROUTE_PATHNAME;
}

export function isChatbaseInitialized() {
  if (typeof window === "undefined" || !window.chatbase) return false;
  try {
    return window.chatbase("getState") === "initialized";
  } catch {
    return false;
  }
}

export function getChatbaseApi() {
  return typeof window === "undefined" ? undefined : window.chatbase;
}

export function getChatbaseStatus(): ChatbaseStatus {
  if (typeof window === "undefined") return "loading";
  return window.__MESKA_CHATBASE_STATUS__ ?? "loading";
}

export function setChatbaseStatus(status: ChatbaseStatus) {
  if (typeof window === "undefined") return;
  window.__MESKA_CHATBASE_STATUS__ = status;
  document.documentElement.dataset.chatbaseStatus = status;
  window.dispatchEvent(
    new CustomEvent(CHATBASE_STATUS_EVENT, { detail: { status } }),
  );
}

export function getAdvisorOpenState() {
  if (typeof window === "undefined") return null;
  try {
    return window.sessionStorage.getItem(DIPLOMA_ADVISOR_AUTO_OPEN_KEY);
  } catch {
    return null;
  }
}

export function markAdvisorOpenState(source: "automatic" | "manual") {
  if (typeof window === "undefined") return false;
  try {
    window.sessionStorage.setItem(DIPLOMA_ADVISOR_AUTO_OPEN_KEY, source);
    return true;
  } catch {
    return false;
  }
}
