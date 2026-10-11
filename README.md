# Meska AI Co-Pilot Diploma journey

Mobile-first production website for the Meska AI Co-Pilot Diploma. It includes a conversion landing page, a post-application thank-you/consideration page, and responsive review routes.

Active architecture:

```text
Codex → GitHub → Vercel → https://diploma.meska.ai
```

GitHub is the source of truth and `main` is the production branch. See `DEPLOYMENT.md` for verified rollout status; do not infer completion from intended architecture.

## Status

```text
Local development: verified
Local Git repository: yes (`main` tracks `origin/main`)
GitHub: https://github.com/meska-info/meska-ai-diploma
Vercel: `meska-ai-diploma`, connected directly to GitHub
Production deployment/domain/SSL: verified at https://diploma.meska.ai
Production Meta Pixel: loader and production event flow technically verified; Meta Events Manager Test Events pending
Lead persistence: Supabase server-side route configured in Vercel Preview and Production; deployment verification pending
Shopify/WhatsApp offer automation: repository implementation present; external migration, credentials, activation, and live verification pending
Legacy Framer workflow: archived reference only
```

Pixel ID `1982493002344234` is initialized once through `app/components/MetaPixel.tsx`. Existing events remain centralized in `app/lib/tracking.ts`; see `TRACKING.md` for the complete mapping and deduplication contract.

## Run locally

Requires Node.js `>=22.13.0` and pnpm.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

`pnpm test` runs the native Next.js production build, retained worker compatibility build, and rendered HTML regression tests. There is no separate formatter script.

## Routes

- `/` — landing page with a shared 1–20 seat calculator and distinct individual/team Copilot enrollment forms.
- `/thank-you` — personalized or generic Copilot enrollment, editable seats, team roster, payment paths, then the retained course information.
- `/api/copilot-leads` — validated, server-priced enrollment lead creation.
- `/api/copilot-leads/[leadId]` — edit-token-authenticated seat, roster, cohort, and payment lifecycle updates.
- `/api/copilot-leads/receipt` — edit-token-authenticated non-PII enrollment summary.
- `/preview/mobile` — 390px live review frame.
- `/preview/tablet` — 768px live review frame.
- `/preview/desktop` — 1440px live review frame.

## Current experience

The landing page uses the official Meska logo, outcome-led build-focused hero copy, a Cloudflare Stream 16:9 overview video, shared tiered Copilot pricing, exact individual/team form variants, impact metrics, independent outcome disclosures, a transparent greyscale sixteen-logo marquee, a shared nine-session curriculum disclosure, nine Cloudflare video testimonials, the skills-to-business-value matrix, nine image testimonial cards, and a persistent advisor CTA after the hero.

The thank-you page now begins with the Copilot enrollment panel. A matching sessionStorage lead/edit token unlocks personalization, roster editing, licence/cohort callouts, invoice, and manager-sharing paths; an untrusted or cross-device URL stays generic and exposes only the server-rendered Pay path. Every Pay link uses Shopify variant `42776902369326` and the current seat quantity. The redundant “Ready to discuss the course?” return-to-form section is absent. The retained advisor, free guide, curriculum, graduation material, videos, instructors, testimonials, and FAQs follow the enrollment panel.

The form and API share validation; price is always recomputed server-side. Supabase stores only the edit-token hash, the browser keeps the raw token in sessionStorage, and URLs carry only the lead UUID plus allowed attribution. Google Sheets keeps the existing A:W layout, appends the 20 enrollment columns, and upserts by lead ID. `GOOGLE_SHEETS_COPILOT_ID` selects the existing Copilot workbook while the retained `GCP_*` Workload Identity configuration continues serving all repository-owned Sheet syncs.

## Project map

- `app/content.ts` — approved copy, facts, formats, prices, checkout URLs, asset records, FAQs, and stable tracking IDs.
- `app/components/LandingPage.tsx` — landing composition and sticky trigger/focus return.
- `app/components/ThankYouPage.tsx` — thank-you composition.
- `app/components/sections.tsx` — reusable controls, form, sections, carousels, checkout, media coordination, and trackers.
- `app/components/enrollment/` — shared calculator, type toggle, forms, enrollment panel, roster, and payment paths.
- `app/lib/teamPricing.ts` — authoritative seat tiers, totals, and Shopify permalink generation.
- `app/lib/leadValidation.ts` — shared legacy and Copilot client/server validation.
- `app/lib/copilotLeadsServer.ts` — server-only Supabase lead creation, edit-token authorization, rate limiting, pricing, and lifecycle updates.
- `app/lib/googleSheets.ts` — A:AQ row mapping and lead-ID upsert with retry.
- `app/components/MetaPixel.tsx` — one-time Pixel loading and pathname `PageView` tracking.
- `app/lib/leadAutomation.ts` — normalized persisted-lead payload and authenticated n8n trigger.
- `app/lib/tracking.ts` — local evidence, Meta forwarding, deduplication, attribution, and PII filtering.
- `app/globals.css` — design tokens, layouts, breakpoints, focus, safe-area, and reduced-motion rules.
- `public/media/` — 77 local approved/source/optimized media files.
- `tests/rendered-html.test.mjs` — landing, thank-you, and regression assertions.
- `e2e/enrollment.spec.ts` — Playwright flows, edge cases, no-JavaScript checkout, responsive overflow, and screenshot matrix.
- `worker/index.ts` / `vite.config.ts` — retained worker compatibility/history; not the active Vercel adapter.
- `vercel.json` — explicit Next.js framework, install, and build contract.
- `DEPLOYMENT.md` / `TRACKING.md` — production workflow/status and analytics inventory.
- `docs/shopify-whatsapp-automation.md` — inactive-by-default Shopify/CEQUENS automation setup, testing, and rollback.

## Production documentation

Read in this order before editing:

1. `AGENTS.md`
2. `CURRENT_STATE.md`
3. `DEPLOYMENT.md`
4. `TRACKING.md`

The repository also preserves earlier Framer and cross-chat handoff documentation. It is historical reference only, is not part of active hosting/development/maintenance, and must not be deleted or used for deployment unless the user explicitly revives that workflow.

## Tracking semantics

- `CTAOpenForm` — ordinary header/sticky free-guide interaction; never a conversion.
- `FormStart`, `FormError`, `FormSubmit` — PII-free form diagnostics with enrollment type, seats, tier, and total context.
- `Lead` — only after a valid submission reaches the qualified thank-you state.
- `SeatCalculatorChange`, `TierUnlocked`, `EnrollmentTypeSelected` — pricing and type interactions.
- `EnrollmentPageView`, `ParticipantsSaved`, `PaymentPathSelected`, `InvoiceRequested`, `PaymentLinkShared`, `CohortSwitched` — post-submit enrollment interactions.
- `CapabilitySelect` — changed skills-matrix selection.
- `InitiateCheckout` — Copilot Pay click with the displayed total and Shopify variant.
- `VideoPlay` — first tracked graduation/session video play.
- `Purchase` — future confirmed-payment event; not implemented.

The browser Pixel forwards standard `ViewContent`, `Lead`, and `InitiateCheckout` events and sends all other active events as custom events. No CAPI, Purchase event, or PII event parameter is present.

## Pending production work

1. Review the Copilot enrollment Vercel Preview and its attached screenshot/data evidence.
2. Merge the focused PR only after Preview approval; merging `main` is the production release.
3. Verify Meta Test Events for Pixel `1982493002344234` on the deployed production hostname.
4. Keep verifying responsive, accessibility, form, roster, payment, media, checkout, and event behavior after every production change.
