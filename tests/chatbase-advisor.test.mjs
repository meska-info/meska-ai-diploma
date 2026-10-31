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

const NOW = Date.UTC(2026, 9, 31, 10);
const readyContext = {
  schemaVersion: "1",
  leadVerified: true,
  firstName: "Mariam",
  diplomaSlug: "online",
  offerState: "offer_ready",
  offer: {
    discountPercent: 10,
    discountCode: "MESKA-PERSONAL-10",
    startsAt: "2026-10-31T10:00:00Z",
    expiresAt: "2026-10-31T22:00:00Z",
  },
  safeMessage: "ready",
};

test("a ready offer renders the approved welcome for the applied format", () => {
  const online = buildVerifiedAdvisorMessages(readyContext, {
    currentOffer: siteContent.diplomas.online,
    now: NOW,
  });
  assert.equal(online.length, 1);
  assert.equal(online[0], [
    "Hi Mariam, **You've earned 10% OFF on the Meska AI Diploma** 🎉",
    "Expires in 12 hours",
    "Meska AI Diploma | Online · Wave 12",
    [
      "👉🏽First session: Sunday, 8th November 2026",
      "👉🏽Duration: 8 weeks",
      "👉🏽Price: EGP 18,000 instead of EGP 20,000",
      "👉🏽Sessions are every Sunday, 7 PM–11 PM",
      "👉🏽Live online, via ZOOM",
    ].join("\n"),
    [
      "**Your discount:** 10% OFF",
      "**Your code:** MESKA-PERSONAL-10",
      "**Offer expires:** 1 Nov 2026, 00:00 (Cairo time)",
    ].join("\n"),
    "Here is your payment link: https://aionline.meska.ai/cart/41309075341358:1?discount=MESKA-PERSONAL-10",
  ].join("\n\n"));

  const offline = buildVerifiedAdvisorMessages(
    { ...readyContext, diplomaSlug: "offline" },
    { currentOffer: siteContent.diplomas.offline, now: NOW },
  )[0];
  assert.match(offline, /Meska AI Diploma \| Offline · Wave 16/);
  assert.match(offline, /👉🏽First session: Saturday, 7th November 2026/);
  assert.match(offline, /👉🏽Price: EGP 22,500 instead of EGP 25,000/);
  assert.match(offline, /👉🏽Sessions are every Saturday, 5 PM–10 PM/);
  assert.match(offline, /👉🏽Venue: Creativa Innovation Hub, Giza/);
  assert.ok(offline.endsWith(`${siteContent.diplomas.offline.checkoutUrl}?discount=MESKA-PERSONAL-10`));
  assert.doesNotMatch(offline, /Online|ZOOM|Sunday/);
  assert.doesNotMatch(online.join(" "), /Offline|Creativa|Saturday/);
});

test("the expiry line counts down from the real offer expiry", () => {
  const at = (hoursBeforeExpiry) => buildVerifiedAdvisorMessages(readyContext, {
    currentOffer: siteContent.diplomas.online,
    now: Date.parse(readyContext.offer.expiresAt) - hoursBeforeExpiry * 60 * 60 * 1000,
  })[0];
  assert.match(at(5), /\n\nExpires in 5 hours\n\n/);
  assert.match(at(1), /\n\nExpires in 1 hour\n\n/);
  assert.match(at(0.2), /\n\nExpires in less than an hour\n\n/);
  // An offer that has already run out never shows a code or a discounted price.
  const lapsed = at(-1);
  assert.doesNotMatch(lapsed, /MESKA-PERSONAL-10|18,000|discount=/);
  assert.match(lapsed, /👉🏽Price: EGP 20,000\n/);
});

test("without a ready offer the welcome keeps the format but never invents a code", () => {
  for (const offerState of ["offer_pending", "unavailable", "expired"]) {
    const copy = buildVerifiedAdvisorMessages(
      { ...readyContext, offerState },
      { currentOffer: siteContent.diplomas.online, now: NOW },
    ).join(" ");
    assert.match(copy, /Meska AI Diploma \| Online · Wave 12/);
    assert.match(copy, /👉🏽Price: EGP 20,000\n/);
    assert.doesNotMatch(copy, /18,000|MESKA-PERSONAL-10|discount=|Expires in/);
    assert.ok(copy.endsWith(`Here is your payment link: ${siteContent.diplomas.online.checkoutUrl}`));
    if (offerState === "expired") assert.match(copy, /discount window has ended/);
    else assert.match(copy, /Check WhatsApp for your personal 10% code/);
  }
  const fromBrowserOnly = buildVerifiedAdvisorMessages(null, {
    firstName: "Mariam",
    diplomaSlug: "offline",
    currentOffer: siteContent.diplomas.offline,
  }).join(" ");
  assert.match(fromBrowserOnly, /^Hi Mariam, we've received your application/);
  assert.match(fromBrowserOnly, /Offline · Wave 16/);
  assert.doesNotMatch(fromBrowserOnly, /confirm/i);
});

test("an unverified, mismatched or missing format never shows tuition, links or codes", () => {
  const unverified = buildVerifiedAdvisorMessages(
    { ...readyContext, leadVerified: false },
  ).join(" ");
  assert.doesNotMatch(unverified, /Mariam|Online|EGP|https?:|MESKA-PERSONAL-10/);
  const mismatch = buildVerifiedAdvisorMessages(readyContext, {
    currentOffer: siteContent.diplomas.offline,
    now: NOW,
  }).join(" ");
  assert.doesNotMatch(mismatch, /EGP|https?:|MESKA-PERSONAL-10/);
  for (const options of [{}, { diplomaSlug: "online" }, { currentOffer: siteContent.diplomas.online }]) {
    const copy = buildVerifiedAdvisorMessages(null, options).join(" ");
    assert.match(copy, /^Hi 👋/);
    assert.doesNotMatch(copy, /EGP|https?:|What's your name|Online or Offline|confirm/i);
  }
  const noSession = buildVerifiedAdvisorMessages(null, {
    applicationReceived: false,
  }).join(" ");
  assert.doesNotMatch(noSession, /received your application|EGP|https?:/);
  assert.match(noSession, /If you have a personal 10% code/);
});

test("the welcome fits the Chatbase limit, including the maximum first name", () => {
  for (const diplomaSlug of ["online", "offline"]) {
    for (const offerState of ["offer_ready", "expired", "offer_pending", "unavailable"]) {
      const messages = buildVerifiedAdvisorMessages(
        { ...readyContext, firstName: "م".repeat(60), diplomaSlug, offerState },
        { currentOffer: siteContent.diplomas[diplomaSlug], now: NOW },
      );
      assert.equal(messages.length, 1);
      assert.ok(messages[0].length <= 1000);
    }
  }
});

test("welcome configuration is once per widget and existing lead identity", () => {
  const calls = [];
  const widget = Object.assign(() => {}, { setOptions: (options) => calls.push(options) });
  configureAdvisorWelcome(widget, "lead-one", ["First recap"]);
  for (let i = 0; i < 5; i++) configureAdvisorWelcome(widget, "lead-one", ["Updated price or render"]);
  // The dashboard's suggested-message buttons are never overridden.
  assert.deepEqual(calls, [{ initialMessages: ["First recap"] }]);
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
