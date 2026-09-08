import { NextResponse } from "next/server";
import { CHATBASE_AGENT_ID } from "../../../lib/chatbase";
import {
  AI_CLOSER_CONTEXT_ENDPOINT,
  normalizeAiCloserContext,
} from "../../../lib/aiCloser";
import {
  buildAiCloserHeaders,
  resolveAiCloserWebhookSecret,
} from "../../../lib/aiCloserServer";
import { resolveDiplomaSessionFromRequest } from "../../../lib/diplomaSession";

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Vary: "Cookie",
};
const MAX_RESPONSE_BYTES = 20_000;
const REQUEST_TIMEOUT_MS = 8_000;

export async function GET(request: Request) {
  const session = resolveDiplomaSessionFromRequest(request);
  if (!session) {
    return NextResponse.json(
      { error: "Verified Diploma session required" },
      { status: 401, headers: RESPONSE_HEADERS },
    );
  }

  const webhookSecret = resolveAiCloserWebhookSecret();
  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Advisor context unavailable" },
      { status: 503, headers: RESPONSE_HEADERS },
    );
  }

  try {
    const upstream = await fetch(AI_CLOSER_CONTEXT_ENDPOINT, {
      method: "GET",
      headers: {
        Accept: "application/json",
        ...buildAiCloserHeaders(session, webhookSecret, CHATBASE_AGENT_ID),
      },
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!upstream.ok) throw new Error("ai_closer_context_rejected");
    const responseText = await upstream.text();
    if (Buffer.byteLength(responseText, "utf8") > MAX_RESPONSE_BYTES) {
      throw new Error("ai_closer_context_too_large");
    }
    const context = normalizeAiCloserContext(
      JSON.parse(responseText) as unknown,
      session.diplomaSlug,
    );
    return NextResponse.json(context, { headers: RESPONSE_HEADERS });
  } catch {
    return NextResponse.json(
      { error: "Advisor context unavailable" },
      { status: 502, headers: RESPONSE_HEADERS },
    );
  }
}
