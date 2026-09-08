import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  buildVerifiedAdvisorMessages,
  formatOfferExpiry,
  isPendingOfferState,
  normalizeAiCloserContext,
  redactSalesText,
  validateAiCloserEvent,
} from "../app/lib/aiCloser.ts";
import {
  CHATBASE_IDENTITY_MAX_AGE_SECONDS,
  createChatbaseVerificationToken,
  createDiplomaSessionToken,
  DIPLOMA_SESSION_COOKIE,
  DIPLOMA_SESSION_MAX_AGE_SECONDS,
  resolveDiplomaSessionFromRequest,
  verifyDiplomaSessionToken,
} from "../app/lib/diplomaSession.ts";
import {
  buildAiCloserEventPayload,
  buildAiCloserHeaders,
  resolveAiCloserWebhookSecret,
} from "../app/lib/aiCloserServer.ts";

const SESSION_SECRET = "test-session-secret-that-is-at-least-32-characters";
const CHATBASE_SECRET = "test-chatbase-verification-secret";
const WEBHOOK_SECRET = "test-ai-closer-webhook-secret";
const REQUEST_ID = "lead-12345678-1234-4234-9234-123456789abc";
const NOW = Date.UTC(2026, 8, 8, 12);

function sessionCookie({ now = NOW, diplomaSlug = "offline" } = {}) {
  const token = createDiplomaSessionToken(
    {
      requestId: REQUEST_ID,
      firstName: "Mariam Hassan",
      diplomaSlug,
    },
    SESSION_SECRET,
    now,
  );
  return `${DIPLOMA_SESSION_COOKIE}=${token}`;
}

function withBridgeEnvironment(run) {
  const before = {
    session: process.env.MESKA_CHATBASE_SESSION_SECRET,
    chatbase: process.env.CHATBASE_VERIFICATION_SECRET,
    closer: process.env.MESKA_AI_CLOSER_WEBHOOK_SECRET,
    lead: process.env.N8N_LEAD_WEBHOOK_SECRET,
  };
  process.env.MESKA_CHATBASE_SESSION_SECRET = SESSION_SECRET;
  process.env.CHATBASE_VERIFICATION_SECRET = CHATBASE_SECRET;
  process.env.MESKA_AI_CLOSER_WEBHOOK_SECRET = WEBHOOK_SECRET;
  delete process.env.N8N_LEAD_WEBHOOK_SECRET;
  return Promise.resolve()
    .then(run)
    .finally(() => {
      const restore = (name, value) => {
        if (value === undefined) delete process.env[name];
        else process.env[name] = value;
      };
      restore("MESKA_CHATBASE_SESSION_SECRET", before.session);
      restore("CHATBASE_VERIFICATION_SECRET", before.chatbase);
      restore("MESKA_AI_CLOSER_WEBHOOK_SECRET", before.closer);
      restore("N8N_LEAD_WEBHOOK_SECRET", before.lead);
    });
}

test("signs a 24-hour HttpOnly session payload and rejects tampering or expiry", () => {
  const token = createDiplomaSessionToken(
    {
      requestId: REQUEST_ID,
      firstName: "  Mariam Hassan  ",
      diplomaSlug: "online",
    },
    SESSION_SECRET,
    NOW,
  );
  const verified = verifyDiplomaSessionToken(token, SESSION_SECRET, NOW);
  assert.equal(verified?.requestId, REQUEST_ID);
  assert.equal(verified?.firstName, "Mariam");
  assert.equal(verified?.diplomaSlug, "online");
  assert.equal(
    (verified?.expiresAt ?? 0) - (verified?.issuedAt ?? 0),
    DIPLOMA_SESSION_MAX_AGE_SECONDS,
  );

  const tampered = `${token.slice(0, -1)}${token.endsWith("a") ? "b" : "a"}`;
  assert.equal(verifyDiplomaSessionToken(tampered, SESSION_SECRET, NOW), null);
  assert.equal(
    verifyDiplomaSessionToken(
      token,
      SESSION_SECRET,
      NOW + DIPLOMA_SESSION_MAX_AGE_SECONDS * 1000,
    ),
    null,
  );
});

test("creates the documented HS256 Chatbase JWT with the verified requestId", () => {
  const session = verifyDiplomaSessionToken(
    sessionCookie().split("=")[1],
    SESSION_SECRET,
    NOW,
  );
  assert.ok(session);
  const token = createChatbaseVerificationToken(session, CHATBASE_SECRET, NOW);
  const [encodedHeader, encodedPayload, signature] = token.split(".");
  const header = JSON.parse(Buffer.from(encodedHeader, "base64url").toString());
  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
  const expectedSignature = createHmac("sha256", CHATBASE_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  assert.deepEqual(header, { alg: "HS256", typ: "JWT" });
  assert.equal(payload.user_id, REQUEST_ID);
  assert.equal(payload.exp - payload.iat, CHATBASE_IDENTITY_MAX_AGE_SECONDS);
  assert.equal(signature, expectedSignature);
});

test("identity derivation ignores arbitrary query requestId and never returns secrets", async () => {
  await withBridgeEnvironment(async () => {
    const request = new Request(
      "https://diploma.meska.ai/api/chatbase-session?requestId=lead-attacker-1234567890",
      { headers: { cookie: sessionCookie() } },
    );
    const session = resolveDiplomaSessionFromRequest(request, SESSION_SECRET, NOW);
    assert.ok(session);
    const token = createChatbaseVerificationToken(
      session,
      CHATBASE_SECRET,
      NOW,
    );
    const payload = JSON.parse(
      Buffer.from(token.split(".")[1], "base64url").toString(),
    );
    assert.equal(payload.user_id, REQUEST_ID);
    assert.equal(session.firstName, "Mariam");
    assert.equal(session.diplomaSlug, "offline");
    assert.doesNotMatch(token, new RegExp(SESSION_SECRET));
    assert.doesNotMatch(token, new RegExp(CHATBASE_SECRET));
  });
});

test("identity derivation safely rejects a missing or stale signed session", async () => {
  await withBridgeEnvironment(async () => {
    const missing = resolveDiplomaSessionFromRequest(
      new Request("https://diploma.meska.ai/api/chatbase-session"),
      SESSION_SECRET,
      NOW,
    );
    assert.equal(missing, null);

    const stale = resolveDiplomaSessionFromRequest(
      new Request("https://diploma.meska.ai/api/chatbase-session", {
        headers: {
          cookie: sessionCookie({
            now: NOW - DIPLOMA_SESSION_MAX_AGE_SECONDS * 1000,
          }),
        },
      }),
      SESSION_SECRET,
      NOW,
    );
    assert.equal(stale, null);
  });
});

test("proxy headers derive identity from the signed session and stay server-only", async () => {
  await withBridgeEnvironment(async () => {
    const session = resolveDiplomaSessionFromRequest(
      new Request(
        "https://diploma.meska.ai/api/ai-closer/context?requestId=lead-attacker-1234567890",
        { headers: { cookie: sessionCookie() } },
      ),
      SESSION_SECRET,
      NOW,
    );
    assert.ok(session);
    const headers = buildAiCloserHeaders(
      session,
      WEBHOOK_SECRET,
      "lui2mOdc0S4TJNx3RrGqi",
    );
    assert.equal(headers["X-Meska-Verified-Request-Id"], REQUEST_ID);
    assert.equal(
      headers["X-Meska-Chatbase-Agent-Id"],
      "lui2mOdc0S4TJNx3RrGqi",
    );
    assert.equal(headers["X-Meska-Webhook-Secret"], WEBHOOK_SECRET);
    assert.equal(resolveAiCloserWebhookSecret(), WEBHOOK_SECRET);
  });
});

test("event proxy input rejects identity injection and builds only a verified event", async () => {
  await withBridgeEnvironment(async () => {
    assert.equal(
      validateAiCloserEvent({
        event: "chat_started",
        eventId: "chat-valid-1234",
        occurredAt: new Date(NOW).toISOString(),
        requestId: "lead-attacker-1234567890",
      }, NOW),
      null,
    );
    const event = validateAiCloserEvent(
      {
        event: "chat_started",
        eventId: "chat-valid-5678",
        occurredAt: new Date(NOW).toISOString(),
        summary: "I would like to know the schedule.",
      },
      NOW,
    );
    assert.ok(event);
    const payload = buildAiCloserEventPayload(event, "online");
    assert.equal(payload.diplomaSlug, "online");
    assert.equal(payload.requestId, undefined);
    assert.equal(payload.conversationId, undefined);
  });
});

test("server routes do not read requestId from URL or browser event bodies", () => {
  const identityRoute = readFileSync(
    new URL("../app/api/chatbase-session/route.ts", import.meta.url),
    "utf8",
  );
  const contextRoute = readFileSync(
    new URL("../app/api/ai-closer/context/route.ts", import.meta.url),
    "utf8",
  );
  const eventRoute = readFileSync(
    new URL("../app/api/ai-closer/event/route.ts", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(identityRoute, /searchParams|request\.json\(\)|requestId/);
  assert.doesNotMatch(contextRoute, /searchParams|request\.json\(\)|requestId/);
  assert.doesNotMatch(eventRoute, /searchParams/);
  assert.match(eventRoute, /validateAiCloserEvent\(JSON\.parse\(rawBody\)/);
  assert.match(contextRoute, /buildAiCloserHeaders\(session, webhookSecret, CHATBASE_AGENT_ID\)/);
  assert.match(eventRoute, /buildAiCloserHeaders\(session, webhookSecret, CHATBASE_AGENT_ID\)/);
});

test("event validation excludes unsupported and fabricated automation events", () => {
  const base = {
    eventId: "chat-valid-9012",
    occurredAt: new Date(NOW).toISOString(),
  };
  assert.equal(validateAiCloserEvent({ ...base, event: "chat_auto_opened" }, NOW), null);
  assert.equal(validateAiCloserEvent({ ...base, event: "conversion" }, NOW), null);
  assert.equal(
    validateAiCloserEvent(
      { ...base, event: "chat_message", leadId: "fake-lead" },
      NOW,
    ),
    null,
  );
  assert.equal(
    validateAiCloserEvent({ ...base, event: "chat_message" }, NOW)?.conversationId,
    undefined,
  );
});

test("offer normalization never invents ready, coupon, percentage, or expiry", () => {
  const pending = normalizeAiCloserContext(
    {
      schema_version: "1",
      lead_verified: true,
      first_name: "Mariam",
      diploma_slug: "online",
      offer_state: "offer_pending",
      offer: null,
    },
    "online",
    NOW,
  );
  assert.equal(pending.offerState, "offer_pending");
  assert.equal(pending.offer, null);
  assert.doesNotMatch(buildVerifiedAdvisorMessages(pending).join(" "), /coupon|%/i);

  const invalidReady = normalizeAiCloserContext(
    {
      schema_version: "1",
      lead_verified: true,
      diploma_slug: "online",
      offer_state: "offer_ready",
      offer: { discount_percent: 10, discount_code: "CODE" },
    },
    "online",
    NOW,
  );
  assert.equal(invalidReady.offerState, "unavailable");
  assert.equal(invalidReady.offer, null);

  const validReady = normalizeAiCloserContext(
    {
      schema_version: "1",
      lead_verified: true,
      first_name: "Mariam",
      diploma_slug: "online",
      offer_state: "offer_ready",
      offer: {
        discount_percent: 12,
        discount_code: "VERIFIED12",
        expires_at: new Date(NOW + 60_000).toISOString(),
      },
    },
    "online",
    NOW,
  );
  assert.equal(validReady.offerState, "offer_ready");
  assert.equal(validReady.offer?.discountPercent, 12);
  assert.equal(validReady.offer?.discountCode, "VERIFIED12");
});

test("redacts contact details a visitor retypes in chat", () => {
  const redacted = redactSalesText(
    "email me at Sara.Ali+diploma@example.com or call 01001234567, see https://x.test/a",
  );
  assert.doesNotMatch(redacted, /example\.com/);
  assert.doesNotMatch(redacted, /01001234567/);
  assert.doesNotMatch(redacted, /https:/);
  assert.match(redacted, /\[email\]/);
  assert.match(redacted, /\[number\]/);
  assert.match(redacted, /\[link\]/);

  // Prices and wave numbers stay readable for the sales team.
  assert.equal(redactSalesText("the diploma is 45000 EGP"), "the diploma is 45000 EGP");
  assert.equal(redactSalesText(""), undefined);
  assert.equal(redactSalesText(null), undefined);
  assert.equal(redactSalesText("x".repeat(400)).length, 200);
});

test("offer expiry reaches the visitor as readable Cairo time, never raw ISO", () => {
  const expiresAt = "2026-09-09T18:33:00.000Z";
  const formatted = formatOfferExpiry(expiresAt);
  assert.ok(formatted);
  assert.doesNotMatch(formatted, /T\d{2}:\d{2}|Z$/);
  assert.equal(formatOfferExpiry(undefined), undefined);
  assert.equal(formatOfferExpiry("not-a-date"), undefined);

  const ready = normalizeAiCloserContext(
    {
      schema_version: "1",
      lead_verified: true,
      first_name: "Sara",
      diploma_slug: "offline",
      offer_state: "offer_ready",
      offer: { discount_percent: 10, discount_code: "MESKA-TEST", expires_at: expiresAt },
      safe_message: "ready",
    },
    "offline",
    Date.UTC(2026, 8, 8, 12),
  );
  const messages = buildVerifiedAdvisorMessages(ready).join(" ");
  assert.match(messages, /10%/);
  assert.match(messages, /MESKA-TEST/);
  assert.doesNotMatch(messages, /2026-09-09T18:33/);
});

test("a pending offer keeps polling and never advertises a discount", () => {
  const pending = normalizeAiCloserContext(
    {
      schema_version: "1",
      lead_verified: true,
      first_name: "Sara",
      diploma_slug: "online",
      offer_state: "offer_pending",
      offer: null,
      safe_message: "still being prepared",
    },
    "online",
  );
  assert.equal(isPendingOfferState(pending), true);
  assert.doesNotMatch(buildVerifiedAdvisorMessages(pending).join(" "), /%|code/i);

  // Terminal and unverified states must stop the poll loop.
  assert.equal(isPendingOfferState(null), false);
  assert.equal(
    isPendingOfferState({ leadVerified: false, offerState: "offer_pending" }),
    false,
  );
  assert.equal(
    isPendingOfferState({ leadVerified: true, offerState: "unavailable" }),
    false,
  );
});

test("auto-open never stalls behind a slow or failed AI Closer", () => {
  const advisor = readFileSync(
    new URL("../app/components/DiplomaAdvisor.tsx", import.meta.url),
    "utf8",
  );

  // The popup opens once personalization settles OR the deadline passes, so a
  // missing secret, a stale session, or a slow n8n can no longer suppress it.
  assert.match(advisor, /personalizationResolved \|\| autoOpenDeadlineReached/);
  assert.match(advisor, /status === "unavailable"/);

  // A verified offer is required for personalized copy, never for opening.
  assert.doesNotMatch(
    advisor,
    /hasContext:\s*Boolean\(\s*\n?\s*identityReady/,
  );

  // Raw visitor text is masked before it leaves the browser.
  assert.match(advisor, /summary: redactSalesText\(content\)/);
  assert.doesNotMatch(advisor, /summary: content/);
});
