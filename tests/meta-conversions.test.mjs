import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  buildLeadConversionEvent,
  hashPhone,
  sendLeadConversion,
} from "../app/lib/metaConversions.ts";

const sha = (value) => createHash("sha256").update(value).digest("hex");
const lead = {
  request_id: "lead-123",
  created_at: new Date().toISOString(),
  name: "Ahmed Mohamed Zaki",
  email: " Ahmed@Example.org ",
  mobile: "+201012345678",
  diploma_slug: "offline",
  programme_price_value: 25000,
  attribution: { fbclid: "abc" },
  capi_context: {
    fbp: "fb.1.1700000000000.123",
    client_ip_address: "41.33.1.1",
    client_user_agent: "Mozilla/5.0",
    event_source_url: "https://diploma.meska.ai/?utm_source=meta",
  },
};

test("server Lead uses the browser event id and hashes personal data", () => {
  const event = buildLeadConversionEvent(lead);
  assert.equal(event.event_name, "Lead");
  assert.equal(event.event_id, "lead-123");
  assert.equal(event.action_source, "website");
  assert.equal(event.event_source_url, "https://diploma.meska.ai/?utm_source=meta");
  assert.deepEqual(event.user_data.em, [sha("ahmed@example.org")]);
  assert.deepEqual(event.user_data.ph, [sha("201012345678")]);
  assert.deepEqual(event.user_data.fn, [sha("ahmed")]);
  assert.deepEqual(event.user_data.ln, [sha("zaki")]);
  assert.equal(event.user_data.fbp, "fb.1.1700000000000.123");
  assert.match(event.user_data.fbc, /^fb\.1\.\d+\.abc$/);
  assert.equal(event.user_data.client_ip_address, "41.33.1.1");
  assert.equal(event.user_data.client_user_agent, "Mozilla/5.0");
  assert.deepEqual(event.custom_data, {
    currency: "EGP",
    value: 25000,
    content_name: "offline",
    content_category: "professional_diploma",
  });
  const serialized = JSON.stringify(event);
  for (const plain of ["ahmed@example.org", "201012345678", "Ahmed", "Zaki"]) {
    assert.ok(!serialized.includes(plain), `${plain} must not be sent unhashed`);
  }
});

test("phone hash uses digits with country code", () => {
  assert.equal(hashPhone("+20 101 234 5678"), sha("201012345678"));
  assert.equal(hashPhone("00201012345678"), sha("201012345678"));
});

test("sends to the pixel with the token and requires events_received", async () => {
  process.env.META_CONVERSIONS_TOKEN = "test-token";
  let calledUrl = "";
  let calledBody = null;
  await sendLeadConversion(lead, async (url, init) => {
    calledUrl = String(url);
    calledBody = JSON.parse(init.body);
    return new Response(JSON.stringify({ events_received: 1 }), { status: 200 });
  });
  assert.match(calledUrl, /graph\.facebook\.com\/v\d+\.0\/1982493002344234\/events\?access_token=test-token/);
  assert.equal(calledBody.data[0].event_id, "lead-123");
  await assert.rejects(
    sendLeadConversion(lead, async () => new Response(JSON.stringify({ error: { code: 190 } }), { status: 400 })),
    /meta_capi_400_190/,
  );
  delete process.env.META_CONVERSIONS_TOKEN;
  await assert.rejects(sendLeadConversion(lead, async () => new Response("{}")), /token_missing/);
});

test("events older than 7 days are not sent", async () => {
  process.env.META_CONVERSIONS_TOKEN = "test-token";
  const old = { ...lead, created_at: new Date(Date.now() - 8 * 86400000).toISOString() };
  await assert.rejects(sendLeadConversion(old, async () => new Response("{}")), /too_old/);
  delete process.env.META_CONVERSIONS_TOKEN;
});
