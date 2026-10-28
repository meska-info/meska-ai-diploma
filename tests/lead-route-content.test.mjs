import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { defaultLeadMagnet, leadMagnets, siteContent } from "../app/content.ts";
import { resolveProgrammeContext } from "../app/lib/programmeContext.ts";

const route = readFileSync(new URL("../app/api/leads/route.ts", import.meta.url), "utf8");
const sections = readFileSync(new URL("../app/components/sections.tsx", import.meta.url), "utf8");

// Exactly what LeadCapture posts for each format.
function posted(slug) {
  const diploma = siteContent.diplomas[slug];
  return {
    programmePrice: diploma.price,
    programmePriceValue: diploma.priceValue,
    currentWave: diploma.wave,
    currentWaveStartDate: diploma.startDate,
    leadMagnet: defaultLeadMagnet,
  };
}

for (const slug of ["offline", "online"]) {
  test(`form values for ${slug} match the lead API with no drift`, () => {
    const result = resolveProgrammeContext(siteContent.diplomas, slug, posted(slug), leadMagnets);
    assert.ok(result);
    assert.deepEqual(result.drift, []);
    assert.equal(result.facts.wave, siteContent.diplomas[slug].wave);
    assert.equal(result.facts.startDate, siteContent.diplomas[slug].startDate);
    assert.equal(result.leadMagnet, "free-ai-agent-guide");
  });
}

test("a wave change in content.ts alone keeps leads flowing (single source)", () => {
  const changed = structuredClone(siteContent.diplomas);
  changed.offline.wave = "Wave 17";
  changed.offline.startDate = "1 January 2027";
  const fromNewPage = {
    ...posted("offline"),
    currentWave: "Wave 17",
    currentWaveStartDate: "1 January 2027",
  };
  const result = resolveProgrammeContext(changed, "offline", fromNewPage, leadMagnets);
  assert.deepEqual(result.drift, []);
});

test("a stale page is reported as content_drift but still resolved to current facts", () => {
  const stale = { ...posted("offline"), currentWave: "Wave 1", programmePriceValue: 1 };
  const result = resolveProgrammeContext(siteContent.diplomas, "offline", stale, leadMagnets);
  assert.ok(result);
  assert.deepEqual(result.drift.map((item) => item.field).sort(), ["currentWave", "programmePriceValue"]);
  assert.equal(result.facts.wave, siteContent.diplomas.offline.wave);
  assert.equal(result.facts.priceValue, siteContent.diplomas.offline.priceValue);
});

test("unknown lead magnet falls back to the allowed one and is reported", () => {
  const result = resolveProgrammeContext(
    siteContent.diplomas,
    "online",
    { ...posted("online"), leadMagnet: "something-else" },
    leadMagnets,
  );
  assert.equal(result.leadMagnet, "free-ai-agent-guide");
  assert.equal(result.drift[0].field, "leadMagnet");
});

test("unknown diploma is rejected", () => {
  assert.equal(resolveProgrammeContext(siteContent.diplomas, "hybrid", posted("offline"), leadMagnets), null);
});

test("the lead API has no hard-coded wave, price or date", () => {
  for (const pattern of [/Wave \d+/, /EGP \d/, /November 2026/, /25000|20000/, /"free-ai-agent-guide"/]) {
    assert.doesNotMatch(route, pattern);
  }
  assert.match(route, /resolveProgrammeContext\(\s*siteContent\.diplomas/);
  assert.match(route, /code: "content_drift"/);
  assert.match(sections, /leadMagnet: defaultLeadMagnet/);
  assert.match(sections, /programmePrice: selected\.price/);
  assert.match(sections, /currentWave: selected\.wave/);
  assert.match(sections, /currentWaveStartDate: selected\.startDate/);
});
