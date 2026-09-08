import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAdvisorInitialMessages,
  DIPLOMA_ADVISOR_CONTEXT_KEY,
  resolveDiplomaAdvisorContext,
  serializeDiplomaAdvisorContext,
  shouldAutoOpenAdvisor,
} from "../app/lib/chatbase.ts";

class MemoryStorage {
  constructor(entries = {}) {
    this.values = new Map(Object.entries(entries));
  }

  getItem(key) {
    return this.values.get(key) ?? null;
  }

  removeItem(key) {
    this.values.delete(key);
  }
}

test("resolves minimal advisor context only for the matching persisted lead", () => {
  const now = Date.UTC(2026, 8, 8, 12);
  const leadId = "lead-123";
  const storage = new MemoryStorage({
    [DIPLOMA_ADVISOR_CONTEXT_KEY]: serializeDiplomaAdvisorContext({
      leadId,
      firstName: "  Mariam  ",
      diplomaSlug: "online",
      storedAt: now,
    }),
    "meska-last-lead": JSON.stringify({ eventId: leadId, variant: "online" }),
  });

  assert.deepEqual(resolveDiplomaAdvisorContext(storage, now), {
    leadId,
    firstName: "Mariam",
    diplomaSlug: "online",
    storedAt: now,
  });
});

test("rejects and removes advisor context attached to a different lead", () => {
  const now = Date.UTC(2026, 8, 8, 12);
  const storage = new MemoryStorage({
    [DIPLOMA_ADVISOR_CONTEXT_KEY]: serializeDiplomaAdvisorContext({
      leadId: "lead-new",
      firstName: "Mariam",
      diplomaSlug: "online",
      storedAt: now,
    }),
    "meska-last-lead": JSON.stringify({
      eventId: "lead-previous",
      variant: "online",
    }),
  });

  assert.equal(resolveDiplomaAdvisorContext(storage, now), null);
  assert.equal(storage.getItem(DIPLOMA_ADVISOR_CONTEXT_KEY), null);
});

test("rejects expired or malformed advisor context without blocking the page", () => {
  const now = Date.UTC(2026, 8, 8, 12);
  const expiredStorage = new MemoryStorage({
    [DIPLOMA_ADVISOR_CONTEXT_KEY]: serializeDiplomaAdvisorContext({
      leadId: "lead-123",
      diplomaSlug: "offline",
      storedAt: now - 25 * 60 * 60 * 1000,
    }),
    "meska-pending-lead": JSON.stringify({
      eventId: "lead-123",
      variant: "offline",
    }),
  });
  const malformedStorage = new MemoryStorage({
    [DIPLOMA_ADVISOR_CONTEXT_KEY]: "not-json",
  });

  assert.equal(resolveDiplomaAdvisorContext(expiredStorage, now), null);
  assert.equal(resolveDiplomaAdvisorContext(malformedStorage, now), null);
});

test("builds truthful initial messages without raw contact details or offers", () => {
  const messages = buildAdvisorInitialMessages({
    leadId: "lead-123",
    firstName: "Mariam",
    diplomaSlug: "online",
    storedAt: Date.UTC(2026, 8, 8, 12),
  });
  const copy = messages.join(" ");

  assert.match(copy, /Mariam/);
  assert.match(copy, /Online Diploma/);
  assert.doesNotMatch(copy, /lead-123|discount|coupon|expires/i);
});

test("allows one automatic open only when the widget and lead context are ready", () => {
  const ready = {
    status: "ready",
    hasContext: true,
    openedThisMount: false,
    storedOpenState: null,
  };

  assert.equal(shouldAutoOpenAdvisor(ready), true);
  assert.equal(
    shouldAutoOpenAdvisor({ ...ready, storedOpenState: "automatic" }),
    false,
  );
  assert.equal(
    shouldAutoOpenAdvisor({ ...ready, storedOpenState: "manual" }),
    false,
  );
  assert.equal(
    shouldAutoOpenAdvisor({ ...ready, openedThisMount: true }),
    false,
  );
  assert.equal(shouldAutoOpenAdvisor({ ...ready, hasContext: false }), false);
  assert.equal(
    shouldAutoOpenAdvisor({ ...ready, status: "loading" }),
    false,
  );
});
