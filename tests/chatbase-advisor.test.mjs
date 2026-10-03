import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { siteContent } from "../app/content.ts";
import { buildVerifiedAdvisorMessages } from "../app/lib/aiCloser.ts";
import {
  configureAdvisorWelcome,
  CHATBASE_AGENT_ID,
  CHATBASE_EMBED_SCRIPT,
  CHATBASE_SCRIPT_SRC,
  DIPLOMA_ADVISOR_CONTEXT_KEY,
  isChatbaseRoute,
  resolveDiplomaAdvisorContext,
  serializeDiplomaAdvisorContext,
  shouldAutoOpenAdvisor,
} from "../app/lib/chatbase.ts";

test("keeps the existing Chatbase embed exact and limits it to the thank-you route", () => {
  assert.equal(CHATBASE_AGENT_ID, "lui2mOdc0S4TJNx3RrGqi");
  assert.equal(CHATBASE_SCRIPT_SRC, "https://www.chatbase.co/embed.min.js");
  assert.equal(
    CHATBASE_EMBED_SCRIPT,
    `(function(){if(!window.chatbase||window.chatbase("getState")!=="initialized"){window.chatbase=(...arguments)=>{if(!window.chatbase.q){window.chatbase.q=[]}window.chatbase.q.push(arguments)};window.chatbase=new Proxy(window.chatbase,{get(target,prop){if(prop==="q"){return target.q}return(...args)=>target(prop,...args)}})}const onLoad=function(){const script=document.createElement("script");script.src="https://www.chatbase.co/embed.min.js";script.id="lui2mOdc0S4TJNx3RrGqi";script.domain="www.chatbase.co";document.body.appendChild(script)};if(document.readyState==="complete"){onLoad()}else{window.addEventListener("load",onLoad)}})();`,
  );
  assert.equal(isChatbaseRoute("/thank-you"), true);
  assert.equal(isChatbaseRoute("/"), false);
  assert.equal(isChatbaseRoute("/preview/desktop"), false);
});

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

test("recaps the selected Diploma without asserting discount validity or delivery", () => {
  const messages = buildVerifiedAdvisorMessages(null, {
    firstName: "Mariam",
    diplomaSlug: "online",
    currentOffer: siteContent.diplomas.online,
  });
  const copy = messages.join(" ");

  assert.match(copy, /Mariam/);
  assert.match(copy, /AI Copilot Diploma — Online/);
  for (const topic of ["prompting", "AI tools", "assistants", "automation", "agents", "content", "8-week", "mentored group project", "lifetime LMS"]) {
    assert.ok(copy.includes(topic), topic);
  }
  assert.match(copy, /Full tuition: EGP 20,000/);
  assert.match(copy, /Check WhatsApp.*10% code/);
  assert.match(copy, /validity needs confirmation/);
  assert.doesNotMatch(copy, /sent|delivered|valid until|https?:|lead-123|Claude/);
  assert.ok(copy.endsWith("If you have any other questions, ask me here."));
  assert.equal(messages.length, 2);
});

const readyContext = {
  schemaVersion: "1",
  leadVerified: true,
  firstName: "Mariam",
  diplomaSlug: "online",
  offerState: "offer_ready",
  offer: {
    discountPercent: 10,
    discountCode: "PRIVATE-NEVER-DISPLAY",
    startsAt: "2026-10-04T12:00:00Z",
    expiresAt: "2026-10-05T12:00:00Z",
  },
  safeMessage: "ready",
};

test("uses only matching content prices and verified discounts, without exposing codes", () => {
  for (const [slug, full, discounted] of [["online", "20,000", "18,000"], ["offline", "25,000", "22,500"]]) {
    const copy = buildVerifiedAdvisorMessages(
      { ...readyContext, diplomaSlug: slug },
      { currentOffer: siteContent.diplomas[slug] },
    ).join(" ");
    assert.ok(copy.includes(`full tuition: EGP ${full}`));
    assert.ok(copy.includes(`With a valid code: EGP ${discounted}`));
    assert.match(copy, /5 Oct 2026, 15:00 \(Cairo time\)/);
    assert.doesNotMatch(copy, /PRIVATE-NEVER-DISPLAY|https?:|12 hours|24 hours/);
  }
  const mismatch = buildVerifiedAdvisorMessages(readyContext, {
    currentOffer: siteContent.diplomas.offline,
  }).join(" ");
  assert.doesNotMatch(mismatch, /EGP/);
});

test("expired and unknown discounts never advertise discounted tuition", () => {
  for (const offerState of ["expired", "offer_pending", "unavailable"]) {
    const copy = buildVerifiedAdvisorMessages(
      { ...readyContext, offerState },
      { currentOffer: siteContent.diplomas.online },
    ).join(" ");
    assert.match(copy, /Full tuition: EGP 20,000/);
    assert.doesNotMatch(copy, /18,000|With a valid code|It expires|PRIVATE-NEVER-DISPLAY/);
    if (offerState === "expired") assert.match(copy, /window has ended/);
  }
  const unverified = buildVerifiedAdvisorMessages(
    { ...readyContext, leadVerified: false },
  ).join(" ");
  assert.doesNotMatch(unverified, /Mariam|— Online|EGP|It expires/);
});

test("missing format or offer cannot invent tuition or checkout", () => {
  for (const options of [{}, { diplomaSlug: "online" }, { currentOffer: siteContent.diplomas.online }]) {
    const copy = buildVerifiedAdvisorMessages(null, options).join(" ");
    assert.match(copy, /^Hi 👋/);
    assert.doesNotMatch(copy, /EGP|https?:|What's your name|Online or Offline/);
    assert.match(copy, /enrollment availability must be confirmed/);
  }
  const noSession = buildVerifiedAdvisorMessages(null, {
    applicationReceived: false,
  }).join(" ");
  assert.doesNotMatch(noSession, /received your application|EGP|https?:/);
  assert.match(noSession, /If you have a personal 10% code/);
});

test("discount readiness and a graduation date cannot establish enrollment eligibility", () => {
  for (const extra of [
    { join_until: "2026-09-01", offer_validity_date: "2027-01-10" },
    { paymentFailure: true },
    { enrollmentEligible: true },
  ]) {
    const copy = buildVerifiedAdvisorMessages(
      { ...readyContext, ...extra },
      { currentOffer: { ...siteContent.diplomas.online, ...extra } },
    ).join(" ");
    // These fields are not exposed by the existing trusted context contract.
    assert.doesNotMatch(copy, /https?:|try again|pay now/i);
  }
});

test("both languages fit the Chatbase limit, including the maximum first name", () => {
  for (const language of ["en", "ar"]) {
    for (const diplomaSlug of ["online", "offline"]) {
      for (const offerState of ["offer_ready", "expired", "offer_pending", "unavailable"]) {
        const messages = buildVerifiedAdvisorMessages(
          { ...readyContext, firstName: "م".repeat(60), diplomaSlug, offerState },
          { currentOffer: siteContent.diplomas[diplomaSlug], language },
        );
        assert.equal(messages.length, 2);
        assert.ok(messages.reduce((sum, message) => sum + message.length, 0) <= 1000);
        assert.ok(messages.at(-1).endsWith(language === "ar"
          ? "لو عندك أي استفسار تاني، اسألني هنا."
          : "If you have any other questions, ask me here."));
      }
    }
  }
  assert.match(buildVerifiedAdvisorMessages(null, { language: "ar" })[0], /^أهلًا 👋/);
});

test("welcome configuration is once per widget and existing lead identity", () => {
  const calls = [];
  const widget = Object.assign(() => {}, { setOptions: (options) => calls.push(options) });
  configureAdvisorWelcome(widget, "lead-one", ["First recap"]);
  for (let i = 0; i < 5; i++) configureAdvisorWelcome(widget, "lead-one", ["Updated price or render"]);
  assert.deepEqual(calls, [{ initialMessages: ["First recap"], suggestedMessages: [] }]);
  configureAdvisorWelcome(widget, "lead-two", ["Another application"]);
  assert.equal(calls.length, 2);
  const refreshedWidget = Object.assign(() => {}, { setOptions: (options) => calls.push(options) });
  configureAdvisorWelcome(refreshedWidget, "lead-one", ["Runtime override after refresh"]);
  assert.equal(calls.length, 3);
});

test("configuration failures do not mark a widget as configured", () => {
  let attempts = 0;
  const widget = Object.assign(() => {}, { setOptions: () => {
    attempts++;
    if (attempts === 1) throw new Error("not ready");
  } });
  assert.throws(() => configureAdvisorWelcome(widget, "lead-one", ["Recap"]));
  configureAdvisorWelcome(widget, "lead-one", ["Recap"]);
  configureAdvisorWelcome(widget, "lead-one", ["Recap"]);
  assert.equal(attempts, 2);
});

test("the welcome path waits for settled data and widget initialization without a reset", () => {
  const source = readFileSync(new URL("../app/components/DiplomaAdvisor.tsx", import.meta.url), "utf8");
  const welcome = source.slice(source.indexOf("// Declared before the auto-open effect"), source.indexOf("if (!identityReady) return;"));
  assert.match(welcome, /!personalizationSettled/);
  assert.match(welcome, /!isChatbaseInitialized\(\)/);
  assert.match(welcome, /configureAdvisorWelcome\(chatbase, browserContext\?\.leadId \?\? null, initialMessages\)/);
  assert.doesNotMatch(source, /resetChat|resetOptions|setInitialMessages|open\(\{/);
  assert.equal((source.match(/configureAdvisorWelcome\(chatbase/g) ?? []).length, 1);
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
