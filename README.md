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

- `/` — landing page, dynamic Offline/Online pricing, and a three-field free-guide form plus hidden selected format.
- `/thank-you` — qualified local thank-you state, format checkout, videos, skills matrix, instructors, and FAQ.
- `/preview/mobile` — 390px live review frame.
- `/preview/tablet` — 768px live review frame.
- `/preview/desktop` — 1440px live review frame.

## Current experience

The landing page uses the official Meska logo, relaxed build-focused hero copy, a Cloudflare Stream 16:9 overview video, one compact format-aware price card, one-line `5 interest-free payments via Sympl.` copy, a three-field free-guide form, impact metrics, independent outcome disclosures, a transparent greyscale sixteen-logo marquee, a shared nine-session curriculum disclosure, nine Cloudflare video testimonials, nine image testimonial cards, and a persistent free-guide CTA after the hero.

The thank-you page begins with the Cloudflare-hosted free guide, followed by the graduation story, shared curriculum, one accessible unified checkout card, both approved Shopify checkout destinations, nine portrait session videos, a nine-item skills-to-business-value matrix, four official instructors, shared video testimonials, and sixteen FAQs. All below-fold videos are user-controlled; starting one pauses any other playing Stream player.

The current local form validates and synchronizes the selected format, posts to the server-only Supabase route, records PII-free events, stores a qualified token only after accepted persistence, preserves supported attribution, and redirects to the thank-you route. Preview and production journey verification remain required before release.

## Project map

- `app/content.ts` — approved copy, facts, formats, prices, checkout URLs, asset records, FAQs, and stable tracking IDs.
- `app/components/LandingPage.tsx` — landing composition and sticky trigger/focus return.
- `app/components/ThankYouPage.tsx` — thank-you composition.
- `app/components/sections.tsx` — reusable controls, form, sections, carousels, checkout, media coordination, and trackers.
- `app/components/MetaPixel.tsx` — one-time Pixel loading and pathname `PageView` tracking.
- `app/lib/tracking.ts` — local evidence, Meta forwarding, deduplication, attribution, and PII filtering.
- `app/globals.css` — design tokens, layouts, breakpoints, focus, safe-area, and reduced-motion rules.
- `public/media/` — 77 local approved/source/optimized media files.
- `tests/rendered-html.test.mjs` — landing, thank-you, and regression assertions.
- `worker/index.ts` / `vite.config.ts` — retained worker compatibility/history; not the active Vercel adapter.
- `vercel.json` — explicit Next.js framework, install, and build contract.
- `DEPLOYMENT.md` / `TRACKING.md` — production workflow/status and analytics inventory.

## Production documentation

Read in this order before editing:

1. `AGENTS.md`
2. `CURRENT_STATE.md`
3. `DEPLOYMENT.md`
4. `TRACKING.md`

The repository also preserves earlier Framer and cross-chat handoff documentation. It is historical reference only, is not part of active hosting/development/maintenance, and must not be deleted or used for deployment unless the user explicitly revives that workflow.

## Tracking semantics

- `CTAOpenForm` — ordinary header/sticky free-guide interaction; never a conversion.
- `FormStart`, `FormError`, `FormSubmit` — PII-free form diagnostics with synchronized format.
- `Lead` — only after a valid submission reaches the qualified thank-you state.
- `FormatSelect` — changed landing/checkout format selection.
- `CapabilitySelect` — changed skills-matrix selection.
- `InitiateCheckout` — matching Offline/Online checkout click.
- `VideoPlay` — first tracked graduation/session video play.
- `Purchase` — future confirmed-payment event; not implemented.

The browser Pixel forwards standard `ViewContent`, `Lead`, and `InitiateCheckout` events and sends all other active events as custom events. No CAPI, Purchase event, or PII event parameter is present.

## Pending production work

1. Verify all 21 Stream players in Vercel Preview.
2. Release the Phase 2 branch through Preview and PR after Git metadata writes are available.
3. Verify controlled Supabase leads and Meta Test Events for Pixel `1982493002344234` on the deployed build.
4. Keep verifying responsive, accessibility, form, media, checkout, and Pixel/event behavior after every production change.
