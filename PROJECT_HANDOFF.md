# Meska AI Diploma Journey — Project Handoff

Current implementation handoff · 15 August 2026

## Purpose and conversion goal

This repository is a local approval prototype for Meska AI’s English AI Co-Pilot Diploma journey. It contains a conversion landing page and a thank-you/Shopify handoff page designed for later native recreation in Framer.

The single landing-page conversion goal is **Start Application**. A lead is counted only after a valid interest-form submission reaches the thank-you page with the pending submission token. The local form does not store data; the Google Sheet or webhook connection will be added during the Framer phase. Payment happens outside this page through Shopify.

This project is not published and must not be published without explicit approval.

## Current implementation snapshot

- Framework: Next.js App Router rendered through vinext/Vite and a Cloudflare Worker entry.
- Language: English.
- Primary route: `/`.
- Thank-you route: `/thank-you`.
- Review-only routes: `/preview/mobile`, `/preview/tablet`, `/preview/desktop`.
- Review frame widths: 390px, 768px, and 1440px respectively.
- Production Meta Pixel, Google Sheet capture, Shopify checkout URLs, and final media are intentionally absent.
- No D1 database or R2 bucket is configured.
- The landing and thank-you implementations are complete as an approval prototype; the production integrations and approved assets listed below remain unfinished.

## Current page structure and section order

### Landing page `/`

1. Pill header with Meska AI mark and Start Application anchor.
2. Hero eyebrow, H1, accent statement, subtitle, primary CTA, curriculum link, and orbit graphic.
3. Main diploma video placeholder.
4. Five-cell course-details bar.
5. Primary dynamic price card and seven-field interest form.
6. Three-metric impact strip.
7. Four outcome cards.
8. Twelve-slot client-logo placeholder grid.
9. Mid-page Start Application CTA, opening the form modal.
10. Nine-session syllabus.
11. Six-card testimonial image carousel placeholder.
12. Final dynamic price card and duplicate interest form.
13. Footer.
14. Mobile-only sticky Start Application CTA after the hero leaves view.
15. Shared application modal, mounted at page level.

### Thank-you page `/thank-you`

1. Lead-success tracker and thank-you-view tracker.
2. Pill header with Choose Diploma anchor.
3. Participant-story video hero placeholder.
4. Two diploma/checkout cards: offline and online.
5. Three-item portrait session-snippet carousel placeholder.
6. Four instructor cards with image placeholders.
7. Six-item FAQ.
8. Footer.

### Review routes

Each `/preview/*` route renders a review toolbar and an iframe containing the real landing or thank-you page. The toolbar changes review size and switches the iframe between the two pages. These routes are `noindex, nofollow` and are not production journey pages.

## Component and file structure

| File | Responsibility |
|---|---|
| `app/layout.tsx` | Root document language and shared metadata defaults. |
| `app/page.tsx` | Landing route metadata and `LandingPage` mount. |
| `app/thank-you/page.tsx` | Thank-you metadata, noindex rules, and `ThankYouPage` mount. |
| `app/preview/*/page.tsx` | 390/768/1440 review route definitions. |
| `app/components/LandingPage.tsx` | Landing-page section composition and sticky/modal state. |
| `app/components/ThankYouPage.tsx` | Thank-you-page section composition. |
| `app/components/DevicePreview.tsx` | Review toolbar and real-page iframe. |
| `app/components/sections.tsx` | All reusable section, form, modal, carousel, checkout, footer, and tracker components. |
| `app/content.ts` | Central source for diploma facts, prices, copy, lists, FAQs, instructors, and tracking names. |
| `app/lib/tracking.ts` | Local-only `trackEvent()`, event IDs, duplicate prevention, PII filtering, and attribution storage. |
| `app/globals.css` | Design tokens, all page styles, responsive rules, focus states, and reduced-motion rules. |
| `tests/rendered-html.test.mjs` | SSR checks for `/` and `/thank-you`; verifies metadata, critical content, forms, and absence of Pixel code. |
| `vite.config.ts` | vinext, Sites build packaging, Cloudflare Worker configuration, local inspector disablement, and sandbox HMR polling. |
| `worker/index.ts` | Cloudflare Worker entry and image-optimization route. |
| `build/sites-vite-plugin.ts` | Packages `.openai/hosting.json` into the build output. |
| `app/chatgpt-auth.ts` | Unused starter authentication helper; it is not part of the diploma journey. |
| `FRAMER_HANDOFF.md` | Native Framer recreation and Meta tracking specification. |
| `AGENTS.md` | Permanent rules for future Codex chats. |

`app/components/sections.tsx` exports the reusable major components: `BrandMark`, `SiteHeader`, `SectionHeading`, `VideoPlaceholder`, `CourseDetailsBar`, `LeadCapture`, `StatsStrip`, `OutcomesSection`, `ClientLogoGrid`, `MidPageCTA`, `SyllabusSection`, `TestimonialCarousel`, `LeadModal`, `StickyMobileCTA`, `CheckoutSection`, `SnippetsCarousel`, `InstructorSection`, `FAQSection`, `SiteFooter`, and `ThankYouLeadTracker`.

## Design tokens

The canonical token definitions are at the top of `app/globals.css`.

| Token | Current value |
|---|---|
| `--ink` | `#00111c` |
| `--ink-soft` | `#31414b` |
| `--muted` | `#6a747c` |
| `--blue` | `#0a72f3` |
| `--blue-bright` | `#00a8ff` |
| `--blue-pale` | `#eaf5ff` |
| `--white` | `#ffffff` |
| `--paper` | `#f5f7f9` |
| `--line` | `#dce2e7` |
| `--line-dark` | `rgba(255, 255, 255, 0.18)` |
| `--success` | `#087d52` |
| `--error` | `#bd1e37` |
| `--radius-sm` | `14px` |
| `--radius-md` | `24px` |
| `--radius-lg` | `36px`; becomes `26px` at 560px and below |
| `--shadow-sm` | `0 10px 40px rgba(0, 17, 28, 0.08)` |
| `--shadow-blue` | `0 20px 60px rgba(10, 114, 243, 0.24)` |
| `--shell` | `1280px` |
| `--section-space` | `clamp(5rem, 9vw, 9rem)`; becomes `5.4rem` at 560px and below |
| `--font-sans` | `Inter` followed by the system sans-serif stack |

Global body text is 16px/1.55, becoming 15px on mobile. Buttons and controls have 44px or larger touch targets. Headings use fluid `clamp()` scales defined with each component rather than a separate token map.

## Responsive behavior and breakpoints

The stylesheet has three implementation breakpoints:

| Range | Current behavior |
|---|---|
| Base / over 1100px | 1280px shell; two-column heroes and forms; five-column details; four outcomes/instructors; six logos; two checkout cards. |
| `max-width: 1100px` | Asymmetric two-column hero; three-column details; two outcomes/instructors; four logos; narrower price panel. |
| `max-width: 820px` | 24px canvas gutters; hero, thank-you hero, form, impact strip, and snippets become single-column; price panel remains above form; checkout cards stack. |
| `max-width: 560px` | 16px canvas gutters; mobile typography/radii; two-column details with final item spanning; one-column fields, stats, outcomes, instructors, and checkout details; two-column logos; full-screen form modal; sticky CTA enabled. |

The intended validation widths are 360, 390, 768, 1024, and 1440px. Do not replace the breakpoint behavior with a simple universal stack: card proportions, content order, touch sizes, modal behavior, and carousel peeking are intentional.

## Content management and assets

All editable course information is centralized in `app/content.ts`:

- `brand` and `hero`: diploma name and hero copy.
- `form`: form heading, disclosure, button label, and prototype notice.
- `diplomas`: waves, dates, times, duration, delivery format, venue, price, numeric value, currency, checkout URL, and inclusions.
- `stats`, `outcomes`, `syllabus`, `instructors`, and `faq`: repeatable content arrays.
- `trackingNames`: stable CTA, form, view, and checkout identifiers.

Visual variables and responsive rules live in `app/globals.css`. Tracking behavior lives in `app/lib/tracking.ts`. Route SEO lives in `app/layout.tsx`, `app/page.tsx`, and `app/thank-you/page.tsx`.

Current repository assets in `public/` are `favicon.svg` plus unused starter icons `file.svg`, `globe.svg`, and `window.svg`. The Meska mark is currently CSS-built. Review screenshots and the Mac launcher are under ignored `outputs/`; they are local artifacts, not source-of-truth production assets.

Still-required approved assets:

- Meska AI SVG logo.
- Landing main video, poster, captions, and optional transcript.
- Twelve approved client logos and alt text/permissions.
- Six approved testimonial images and alt text.
- Thank-you participant video, poster, captions, and transcript.
- Three compressed portrait session clips and posters.
- Four instructor portraits and final alt text.
- 1200×630 Open Graph image.

## Existing interactions and animations

- Header and hero CTAs scroll smoothly to `#apply`.
- Mid-page and sticky CTAs open a native `<dialog>` containing the same application form.
- The modal supports the close button, Escape/cancel, and native focus behavior; on mobile it becomes a full-screen sheet and hides its duplicate price panel.
- Diploma dropdown switches the visible price and delivery facts between offline and online.
- All seven form fields are required. Invalid submit shows inline errors and focuses the first invalid control.
- Valid local submit writes a pending lead token and attribution to `sessionStorage`, then redirects immediately to `/thank-you?diploma={selection}`.
- Testimonial carousel uses horizontal scrolling and previous/next controls; no autoplay.
- Session snippets cycle vertically with up/down controls; no autoplay.
- FAQ uses native `<details>`; the first item begins open.
- Sticky mobile CTA visibility is driven by an `IntersectionObserver` watching the hero.
- Buttons use 180ms hover transitions. Smooth motion and transitions are effectively disabled under `prefers-reduced-motion: reduce`.

## CTA destinations

| CTA | Current destination or action |
|---|---|
| Header Start Application | `#apply` |
| Hero Start Application | Smooth scroll to `#apply` |
| Explore the curriculum | `#curriculum` |
| Mid-page Start Application | Open application modal |
| Sticky mobile Start Application | Open application modal |
| Any valid interest form | `/thank-you?diploma={offline|online}` plus captured attribution |
| Thank-you Choose Diploma | `#checkout` |
| Offline checkout | Visible `Shopify link pending` state because `checkoutUrl` is empty |
| Online checkout | Visible `Shopify link pending` state because `checkoutUrl` is empty |

There is no WhatsApp CTA or destination in the approved journey.

## Meta Pixel and current tracking

No real Pixel, Pixel ID, `fbq`, CAPI call, or third-party analytics request exists in this prototype. `app/lib/tracking.ts` logs safe test events to the console and `window.__MESKA_EVENTS__`.

Current events are `ViewContent`, `CTAOpenForm`, `FormStart`, `FormError`, `Lead`, `PricingView`, `LeadThankYouView`, `InitiateCheckout`, `MediaPlaceholderClick`, and `CheckoutLinkPending`.

Important current rules:

- `PageView` belongs to the future one-time Meta base code and is not duplicated.
- `ViewContent` fires once per session for a meaningful landing view.
- Pricing views use a 35% visibility threshold and a session once-key.
- `Lead` fires only on the thank-you page when a pending successful-submission token exists; the token is consumed immediately.
- A direct thank-you visit fires `LeadThankYouView` with `has_submission_state: false`, never `Lead`.
- `InitiateCheckout` fires only when a non-empty Shopify URL exists.
- `Purchase` is not implemented; it must come from confirmed Shopify payment.
- UTM parameters and `fbclid` are captured in `sessionStorage` and copied to the internal redirect query.
- Names, emails, phone/mobile, job, and company values are filtered from event parameters. Do not add form PII to tracking.

The complete current-to-Framer event matrix, duplicate-prevention rules, installation instructions, UTM handling, and future CAPI notes are in `FRAMER_HANDOFF.md`.

## SEO configuration

- Document language: `en`.
- Metadata base: `https://meska.ai`.
- Landing title: `AI Co-Pilot Diploma | Meska AI`.
- Landing description: `A hands-on AI diploma for professionals and managers who want to automate work, improve decisions, and lead smarter.`
- Shared Open Graph type/site/title/description are provisional; no OG image exists.
- Thank-you title: `Your AI Co-Pilot Diploma Options | Meska AI`.
- Thank-you description: `Compare the Meska AI online and offline diploma options and continue to the appropriate checkout.`
- Thank-you and all preview routes are `noindex, nofollow`.
- The current pages use one H1 each and semantic section/card headings.

Before launch, approve the production slug, canonical URL, final SEO copy, Open Graph image/copy, privacy/legal links, and whether structured data is appropriate.

## Approved decisions that must be preserved

- Single landing conversion goal: **Start Application**.
- English page.
- Required fields: Full Name, email, Mobile number, online/offline diploma, job, company, company website.
- Immediate redirect to the thank-you page in the prototype; in production redirect only after the form integration confirms capture.
- Successful lead: confirmed form capture followed by the thank-you success state.
- Payment occurs in Shopify; checkout click is `InitiateCheckout`, confirmed payment is `Purchase`.
- The thank-you page contains the FAQ.
- Do not add landing-page eligibility or “who this is for” content.
- Do not add WhatsApp as a secondary path.
- Do not gate checkout by eligibility or add payment-before-eligibility explanation.
- Do not add a thank-you confirmation summary above checkout.
- Marketing events are not blocked by an on-page consent gate per the approved project setting; final legal disclosures still require production-owner review.
- No production Pixel inside the local prototype and no hard-coded Pixel ID.
- No publication or deployment without explicit approval.

## Known issues and unfinished work

Production-blocking items:

- Form submissions are not persisted. Connect the Framer form to the later Google Sheet/webhook and redirect only after a confirmed capture response.
- Offline and online Shopify checkout URLs are empty.
- Final videos, logos, testimonials, instructor photography, and Open Graph image are missing.
- Session times are `To be confirmed`.
- Eligibility, recording availability, cancellation/refund policy, and final legal/privacy disclosure copy need approved answers.
- Final SEO, canonical, social image/copy, and production route need approval.
- Production Meta base code, Pixel ID, event bridge, Events Manager QA, and optional future CAPI are not installed.
- Public claims, prices, dates, statistics, instructor bios, and inclusions must be re-approved before production; the prototype currently reflects the supplied/public-page content at build time.

Technical/documentation notes:

- The review routes are not covered by the SSR test file; they were checked live in the browser.
- `app/chatgpt-auth.ts` and three starter public SVGs are unused.
- There is no dedicated privacy, terms, 404, or form-provider error route.
- The local modal relies on native `<dialog>` behavior. Recreate focus trapping and restoration explicitly in Framer.
- The local `Lead` simulation is acceptable only for prototype measurement. Production must create the pending-success state after durable form capture, not before it.
- The package-manager validation attempt on 15 August 2026 caused the managed runner to recreate `node_modules`, then registry DNS was unavailable. The repository source and lockfile are intact, the user-started live server remained reachable, and the existing `dist` artifact passed both SSR tests. A fresh `pnpm install --frozen-lockfile` is required before the next local build/type/lint run.

## Build, run, test, and browser validation

Prerequisite: Node.js `>=22.13.0` and pnpm.

From a regular macOS Terminal:

```bash
cd /Users/ahmedzaki/Documents/Codex/2026-08-14/create-a-high-conversion-journey-of-2
pnpm install --frozen-lockfile
pnpm dev
```

Alternatively, double-click `outputs/START_MESKA_PREVIEW.command` in Finder. The launcher uses the bundled Codex Node/pnpm runtime and starts the same local development server. A local website is served by a running process, so keep that Terminal window open while viewing `localhost`; closing the process stops the site. This does not publish the project.

Useful URLs:

- Landing: `http://localhost:3000/`
- Thank-you: `http://localhost:3000/thank-you`
- Mobile review: `http://localhost:3000/preview/mobile`
- Tablet review: `http://localhost:3000/preview/tablet`
- Desktop review: `http://localhost:3000/preview/desktop`

Verification commands:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

`pnpm test` performs a production build and then runs the two SSR tests. Test mobile first at 360 and 390px, then 768, 1024, and 1440px. At each width check horizontal overflow, heading order, form labels/errors, modal behavior, sticky CTA overlap, price switching, both carousels, FAQ, checkout pending state, route metadata, and the console event array.

Current validation record on 15 August 2026:

- Live server reachable at `localhost:3000`.
- Landing page rendered through the real review iframe at 390px (`clientWidth = scrollWidth = 390`), 768px (`768`), and 1440px (`1440`).
- Landing H1 and title were correct at all three checked widths.
- Thank-you page rendered in the 1440px review frame with both diploma cards.
- Direct thank-you navigation logged `LeadThankYouView` with `has_submission_state: false` and did not log `Lead`.
- Existing `dist` artifact SSR tests: 2 passed, 0 failed.
- A fresh build/type/lint run was not completed after the managed dependency reinstall failed on unavailable registry DNS. Run the three commands above after reinstalling dependencies.
- Earlier full-browser screenshots remain under ignored `outputs/` for mobile, tablet, desktop, and thank-you visual reference.

## Permanent rules for future Codex chats

Future chats must read `AGENTS.md`, this document, and `FRAMER_HANDOFF.md` before changing the project. Preserve the approved conversion definition, section order, mobile-first behavior, centralized content/tokens/tracking, and no-invented-content rule. Do not install a real Pixel, add a Pixel ID, publish, deploy, connect production destinations, or introduce new conversion paths without explicit user approval. Do not treat review screenshots as the website; amend the responsive code and validate the live routes.

