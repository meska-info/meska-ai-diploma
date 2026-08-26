import assert from "node:assert/strict";
import test from "node:test";

import {
  buildLeadAutomationPayload,
  normalizeMobile,
  triggerLeadAutomation,
} from "../app/lib/leadAutomation.ts";

const persistedLead = {
  id: "57df50a5-5ead-4d3a-bbe9-5b95c2442a5f",
  request_id: "lead_test_001",
  created_at: "2026-08-26T09:00:00.000Z",
  name: "Meska Test Lead",
  email: "lead@example.com",
  mobile: "201012345678",
  diploma_slug: "offline",
  lead_source: "free-ai-agent-guide",
  source_context: "primary",
  attribution: { utm_source: "acceptance-test" },
};

test("normalizes common Egyptian mobile formats", () => {
  assert.equal(normalizeMobile("010 1234 5678"), "201012345678");
  assert.equal(normalizeMobile("+20 10 1234 5678"), "201012345678");
  assert.equal(normalizeMobile("0020 10 1234 5678"), "201012345678");
});

test("builds the webhook contract from the persisted lead", () => {
  assert.deepEqual(buildLeadAutomationPayload(persistedLead), {
    event: "meska.lead.created",
    leadId: persistedLead.id,
    requestId: persistedLead.request_id,
    createdAt: persistedLead.created_at,
    name: persistedLead.name,
    email: persistedLead.email,
    mobile: persistedLead.mobile,
    diplomaSlug: persistedLead.diploma_slug,
    source: persistedLead.lead_source,
    sourceContext: persistedLead.source_context,
    attribution: persistedLead.attribution,
  });
});

test("sends the webhook secret only in the server request header", async () => {
  const previousUrl = process.env.N8N_LEAD_WEBHOOK_URL;
  const previousSecret = process.env.N8N_LEAD_WEBHOOK_SECRET;
  process.env.N8N_LEAD_WEBHOOK_URL = "https://n8n.example/webhook/meska-lead-created";
  process.env.N8N_LEAD_WEBHOOK_SECRET = "test-only-secret";

  let request;
  try {
    await triggerLeadAutomation(persistedLead, async (url, init) => {
      request = { url, init };
      return new Response(null, { status: 202 });
    });
  } finally {
    if (previousUrl === undefined) delete process.env.N8N_LEAD_WEBHOOK_URL;
    else process.env.N8N_LEAD_WEBHOOK_URL = previousUrl;
    if (previousSecret === undefined) delete process.env.N8N_LEAD_WEBHOOK_SECRET;
    else process.env.N8N_LEAD_WEBHOOK_SECRET = previousSecret;
  }

  assert.equal(request.url, "https://n8n.example/webhook/meska-lead-created");
  assert.equal(request.init.headers["X-Meska-Webhook-Secret"], "test-only-secret");
  assert.deepEqual(JSON.parse(request.init.body), buildLeadAutomationPayload(persistedLead));
});

test("fails safely when n8n rejects the authenticated trigger", async () => {
  const previousUrl = process.env.N8N_LEAD_WEBHOOK_URL;
  const previousSecret = process.env.N8N_LEAD_WEBHOOK_SECRET;
  process.env.N8N_LEAD_WEBHOOK_URL = "https://n8n.example/webhook/meska-lead-created";
  process.env.N8N_LEAD_WEBHOOK_SECRET = "test-only-secret";

  try {
    await assert.rejects(
      triggerLeadAutomation(
        persistedLead,
        async () => new Response(null, { status: 503 }),
      ),
      /n8n_webhook_503/,
    );
  } finally {
    if (previousUrl === undefined) delete process.env.N8N_LEAD_WEBHOOK_URL;
    else process.env.N8N_LEAD_WEBHOOK_URL = previousUrl;
    if (previousSecret === undefined) delete process.env.N8N_LEAD_WEBHOOK_SECRET;
    else process.env.N8N_LEAD_WEBHOOK_SECRET = previousSecret;
  }
});
