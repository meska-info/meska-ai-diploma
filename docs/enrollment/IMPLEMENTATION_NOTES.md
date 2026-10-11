# Copilot individual and team enrollment implementation notes

Implemented on `codex/copilot-team-enrollment` against `origin/main` at `8d6426a`.

## Experience

- The landing page now has one shared seat state across the primary price card, form, closing calculator and modal.
- `Just me` and `My team` reveal the specification's exact fields, validation, work-email handling and team pricing.
- A persisted lead redirects to `/thank-you` with only the public lead ID, seat count and allowed attribution keys. The edit token remains in session storage.
- `/thank-you` has personalized and generic modes, mutable seats, accurate totals, participant roster, licence/cohort/installment/enterprise callouts and three payment paths.
- Shopify links use variant `42776902369326` and server-computed quantities. The obsolete checkout path and the redundant “Ready to discuss the course?” section are absent.
- Existing course information, media, instructors, testimonials, FAQs, header, footer and Chatbase advisor remain below the new primary enrollment panel.

## Data and APIs

- `POST /api/copilot-leads` validates and normalizes with the same module used by the browser, computes price on the server, inserts idempotently by `request_id`, returns a public lead ID plus a short-lived signed edit token, and preserves the fail-open `companyWebsite` honeypot behavior.
- `PATCH /api/copilot-leads/[leadId]` authenticates the signed edit token and supports seat/type, participant, cohort, licence and payment-path lifecycle updates while recomputing all prices server-side.
- `POST /api/copilot-leads/receipt` restores a personalized enrollment safely without exposing the token.
- The additive Supabase migration extends `public.leads` with the 20 enrollment fields and supporting constraints/indexes. It was applied through the authenticated Supabase SQL editor and returned `Success. No rows returned.`
- The Google Sheet sync supports both live schemas without rewriting either. Legacy diploma workbooks preserve A:W and append X:AQ. The existing `Microsoft Copilot Diploma Leads` workbook preserves its verified A:V columns and appends W:AP, with upserts keyed by `record_id` in column C. Concurrent POST/PATCH jobs refresh the current Supabase row, append against the stable base-column table range, consolidate duplicate IDs, and resize columns idempotently. Transient Google failures remain fail-open for lead persistence. The writer resolves the actual first visible tab and targets `GOOGLE_SHEETS_COPILOT_ID` through the retained `GCP_*` Workload Identity configuration.

## Pricing source of truth

`app/lib/teamPricing.ts` owns all client/server pricing and the Shopify cart URL:

| Seats | Per seat | Example total |
| ---: | ---: | ---: |
| 1 | EGP 30,000 | EGP 30,000 |
| 2–4 | EGP 24,000 | 3 = EGP 72,000 |
| 5–20 | EGP 22,500 | 6 = EGP 135,000 |

Every specified boundary (1–8, 10, 15 and 20) is covered by unit tests. Arbitrary client values are clamped to 1–20 and totals are never accepted from the request body.

## Tracking and privacy

- Preserved the existing Pixel loader, Pixel ID, `PageView`, `ViewContent`, `CTAOpenForm`, `PricingView`, `FormStart`, `FormError`, `FormSubmit`, qualified `Lead`, `LeadThankYouView`, `InitiateCheckout`, media and capability events.
- Added `EnrollmentTypeSelected`, `SeatCalculatorChange`, `TierUnlocked`, `EnrollmentPageView`, `ParticipantAdded`, `ParticipantRemoved`, `ParticipantUpdated`, `LicenceStatusChanged`, `CohortSwitched`, `PaymentPathSelected`, `InvoiceRequested`, `ManagerLinkCopied` and `EnrollmentStateError`.
- Event parameters contain commercial state and opaque IDs only. Names, emails, mobile numbers, LinkedIn URLs and participant details are excluded.
- `InitiateCheckout` fires only for the matching online payment action. `Purchase` remains Shopify-confirmed and is not implemented locally. There is no Conversions API implementation in this repository.

## Verification evidence

- `pnpm lint`: passed.
- `pnpm exec tsc --noEmit`: passed.
- `pnpm test`: passed both Next.js and worker builds plus 135 tests.
- `pnpm test:e2e`: 5/5 journeys passed in 1.9 minutes.
- Responsive overflow was checked at 320, 375, 390, 768, 1024, 1280 and 1440 px.
- Fifty committed screenshots cover ten required states at 360×780, 390×844, 768×1024, 1280×800 and 1440×900.
- Machine-readable evidence is in `artifacts/unit-test-results.xml`, `artifacts/playwright-results.json`, `artifacts/enrollment-event-log.json` and `artifacts/enrollment-screenshot-manifest.json`.

## Repository and release boundaries

- Production was not changed. This branch is intended for Vercel Preview review and PR merge through the repository's normal release process.
- No framework or application dependency was upgraded; Playwright was added as a development-only test dependency.
- The existing `.pnpm-store/` directory and `PHASE2_IMPLEMENTATION_BACKUP.patch` remain untracked and untouched.
