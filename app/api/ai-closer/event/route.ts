import { NextResponse } from "next/server";
import { CHATBASE_AGENT_ID } from "../../../lib/chatbase";
import {
  AI_CLOSER_EVENT_ENDPOINT,
  validateAiCloserEvent,
} from "../../../lib/aiCloser";
import {
  buildAiCloserEventPayload,
  buildAiCloserHeaders,
  resolveAiCloserWebhookSecret,
} from "../../../lib/aiCloserServer";
import { resolveDiplomaSessionFromRequest } from "../../../lib/diplomaSession";

const RESPONSE_HEADERS = {
  "Cache-Control": "no-store, max-age=0",
  Vary: "Cookie",
};
const REQUEST_TIMEOUT_MS = 8_000;
const MAX_REQUEST_BYTES = 16_000;
const MAX_RESPONSE_BYTES = 20_000;

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const fetchSite = request.headers.get("sec-fetch-site");
  return (
    origin === new URL(request.url).origin &&
    (!fetchSite || fetchSite === "same-origin")
  );
}

export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 403, headers: RESPONSE_HEADERS },
    );
  }
  const contentType = request.headers.get("content-type") ?? "";
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (
    !contentType.toLowerCase().startsWith("application/json") ||
    (Number.isFinite(contentLength) && contentLength > MAX_REQUEST_BYTES)
  ) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 415, headers: RESPONSE_HEADERS },
    );
  }

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
      { error: "Advisor event unavailable" },
      { status: 503, headers: RESPONSE_HEADERS },
    );
  }

  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400, headers: RESPONSE_HEADERS },
    );
  }
  if (Buffer.byteLength(rawBody, "utf8") > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 413, headers: RESPONSE_HEADERS },
    );
  }

  let event;
  try {
    event = validateAiCloserEvent(JSON.parse(rawBody) as unknown);
  } catch {
    event = null;
  }
  if (!event) {
    return NextResponse.json(
      { error: "Invalid sales event" },
      { status: 422, headers: RESPONSE_HEADERS },
    );
  }

  try {
    const upstream = await fetch(AI_CLOSER_EVENT_ENDPOINT, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...buildAiCloserHeaders(session, webhookSecret, CHATBASE_AGENT_ID),
      },
      body: JSON.stringify(
        buildAiCloserEventPayload(event, session.diplomaSlug),
      ),
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
    if (!upstream.ok) throw new Error("ai_closer_event_rejected");
    const responseText = await upstream.text();
    if (Buffer.byteLength(responseText, "utf8") > MAX_RESPONSE_BYTES) {
      throw new Error("ai_closer_event_response_too_large");
    }
    const response = JSON.parse(responseText) as Record<string, unknown>;
    return NextResponse.json(
      {
        ok: response.ok === true,
        duplicate: response.duplicate === true,
      },
      { headers: RESPONSE_HEADERS },
    );
  } catch {
    return NextResponse.json(
      { error: "Advisor event unavailable" },
      { status: 502, headers: RESPONSE_HEADERS },
    );
  }
}
