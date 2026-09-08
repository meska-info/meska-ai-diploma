import type { DiplomaId } from "../content";
import type { SafeAiCloserEvent } from "./aiCloser";
import type { VerifiedDiplomaSession } from "./diplomaSession";

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
