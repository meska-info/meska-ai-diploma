import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const workflowPath = new URL(
  "../n8n/Meska-Shopify-WhatsApp-Cloud-FINAL.json",
  import.meta.url,
);
const workflowSource = readFileSync(workflowPath, "utf8");
const workflow = JSON.parse(workflowSource);
const nodesByName = new Map(workflow.nodes.map((node) => [node.name, node]));

test("final n8n workflow is inactive, Cloud-safe, and credential-unbound", () => {
  assert.equal(workflow.active, false);
  assert.doesNotMatch(workflowSource, /\$env\b/);
  assert.doesNotMatch(workflowSource, /shpat_[A-Za-z0-9]+|sb_secret_[A-Za-z0-9_-]+/);
  assert.doesNotMatch(workflowSource, /Bearer\s+[A-Za-z0-9._-]{20,}/);
  assert.equal(
    workflow.nodes.filter((node) => Object.hasOwn(node, "credentials")).length,
    0,
  );
});

test("webhook uses Header Auth and acknowledges immediately", () => {
  const webhook = nodesByName.get("Lead Created Webhook");
  assert.equal(webhook.parameters.authentication, "headerAuth");
  assert.equal(webhook.parameters.responseMode, "onReceived");
  assert.equal(webhook.parameters.path, "meska-lead-created");
});

test("workflow reserves the lead before recovering or creating Shopify discount", () => {
  assert.ok(nodesByName.has("Supabase — Claim Lead Offer"));
  assert.ok(nodesByName.has("Shopify — Find Discount By Code"));
  assert.ok(nodesByName.has("Shopify — Create 24h Discount"));
  assert.match(
    JSON.stringify(nodesByName.get("Supabase — Claim Lead Offer")),
    /claim_lead_offer/,
  );
  assert.match(
    JSON.stringify(nodesByName.get("Shopify — Create 24h Discount")),
    /discountCodeBasicCreate/,
  );
  assert.match(
    JSON.stringify(nodesByName.get("Shopify — Find Discount By Code")),
    /codeDiscountNodeByCode/,
  );
});

test("workflow sends WhatsApp only after a confirmed Shopify offer", () => {
  const buildPayload = nodesByName.get("Build WhatsApp Template Payload");
  const cequens = nodesByName.get("CEQUENS — Send WhatsApp");
  const markSent = nodesByName.get("Supabase — Mark WhatsApp Sent");

  assert.match(buildPayload.parameters.jsCode, /confirmed Shopify discount/);
  assert.match(buildPayload.parameters.jsCode, /clientReferenceID/);
  assert.match(JSON.stringify(cequens.parameters), /conversation\/wab\/v1\/messages/);
  assert.match(JSON.stringify(markSent.parameters), /whatsapp_sent/);
});

test("transient external calls have bounded retries", () => {
  for (const node of workflow.nodes.filter(
    (candidate) => candidate.type === "n8n-nodes-base.httpRequest",
  )) {
    assert.equal(node.retryOnFail, true, node.name);
    assert.equal(node.maxTries, 3, node.name);
    assert.ok(node.waitBetweenTries >= 1000, node.name);
  }
});
