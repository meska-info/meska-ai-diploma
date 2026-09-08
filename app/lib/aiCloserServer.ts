import type { DiplomaId } from "../content";
import type { SafeAiCloserEvent } from "./aiCloser";
import type { VerifiedDiplomaSession } from "./diplomaSession";

// `new URL(request.url).origin` is the host Next reconstructs, not the one the
// browser addressed, so it does not match Origin behind a custom domain and
// rejected every legitimate sales event. Trust the browser's own CSRF signal,
// and fall back to comparing Origin against the Host actually requested.
export function isSameOriginRequest(request: Request) {
  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite) return fetchSite === "same-origin";

  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export function resolveAiCloserWebhookSecret() {
  return (
    process.env.MESKA_AI_CLOSER_WEBHOOK_SECRET ??
    process.env.N8N_LEAD_WEBHOOK_SECRET
  );
}

export function buildAiCloserHeaders(
  session: VerifiedDiplomaSession,
  webhookSecret: string,
  chatbaseAgentId: string,
) {
  return {
    "X-Meska-Verified-Request-Id": session.requestId,
    "X-Meska-Chatbase-Agent-Id": chatbaseAgentId,
    "X-Meska-Webhook-Secret": webhookSecret,
  };
}

export function buildAiCloserEventPayload(
  event: SafeAiCloserEvent,
  diplomaSlug: DiplomaId,
) {
  return { ...event, diplomaSlug };
}
