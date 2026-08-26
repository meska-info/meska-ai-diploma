import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const outputUrl = new URL("./Meska-Shopify-WhatsApp-Cloud-FINAL.json", import.meta.url);

function codeNode(id, name, position, jsCode) {
  return {
    id,
    name,
    type: "n8n-nodes-base.code",
    typeVersion: 2,
    position,
    parameters: { jsCode },
  };
}

function httpNode(id, name, position, parameters, retryWait = 1000) {
  return {
    id,
    name,
    type: "n8n-nodes-base.httpRequest",
    typeVersion: 4.2,
    position,
    parameters,
    retryOnFail: true,
    maxTries: 3,
    waitBetweenTries: retryWait,
  };
}

function ifNode(id, name, position, leftValue, rightValue, valueType = "string") {
  return {
    id,
    name,
    type: "n8n-nodes-base.if",
    typeVersion: 2.2,
    position,
    parameters: {
      conditions: {
        options: {
          caseSensitive: true,
          leftValue: "",
          typeValidation: "strict",
          version: 2,
        },
        combinator: "and",
        conditions: [
          {
            id: `${id}-condition`,
            leftValue,
            rightValue,
            operator: {
              type: valueType,
              operation: "equals",
            },
          },
        ],
      },
      options: {},
    },
  };
}

const supabaseAuth = {
  authentication: "predefinedCredentialType",
  nodeCredentialType: "supabaseApi",
};

const shopifyAuth = {
  authentication: "genericCredentialType",
  genericAuthType: "httpHeaderAuth",
};

const cequensAuth = {
  authentication: "genericCredentialType",
  genericAuthType: "httpHeaderAuth",
};

const nodes = [
  {
    id: "10e23703-c32d-4fe8-9ba5-ea1014eacb40",
    name: "SETUP — READ ME",
    type: "n8n-nodes-base.stickyNote",
    typeVersion: 1,
    position: [-1040, -520],
    parameters: {
      width: 720,
      height: 420,
      content:
        "## Meska — Shopify 24h Discount → CEQUENS WhatsApp\n\nCloud-safe workflow: no API token or webhook secret is stored in this JSON.\n\n### Select credentials after import\n- Webhook: `Meska Webhook Auth` (`X-Meska-Webhook-Secret`)\n- Supabase HTTP nodes: `Meska Supabase Admin`\n- Shopify HTTP nodes: `Shopify Admin API` (`X-Shopify-Access-Token`)\n- CEQUENS node: `CEQUENS WhatsApp API` (`Authorization: Bearer ...`)\n\n### Enter non-secret values in `CONFIG — Meska Offer`\nThe workflow will fail validation while required config is blank. Keep it inactive until the migration and credentials are complete. Shopify recovery requires `read_discounts`; creation requires `write_discounts`.",
    },
  },
  {
    id: "8223f438-2268-47f3-b47e-eb2942d19b85",
    name: "Lead Created Webhook",
    type: "n8n-nodes-base.webhook",
    typeVersion: 2,
    position: [-1040, 0],
    parameters: {
      httpMethod: "POST",
      path: "meska-lead-created",
      authentication: "headerAuth",
      responseMode: "onReceived",
      options: {},
    },
  },
  {
    id: "98286289-2d38-435a-a0d2-af97d18f2e8a",
    name: "CONFIG — Meska Offer",
    type: "n8n-nodes-base.set",
    typeVersion: 3.4,
    position: [-800, 0],
    parameters: {
      assignments: {
        assignments: [
          {
            id: "config-supabase-url",
            name: "supabaseUrl",
            value: "",
            type: "string",
          },
          {
            id: "config-shopify-domain",
            name: "shopifyStoreDomain",
            value: "",
            type: "string",
          },
          {
            id: "config-shopify-version",
            name: "shopifyApiVersion",
            value: "2026-07",
            type: "string",
          },
          {
            id: "config-percent",
            name: "discountPercent",
            value: 15,
            type: "number",
          },
          {
            id: "config-template",
            name: "cequensTemplateName",
            value: "",
            type: "string",
          },
          {
            id: "config-language",
            name: "cequensTemplateLanguage",
            value: "ar",
            type: "string",
          },
          {
            id: "config-offline-product",
            name: "offlineProductGid",
            value: "",
            type: "string",
          },
          {
            id: "config-online-product",
            name: "onlineProductGid",
            value: "",
            type: "string",
          },
        ],
      },
      includeOtherFields: true,
      options: {},
    },
  },
  codeNode(
    "63f571d4-45a7-47ea-9782-1e702d669abc",
    "Validate + Prepare Lead",
    [-560, 0],
    String.raw`
const req = $input.first().json;
const body = req.body ?? req;

function clean(value, max = 500) {
  return typeof value === 'string' ? value.trim().slice(0, max) : '';
}

function normalizePhone(value) {
  let digits = clean(value, 40).replace(/\D/g, '');
  if (digits.startsWith('0020')) digits = digits.slice(2);
  if (digits.startsWith('0') && digits.length === 11) digits = '20' + digits.slice(1);
  if (!digits.startsWith('20') && digits.length === 10 && digits.startsWith('1')) digits = '20' + digits;
  return digits;
}

const config = {
  supabaseUrl: clean(req.supabaseUrl, 300).replace(/\/$/, ''),
  shopifyStoreDomain: clean(req.shopifyStoreDomain, 200)
    .replace(/^https?:\/\//, '')
    .replace(/\/$/, ''),
  shopifyApiVersion: clean(req.shopifyApiVersion, 20) || '2026-07',
  discountPercent: Number(req.discountPercent ?? 15),
  cequensTemplateName: clean(req.cequensTemplateName, 200),
  cequensTemplateLanguage: clean(req.cequensTemplateLanguage, 20) || 'ar',
  offlineProductGid: clean(req.offlineProductGid, 300),
  onlineProductGid: clean(req.onlineProductGid, 300),
};

if (!config.supabaseUrl || !config.shopifyStoreDomain || !config.cequensTemplateName) {
  throw new Error('Complete the non-secret CONFIG — Meska Offer values before activation');
}
if (!/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(config.supabaseUrl)) {
  throw new Error('supabaseUrl must be the project https URL');
}
if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/i.test(config.shopifyStoreDomain)) {
  throw new Error('shopifyStoreDomain must use the store.myshopify.com format');
}
if (!Number.isFinite(config.discountPercent) || config.discountPercent <= 0 || config.discountPercent >= 100) {
  throw new Error('discountPercent must be between 0 and 100');
}

const leadId = clean(body.leadId, 100);
const requestId = clean(body.requestId, 100);
const name = clean(body.name, 120);
const email = clean(body.email, 254).toLowerCase();
const mobile = normalizePhone(body.mobile);
const diplomaSlug = clean(body.diplomaSlug, 40);

if (body.event !== 'meska.lead.created') throw new Error('Unsupported webhook event');
if (!leadId || !requestId || !name || !/^\S+@\S+\.\S+$/.test(email) || mobile.length < 8 || mobile.length > 15) {
  throw new Error('Invalid lead payload');
}
if (!['offline', 'online'].includes(diplomaSlug)) throw new Error('Unsupported diplomaSlug');

const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
let suffix = '';
for (let index = 0; index < 9; index++) {
  suffix += alphabet[Math.floor(Math.random() * alphabet.length)];
}

const now = new Date();
const expires = new Date(now.getTime() + 24 * 60 * 60 * 1000);
const productGid = diplomaSlug === 'offline'
  ? config.offlineProductGid
  : config.onlineProductGid;

const expiryDisplay = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Cairo',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(expires);

return [{
  json: {
    leadId,
    requestId,
    name,
    email,
    mobile,
    diplomaSlug,
    source: clean(body.source, 100),
    sourceContext: clean(body.sourceContext, 100),
    attribution: body.attribution && typeof body.attribution === 'object' ? body.attribution : {},
    claimToken: String($execution.id) + ':' + leadId,
    candidateCode: 'MESKA-' + suffix,
    startsAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    expiryDisplay,
    discountPercent: config.discountPercent,
    productGid,
    config,
  },
}];
`,
  ),
  httpNode(
    "89252665-56bf-48df-9197-c937d3bef563",
    "Supabase — Claim Lead Offer",
    [-320, 0],
    {
      method: "POST",
      url: "={{$json.config.supabaseUrl + '/rest/v1/rpc/claim_lead_offer'}}",
      ...supabaseAuth,
      sendHeaders: true,
      headerParameters: {
        parameters: [{ name: "Content-Type", value: "application/json" }],
      },
      sendBody: true,
      contentType: "raw",
      rawContentType: "application/json",
      body: "={{ JSON.stringify({ p_lead_id: $json.leadId, p_discount_code: $json.candidateCode, p_discount_percent: $json.discountPercent, p_starts_at: $json.startsAt, p_expires_at: $json.expiresAt, p_claim_token: $json.claimToken }) }}",
      options: {},
    },
  ),
  codeNode(
    "42ca679f-66d6-4c86-9400-d7c0e0b476b6",
    "Resolve Offer Claim",
    [-80, 0],
    String.raw`
const base = $('Validate + Prepare Lead').first().json;
const payload = $input.first().json;
const result = Array.isArray(payload) ? payload[0] : payload;
if (!result || typeof result !== 'object' || !result.offer) {
  throw new Error('Supabase claim response is invalid');
}
return [{
  json: {
    ...base,
    claimed: result.claimed === true,
    action: result.action,
    offer: result.offer,
  },
}];
`,
  ),
  ifNode(
    "c57b4f89-20c3-4573-bf0b-fd559081b42b",
    "Claim Acquired?",
    [160, 0],
    "={{$json.claimed}}",
    true,
    "boolean",
  ),
  ifNode(
    "a20238c2-7a12-4dad-a31b-1d9c2f9d2143",
    "Resume Existing Shopify Offer?",
    [400, 0],
    "={{$json.action}}",
    "resume_whatsapp",
  ),
  codeNode(
    "7c513344-e0a2-4170-bdf0-03b64bc414fb",
    "Use Existing Shopify Offer",
    [640, -160],
    String.raw`
const data = $input.first().json;
const offer = data.offer;
const expiresAt = offer.expires_at || data.expiresAt;
const expiryDisplay = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Africa/Cairo',
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
}).format(new Date(expiresAt));
return [{
  json: {
    ...data,
    discountCode: offer.discount_code,
    shopifyDiscountId: offer.shopify_discount_id,
    startsAt: offer.starts_at || data.startsAt,
    expiresAt,
    expiryDisplay,
    discountPercent: Number(offer.discount_percent || data.discountPercent),
    offerOrigin: 'existing',
  },
}];
`,
  ),
  httpNode(
    "d1122ad1-3fd3-40da-94be-4fcae5af8d33",
    "Shopify — Find Discount By Code",
    [640, 160],
    {
      method: "POST",
      url: "=https://{{$json.config.shopifyStoreDomain}}/admin/api/{{$json.config.shopifyApiVersion}}/graphql.json",
      ...shopifyAuth,
      sendHeaders: true,
      headerParameters: {
        parameters: [{ name: "Content-Type", value: "application/json" }],
      },
      sendBody: true,
      contentType: "raw",
      rawContentType: "application/json",
      body: "={{ JSON.stringify({ query: `query FindDiscountCode($code: String!) { codeDiscountNodeByCode(code: $code) { id codeDiscount { ... on DiscountCodeBasic { startsAt endsAt codes(first: 1) { nodes { code } } } } } }`, variables: { code: $json.offer.discount_code } }) }}",
      options: {},
    },
    1500,
  ),
  codeNode(
    "66b75c7d-5814-4b08-bc23-88fe9240fb29",
    "Resolve Shopify Lookup",
    [880, 160],
    String.raw`
const base = $('Resolve Offer Claim').first().json;
const payload = $input.first().json;
if (Array.isArray(payload?.errors) && payload.errors.length) {
  throw new Error('Shopify lookup errors: ' + JSON.stringify(payload.errors));
}
const node = payload?.data?.codeDiscountNodeByCode ?? null;
return [{
  json: {
    ...base,
    discountCode: base.offer.discount_code,
    shopifyFound: Boolean(node?.id),
    shopifyDiscountId: node?.id ?? null,
  },
}];
`,
  ),
  ifNode(
    "fb03d1bf-3192-446c-85a5-b3d3ac2ed196",
    "Shopify Discount Exists?",
    [1120, 160],
    "={{$json.shopifyFound}}",
    true,
    "boolean",
  ),
  httpNode(
    "517e9ee0-c789-46b3-900e-2db47fc6b13b",
    "Shopify — Create 24h Discount",
    [1360, 320],
    {
      method: "POST",
      url: "=https://{{$json.config.shopifyStoreDomain}}/admin/api/{{$json.config.shopifyApiVersion}}/graphql.json",
      ...shopifyAuth,
      sendHeaders: true,
      headerParameters: {
        parameters: [{ name: "Content-Type", value: "application/json" }],
      },
      sendBody: true,
      contentType: "raw",
      rawContentType: "application/json",
      body: "={{ JSON.stringify({ query: `mutation CreateDiscountCode($input: DiscountCodeBasicInput!) { discountCodeBasicCreate(basicCodeDiscount: $input) { codeDiscountNode { id codeDiscount { ... on DiscountCodeBasic { startsAt endsAt codes(first: 1) { nodes { code } } } } } userErrors { field message code } } }`, variables: { input: { title: `Meska ${$json.diplomaSlug} lead — ${$json.discountCode}`, code: $json.discountCode, startsAt: $json.offer.starts_at || $json.startsAt, endsAt: $json.offer.expires_at || $json.expiresAt, context: { all: 'ALL' }, customerGets: { value: { percentage: $json.discountPercent / 100 }, items: $json.productGid ? { products: { productsToAdd: [$json.productGid] } } : { all: true } }, usageLimit: 1, appliesOncePerCustomer: true } } }) }}",
      options: {},
    },
    1500,
  ),
  codeNode(
    "bd71234a-5695-4cf9-80f0-d5931d4090d5",
    "Resolve Shopify Create",
    [1600, 320],
    String.raw`
const base = $('Resolve Shopify Lookup').first().json;
const payload = $input.first().json;
const result = payload?.data?.discountCodeBasicCreate;
const errors = [
  ...(Array.isArray(payload?.errors) ? payload.errors : []),
  ...(Array.isArray(result?.userErrors) ? result.userErrors : []),
];
const node = result?.codeDiscountNode;
return [{
  json: {
    ...base,
    shopifyCreateOk: errors.length === 0 && Boolean(node?.id),
    shopifyError: errors.length ? JSON.stringify(errors) : 'Shopify discount ID missing',
    shopifyDiscountId: node?.id ?? null,
    discountCode: node?.codeDiscount?.codes?.nodes?.[0]?.code || base.discountCode,
  },
}];
`,
  ),
  ifNode(
    "28a42f16-41c3-4182-813c-5c48e3f3d91f",
    "Shopify Create Succeeded?",
    [1840, 320],
    "={{$json.shopifyCreateOk}}",
    true,
    "boolean",
  ),
  httpNode(
    "6c75f92c-6eea-47f2-9870-a39538977dfa",
    "Supabase — Save Shopify Offer",
    [2080, 80],
    {
      method: "PATCH",
      url: "={{$json.config.supabaseUrl + '/rest/v1/lead_offers?lead_id=eq.' + encodeURIComponent($json.leadId) + '&processing_token=eq.' + encodeURIComponent($json.claimToken)}}",
      ...supabaseAuth,
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: "Content-Type", value: "application/json" },
          { name: "Prefer", value: "return=representation" },
        ],
      },
      sendBody: true,
      contentType: "raw",
      rawContentType: "application/json",
      body: "={{ JSON.stringify({ shopify_discount_id: $json.shopifyDiscountId, discount_code: $json.discountCode, discount_percent: $json.discountPercent, starts_at: $json.offer.starts_at || $json.startsAt, expires_at: $json.offer.expires_at || $json.expiresAt, status: 'shopify_created', last_error: null, updated_at: new Date().toISOString() }) }}",
      options: {},
    },
  ),
  codeNode(
    "cba794fe-4aa0-4f59-bc8d-6c651eea21ce",
    "Use Saved Shopify Offer",
    [2320, 80],
    String.raw`
const base = $('Resolve Offer Claim').first().json;
const payload = $input.first().json;
const offer = Array.isArray(payload) ? payload[0] : payload;
if (!offer?.shopify_discount_id || !offer?.discount_code) {
  throw new Error('Supabase did not return the saved Shopify offer');
}
const expiresAt = offer.expires_at || base.expiresAt;
return [{
  json: {
    ...base,
    offer,
    discountCode: offer.discount_code,
    shopifyDiscountId: offer.shopify_discount_id,
    startsAt: offer.starts_at || base.startsAt,
    expiresAt,
    expiryDisplay: new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Africa/Cairo',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(expiresAt)),
    offerOrigin: 'new_or_recovered',
  },
}];
`,
  ),
  httpNode(
    "3d3579ef-9f6b-4c17-af98-d321f8b05dd8",
    "Supabase — Record Shopify Failure",
    [2080, 400],
    {
      method: "POST",
      url: "={{$json.config.supabaseUrl + '/rest/v1/rpc/fail_lead_offer_claim'}}",
      ...supabaseAuth,
      sendHeaders: true,
      headerParameters: {
        parameters: [{ name: "Content-Type", value: "application/json" }],
      },
      sendBody: true,
      contentType: "raw",
      rawContentType: "application/json",
      body: "={{ JSON.stringify({ p_lead_id: $json.leadId, p_claim_token: $json.claimToken, p_error: $json.shopifyError }) }}",
      options: {},
    },
  ),
  {
    id: "141e7049-7202-473d-b123-3c9da2f72c7f",
    name: "Stop — Shopify Rejected Discount",
    type: "n8n-nodes-base.stopAndError",
    typeVersion: 1,
    position: [2320, 400],
    parameters: {
      errorType: "errorMessage",
      errorMessage: "={{$('Resolve Shopify Create').first().json.shopifyError}}",
    },
  },
  codeNode(
    "03fbf42a-dbb5-44e3-a822-f8646e90ada2",
    "Build WhatsApp Template Payload",
    [2560, -80],
    String.raw`
const data = $input.first().json;
if (!data.discountCode || !data.shopifyDiscountId) {
  throw new Error('A confirmed Shopify discount is required before WhatsApp');
}
return [{
  json: {
    ...data,
    cequensPayload: {
      to: data.mobile,
      recipient_type: 'individual',
      type: 'template',
      clientReferenceID: data.requestId,
      isTemplateWithFlow: false,
      template: {
        language: {
          policy: 'deterministic',
          code: data.config.cequensTemplateLanguage,
        },
        name: data.config.cequensTemplateName,
        components: [{
          type: 'body',
          parameters: [
            { type: 'text', text: data.name },
            { type: 'text', text: String(data.discountPercent) },
            { type: 'text', text: data.discountCode },
            { type: 'text', text: data.expiryDisplay },
          ],
        }],
      },
    },
  },
}];
`,
  ),
  httpNode(
    "6c33abc4-8cd0-45a4-b080-65a69cb8781a",
    "CEQUENS — Send WhatsApp",
    [2800, -80],
    {
      method: "POST",
      url: "https://apis.cequens.com/conversation/wab/v1/messages/",
      ...cequensAuth,
      sendHeaders: true,
      headerParameters: {
        parameters: [{ name: "Content-Type", value: "application/json" }],
      },
      sendBody: true,
      contentType: "raw",
      rawContentType: "application/json",
      body: "={{JSON.stringify($json.cequensPayload)}}",
      options: {},
    },
    2000,
  ),
  codeNode(
    "3021ce08-8f56-4c9e-8e57-0b4e7a51678a",
    "Capture CEQUENS Result",
    [3040, -80],
    String.raw`
const base = $('Build WhatsApp Template Payload').first().json;
const response = $input.first().json;
const messageId = response?.messageId
  ?? response?.message_id
  ?? response?.id
  ?? response?.data?.messageId
  ?? response?.data?.message_id
  ?? response?.data?.id
  ?? null;
return [{
  json: {
    ...base,
    cequensMessageId: messageId,
    whatsappSentAt: new Date().toISOString(),
  },
}];
`,
  ),
  httpNode(
    "2e943e43-f994-4a5e-8507-ce2e5629979c",
    "Supabase — Mark WhatsApp Sent",
    [3280, -80],
    {
      method: "PATCH",
      url: "={{$json.config.supabaseUrl + '/rest/v1/lead_offers?lead_id=eq.' + encodeURIComponent($json.leadId) + '&processing_token=eq.' + encodeURIComponent($json.claimToken)}}",
      ...supabaseAuth,
      sendHeaders: true,
      headerParameters: {
        parameters: [
          { name: "Content-Type", value: "application/json" },
          { name: "Prefer", value: "return=minimal" },
        ],
      },
      sendBody: true,
      contentType: "raw",
      rawContentType: "application/json",
      body: "={{ JSON.stringify({ status: 'whatsapp_sent', cequens_message_id: $json.cequensMessageId, whatsapp_sent_at: $json.whatsappSentAt, last_error: null, processing_token: null, processing_started_at: null, updated_at: new Date().toISOString() }) }}",
      options: {},
    },
  ),
];

const connections = {
  "Lead Created Webhook": {
    main: [[{ node: "CONFIG — Meska Offer", type: "main", index: 0 }]],
  },
  "CONFIG — Meska Offer": {
    main: [[{ node: "Validate + Prepare Lead", type: "main", index: 0 }]],
  },
  "Validate + Prepare Lead": {
    main: [[{ node: "Supabase — Claim Lead Offer", type: "main", index: 0 }]],
  },
  "Supabase — Claim Lead Offer": {
    main: [[{ node: "Resolve Offer Claim", type: "main", index: 0 }]],
  },
  "Resolve Offer Claim": {
    main: [[{ node: "Claim Acquired?", type: "main", index: 0 }]],
  },
  "Claim Acquired?": {
    main: [
      [{ node: "Resume Existing Shopify Offer?", type: "main", index: 0 }],
      [],
    ],
  },
  "Resume Existing Shopify Offer?": {
    main: [
      [{ node: "Use Existing Shopify Offer", type: "main", index: 0 }],
      [{ node: "Shopify — Find Discount By Code", type: "main", index: 0 }],
    ],
  },
  "Use Existing Shopify Offer": {
    main: [[{ node: "Build WhatsApp Template Payload", type: "main", index: 0 }]],
  },
  "Shopify — Find Discount By Code": {
    main: [[{ node: "Resolve Shopify Lookup", type: "main", index: 0 }]],
  },
  "Resolve Shopify Lookup": {
    main: [[{ node: "Shopify Discount Exists?", type: "main", index: 0 }]],
  },
  "Shopify Discount Exists?": {
    main: [
      [{ node: "Supabase — Save Shopify Offer", type: "main", index: 0 }],
      [{ node: "Shopify — Create 24h Discount", type: "main", index: 0 }],
    ],
  },
  "Shopify — Create 24h Discount": {
    main: [[{ node: "Resolve Shopify Create", type: "main", index: 0 }]],
  },
  "Resolve Shopify Create": {
    main: [[{ node: "Shopify Create Succeeded?", type: "main", index: 0 }]],
  },
  "Shopify Create Succeeded?": {
    main: [
      [{ node: "Supabase — Save Shopify Offer", type: "main", index: 0 }],
      [{ node: "Supabase — Record Shopify Failure", type: "main", index: 0 }],
    ],
  },
  "Supabase — Save Shopify Offer": {
    main: [[{ node: "Use Saved Shopify Offer", type: "main", index: 0 }]],
  },
  "Use Saved Shopify Offer": {
    main: [[{ node: "Build WhatsApp Template Payload", type: "main", index: 0 }]],
  },
  "Supabase — Record Shopify Failure": {
    main: [[{ node: "Stop — Shopify Rejected Discount", type: "main", index: 0 }]],
  },
  "Build WhatsApp Template Payload": {
    main: [[{ node: "CEQUENS — Send WhatsApp", type: "main", index: 0 }]],
  },
  "CEQUENS — Send WhatsApp": {
    main: [[{ node: "Capture CEQUENS Result", type: "main", index: 0 }]],
  },
  "Capture CEQUENS Result": {
    main: [[{ node: "Supabase — Mark WhatsApp Sent", type: "main", index: 0 }]],
  },
};

const workflow = {
  name: "Meska — Lead → Shopify 24h Discount → CEQUENS WhatsApp — Cloud FINAL",
  nodes,
  pinData: {},
  connections,
  active: false,
  settings: {
    executionOrder: "v1",
    saveManualExecutions: true,
    callerPolicy: "workflowsFromSameOwner",
    errorWorkflow: "",
  },
  versionId: "8d5b5141-5230-4a8f-817c-24a6c6210e0a",
  meta: {
    templateCredsSetupCompleted: false,
  },
  tags: [],
};

writeFileSync(outputUrl, `${JSON.stringify(workflow, null, 2)}\n`, "utf8");
console.log(fileURLToPath(outputUrl));
