## Discovery

The pre-change discovery report is committed at `docs/enrollment/DISCOVERY_REPORT.md`. It documents the original form, `/api/leads`, Supabase table, A:W Sheet mapping, tracking inventory, thank-you composition and the supplied-reference/repository baseline mismatch before implementation.

## What changed

- Adds individual/team enrollment modes and a shared 1–20 seat calculator to the landing page.
- Implements the exact tier model: EGP 30,000 for one seat, EGP 24,000 each for 2–4, and EGP 22,500 each for 5–20.
- Replaces the thank-you checkout action area with personalized/generic enrollment, editable totals, participant roster, licence/cohort/payment callouts, online payment, invoice and manager-share flows.
- Uses Shopify variant `42776902369326`; removes the obsolete checkout destination from application code.
- Keeps useful course content below enrollment while ensuring the redundant “Ready to discuss the course?” / “Go to the interest form” section is not rendered and leaves no spacer.
- Adds shared browser/server validation, idempotent Copilot lead APIs, a signed edit session, additive Supabase schema, and Google Sheet A:W preservation plus X:AQ upsert fields.
- Preserves attribution and the existing Pixel inventory, adds the specified enrollment events, and keeps all browser tracking free of PII.

## Database and Sheet

- Applied `supabase/migrations/202610110001_copilot_team_enrollment.sql` through the authenticated project SQL editor; Supabase returned `Success. No rows returned.`
- Sheet synchronization is repository-owned. It now upserts by lead UUID, adds only missing X:AQ headers and retries transient failures.
- Existing Preview Supabase settings were preserved. The existing Production Google identity and Sheet IDs were copied to this branch's Preview scope so integration behavior can be tested without committing secrets.

## Tracking review

Preserved: `PageView`, `ViewContent`, `CTAOpenForm`, `PricingView`, `FormStart`, `FormError`, `FormSubmit`, qualified `Lead`, `LeadThankYouView`, `InitiateCheckout`, `VideoPlay`, `CapabilitySelect`, `MediaPlaceholderClick`.

Added: `EnrollmentTypeSelected`, `SeatCalculatorChange`, `TierUnlocked`, `EnrollmentPageView`, `ParticipantAdded`, `ParticipantRemoved`, `ParticipantUpdated`, `LicenceStatusChanged`, `CohortSwitched`, `PaymentPathSelected`, `InvoiceRequested`, `ManagerLinkCopied`, `EnrollmentStateError`.

`Purchase` remains Shopify-confirmed and is not emitted locally. No Conversions API implementation exists in this repository.

## Verification

- `pnpm lint` — passed
- `pnpm exec tsc --noEmit` — passed
- `pnpm test` — Next.js build, worker build and 135/135 tests passed
- `pnpm test:e2e` — 5/5 Playwright journeys passed
- Pricing boundaries — 1–8, 10, 15 and 20 seats passed
- Responsive overflow — 320, 375, 390, 768, 1024, 1280 and 1440 px passed
- No-JavaScript checkout — server-rendered correct cart quantity passed
- Removed prompt and obsolete checkout URL — rendered/source regression checks passed
- Screenshots — 50 images in `artifacts/enrollment-screenshots/`
- Machine-readable results — JUnit, Playwright JSON, event log and screenshot manifest in `artifacts/`

See `docs/enrollment/IMPLEMENTATION_NOTES.md` for the API, data, pricing and evidence details.

## Production impact

None yet. This PR must be reviewed on Vercel Preview before merge. Merging remains the separate production release approval.
