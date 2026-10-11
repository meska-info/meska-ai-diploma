# Individual and team enrollment discovery report

Captured before implementation on 11 October 2026 from production branch `origin/main` at `8d6426a`.

## Source map

- Landing composition: `app/components/LandingPage.tsx`
- Primary and modal lead form: `LeadCapture` and `LeadModal` in `app/components/sections.tsx`
- Thank-you composition: `app/components/ThankYouPage.tsx`
- Current checkout card: `CheckoutSection` in `app/components/sections.tsx`
- Course facts, prices, checkout destinations and tracking IDs: `app/content.ts`
- Shared client/server lead validation: `app/lib/leadValidation.ts`
- Browser tracking and attribution: `app/lib/tracking.ts`
- Lead POST route: `app/api/leads/route.ts`
- Google Sheet writer: `app/lib/googleSheets.ts`
- Supabase schema and migrations: `supabase/schema.sql` and `supabase/migrations/`
- Existing test suites: `tests/*.test.mjs`

The specification names `/api/copilot-leads` and `/api/copilot-leads/receipt`. The production repository currently exposes only `POST /api/leads`; no receipt route or reference to either Copilot-specific path exists in any fetched remote branch. Implementation therefore adds the Copilot-specific endpoints while retaining `/api/leads` for backward compatibility.

## Current form and thank-you behavior

The current landing page has one page-level Offline/Online selection. `LeadCapture` renders in the primary `#apply` cluster and in a dialog. It validates seven visible fields plus the hidden `diploma` value, posts to `/api/leads`, writes a persistence-qualified event payload to session storage, and redirects to `/thank-you` with attribution. The duplicate-submit ref, `companyWebsite` honeypot, first-invalid-field focus, persistence error, attribution capture and qualified `Lead` semantics are all present.

The current thank-you route renders a confirmation and the `DiplomaAdvisor`, then the free guide, curriculum, a two-format checkout card, graduation material, session videos, instructors, learner stories and FAQs. The screenshot's “Ready to discuss the course?” / “Go to the interest form” section is not present in this production source. A regression assertion will keep it absent while the enrollment panel replaces the old checkout action area.

## Supabase

- Source-of-truth table: `public.leads`.
- Server client: direct Supabase PostgREST calls with `SUPABASE_URL` and the server-only `SUPABASE_SERVICE_ROLE_KEY`; there is no browser Supabase client.
- Idempotency: `request_id` is unique and POST uses `Prefer: return=representation,resolution=ignore-duplicates`.
- RLS: enabled. The service role is used for server writes.
- Migration workflow: SQL files are versioned in `supabase/migrations/`, but this repository has no `supabase/config.toml`, project ref, database URL, or authenticated CLI workflow. The production documentation instructs an operator to apply SQL to the selected project. The enrollment migration will therefore be committed as idempotent, ready-to-apply SQL; external application and evidence are blocked until authenticated project access is available.
- The existing lead-offer/WhatsApp automation is separate from this enrollment journey and remains fail-open. The new Copilot endpoint does not create or alter Shopify discounts.

## Google Sheet synchronization

This is case **(a), code in this repository**. `app/lib/googleSheets.ts` exchanges the Vercel OIDC token through Google Workload Identity Federation, impersonates the configured service account, selects the Offline or Online spreadsheet from environment variables, and writes to `Sheet1` through the Sheets API.

Current behavior is append-once, not upsert: it reads request IDs from column B, returns if one is found, otherwise appends A:W. Existing A:O columns are preserved, and qualification fields occupy P:W in this order:

1. `linkedin_url`
2. `years_experience`
3. `payment_preference`
4. `programme_price`
5. `programme_price_value`
6. `current_wave`
7. `current_wave_start_date`
8. `start_timing`

Implementation keeps this repository's legacy diploma A:W mapping in place, appends the 20 specified enrollment columns at X:AQ, locates rows by the persisted lead ID in column A, updates matching rows in place, appends new rows, adds only missing new headers, and retries transient failures without failing the lead API response.

### Live Copilot workbook revalidation

The existing `Microsoft Copilot Diploma Leads` workbook was inspected directly before enabling writes. Its `Leads` tab has one frozen header row and 22 existing columns at A:V, in this exact order: `created_at`, `request_id`, `record_id`, `name`, `email`, `mobile`, `linkedin_url`, `years_experience`, `payment_preference`, `joining_readiness`, `cohort_label`, `onboarding_date`, `first_session_date`, `source_context`, `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, `fbclid`, `referrer`, `landing_url`.

The dedicated Copilot route therefore preserves A:V unchanged, keys upserts by `record_id` in column C, and appends the 20 enrollment columns at W:AP. The broader diploma workbook mapping remains A:W plus X:AQ. This dual-schema handling prevents the dedicated Copilot workbook from being rewritten into the unrelated diploma layout.

## Existing browser event inventory

There is no Conversions API implementation in the repository. Meta forwarding is browser-only through one `fbq` loader. Existing `trackEvent` calls before this change are:

- `ViewContent` — first landing render; `tracking_id: diploma_landing_view`; once per session.
- `CTAOpenForm` — header Start Application and sticky advisor CTA; retains each CTA's existing `data-track-id`.
- `PricingView` — primary form price cluster visibility, thank-you header, and floating checkout CTA; the primary observation uses its existing once key.
- `FormStart` — first form focus for the mounted primary or modal form.
- `FormatSelect` — changed Offline/Online selection on the landing or old checkout card.
- `FormError` — validation, format synchronization, and persistence failures.
- `FormSubmit` — valid submit intent before the persistence request; includes `createEventId("lead")` and its existing once key.
- `Lead` — qualified pending-lead state consumed on `/thank-you`, with the same form event ID and once key.
- `LeadThankYouView` — thank-you route load with submission-state diagnostic.
- `InitiateCheckout` — old Offline/Online checkout activation, with `createEventId("checkout")`.
- `VideoPlay` — free guide, graduation, curriculum/session and testimonial first-play events, each with its existing once key.
- `CapabilitySelect` — skills matrix selection.
- `MediaPlaceholderClick` — dormant placeholder helper.

`PageView` is emitted directly by `app/components/MetaPixel.tsx` through the tracking helper's pathname de-duplication. `Purchase` is not implemented locally.

## Baseline mismatch and implementation choice

The supplied specification describes `copilot.meska.ai`, one `online` Copilot product, EGP 30,000 base pricing and Shopify variant `42776902369326`. The current repository is the broader AI Co-Pilot Diploma at `diploma.meska.ai`, with Offline/Online prices and newer advisor/lead-offer additions. The implementation follows the repository architecture and preserves its content, media, advisor, tracking loader, persistence, and old `/api/leads` contract while adding the requested single-product enrollment journey, Copilot API compatibility routes, additive columns, and Shopify cart permalinks. Production domain/DNS and unrelated lead-offer automation are not changed.
