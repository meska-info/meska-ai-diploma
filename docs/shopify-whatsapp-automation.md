# Shopify 24-hour offer and WhatsApp automation

## Status

The repository contains the website trigger, database migration, and an inactive n8n Cloud import. The automation is intentionally fail-open for the visitor: Supabase lead persistence remains the acceptance boundary, while Google Sheets and n8n run independently in `after()`.

Do not activate the n8n workflow until the migration, credentials, non-secret config, and controlled test are complete.

## Architecture

```text
Landing form
→ POST /api/leads
→ Supabase public.leads
→ Vercel after()
   ├─ existing Google Sheets sync
   └─ authenticated n8n webhook
      → atomic public.claim_lead_offer()
      → recover or create Shopify discount
      → public.lead_offers
      → approved CEQUENS WhatsApp template
      → mark whatsapp_sent
```

Supabase remains the source of truth. Google Sheets is an asynchronous destination and is not an automation trigger.

## Repository files

- `app/api/leads/route.ts` — persists the normalized lead and starts isolated background work.
- `app/lib/leadAutomation.ts` — phone normalization, persisted-lead payload, and authenticated n8n trigger.
- `supabase/migrations/202608260001_create_lead_offers.sql` — offer table and atomic claim functions.
- `n8n/Meska-Shopify-WhatsApp-Cloud-FINAL.json` — inactive n8n Cloud import.
- `n8n/build-final-workflow.mjs` — reproducibly generates the import JSON.

## 1. Apply the Supabase migration

Apply `supabase/migrations/202608260001_create_lead_offers.sql` to the same project used by `public.leads`.

The migration:

- creates one offer row per lead and one unique discount code;
- enables RLS and grants no access to `anon` or `authenticated`;
- grants server automation access to `service_role`;
- adds an atomic five-minute processing claim to prevent concurrent webhook deliveries from creating different Shopify codes;
- adds a safe claim-release function for recorded business failures.

Confirm that `public.lead_offers`, `public.claim_lead_offer`, and `public.fail_lead_offer_claim` exist before continuing.

## 2. Create n8n credentials

Import `n8n/Meska-Shopify-WhatsApp-Cloud-FINAL.json`. It imports inactive and without credential IDs.

Create and select these credentials:

### Meska Webhook Auth

- Type: Webhook Header Auth
- Header name: `X-Meska-Webhook-Secret`
- Value: a new long random secret

Use the same value later in Vercel as `N8N_LEAD_WEBHOOK_SECRET`.

### Meska Supabase Admin

- Type: Supabase
- Host: the existing Meska Supabase project URL
- Service Role Secret: an elevated server credential for this automation

Prefer a dedicated, independently rotatable Supabase secret when the n8n credential supports it. Never use a publishable/anon key and never expose the elevated key to the browser.

Select this credential on every `Supabase — ...` HTTP Request node.

### Shopify Admin API

- Type: HTTP Header Auth
- Header name: `X-Shopify-Access-Token`
- Value: the Admin API access token from the installed Shopify app

The installed app needs:

- `read_discounts` to recover an already-created code after a partial failure;
- `write_discounts` to create the discount.

Select this credential on both Shopify HTTP Request nodes.

### CEQUENS WhatsApp API

- Type: HTTP Header Auth
- Header name: `Authorization`
- Value: `Bearer <CEQUENS API token>`

Select it on `CEQUENS — Send WhatsApp`.

Do not put any token in the workflow JSON, Code nodes, Set nodes, or Sticky Notes.

## 3. Enter non-secret n8n config

Open `CONFIG — Meska Offer` and set:

| Field | Value |
| --- | --- |
| `supabaseUrl` | `https://<project-ref>.supabase.co` |
| `shopifyStoreDomain` | `<store>.myshopify.com` |
| `shopifyApiVersion` | `2026-07` |
| `discountPercent` | `15` |
| `cequensTemplateName` | exact approved template name |
| `cequensTemplateLanguage` | exact approved language, normally `ar` |
| `offlineProductGid` | optional Offline Shopify product GID |
| `onlineProductGid` | optional Online Shopify product GID |

For production, product-specific GIDs are recommended. If the matching GID is blank, the generated code applies to all eligible store items.

The workflow uses a real percentage value of `0.15`, starts immediately, expires exactly 24 hours later, has `usageLimit: 1`, and sets `appliesOncePerCustomer: true`.

## 4. CEQUENS template contract

The exact approved template must contain four body variables in this order:

1. customer full name;
2. discount percentage;
3. real Shopify discount code;
4. expiry displayed in Cairo time.

Recommended Arabic body:

```text
أهلاً {{1}} 👋
يسعدنا اهتمامك بـ Meska AI Co-Pilot Diploma.

خصصنا لك خصم {{2}}% لمدة 24 ساعة فقط.

كود الخصم الخاص بك:
{{3}}

صالح حتى:
{{4}}

استخدم الكود عند إتمام التسجيل قبل انتهاء العرض.
```

The approved name, language, category, sender configuration, variable count, and variable order must match the live CEQUENS account. Confirm the form/terms provide the required WhatsApp marketing permission before production activation.

## 5. Configure Vercel

Add server-side variables to Preview first, then Production after the controlled test:

```text
N8N_LEAD_WEBHOOK_URL=https://<n8n-cloud-host>/webhook/meska-lead-created
N8N_LEAD_WEBHOOK_SECRET=<same value as Meska Webhook Auth>
```

Never prefix either variable with `NEXT_PUBLIC_`. Redeploy after adding or changing them.

The existing Supabase, Google Workload Identity, Google Sheets, tracking, and media variables remain unchanged.

## 6. Controlled test

Use a new `requestId`, controlled email address, and controlled WhatsApp number.

1. Submit the website form on the Vercel Preview.
2. Confirm the API returns `201` and the thank-you redirect works.
3. Confirm one normalized lead exists in `public.leads`.
4. Confirm the existing Offline/Online Google Sheet received the lead.
5. Confirm one row exists in `public.lead_offers`.
6. Confirm one matching Shopify code exists with the expected product scope, 15%, 24-hour expiry, usage limit 1, and once-per-customer behavior.
7. Confirm the approved CEQUENS template arrives with the four correct values.
8. Confirm the offer row is `whatsapp_sent` and includes the sent timestamp.
9. Replay the same webhook payload. Confirm no second Shopify code and no second WhatsApp execution path.
10. Recheck landing and thank-you behavior at 320, 375, 390, 768, 1024, 1280, and 1440px, including the current Meta event inventory.

## Failure and retry behavior

- Website acceptance never waits for n8n or Google Sheets.
- Google Sheets and n8n failures cannot cancel each other.
- External HTTP nodes retry transient failures up to three times.
- A database claim prevents concurrent deliveries from generating different discount codes.
- Before creation, Shopify is queried by the reserved code so a code created during a partial failure is recovered rather than recreated.
- Shopify GraphQL `userErrors` are recorded and WhatsApp is not called.
- A saved Shopify offer is reused when retrying WhatsApp.
- A fully sent lead stops without creating or sending anything again.

## Rollback

Fastest automation-only rollback:

1. deactivate the n8n workflow;
2. remove `N8N_LEAD_WEBHOOK_URL` and `N8N_LEAD_WEBHOOK_SECRET` from Vercel, or leave them unset;
3. redeploy Vercel.

The form continues persisting leads and syncing Google Sheets because the automation trigger is isolated and fail-open.

For a code rollback, revert the feature commit through Git and allow the reverted `main` to deploy. Do not drop `public.lead_offers` during a routine rollback; it contains audit and recovery state. Disable affected Shopify codes manually only when the business explicitly decides they must no longer be redeemable.
