# Meska AI Diploma Journey — Project Handoff

Current implementation handoff · 15 August 2026

The current files are the accepted post-amendment and corrective visual-quality baseline. Read `NEXT_CHAT_HANDOFF.md` for the standalone cross-chat continuation record. Do not rerun, undo, or reinterpret completed layout work without a new explicit user instruction.

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
- Production Meta Pixel, Google Sheet capture, Shopify checkout URLs, and the remaining thank-you/instructor/social media are intentionally absent. The approved landing video, organization logos, and testimonial screenshots are now local.
- No D1 database or R2 bucket is configured.
- The landing and thank-you implementations are complete as an approval prototype; the production integrations and approved assets listed below remain unfinished.

## Current page structure and section order

### Landing page `/`

1. Pill header with Meska AI mark and Start Application anchor.
2. Compact hero eyebrow, H1, accent statement, and subtitle.
3. Primary conversion cluster: approved 1080p video, dynamic price card, and one seven-field interest form. Mobile and 768px tablet stack these in that order; 1024px and desktop align the video/price column beside the same form.
4. Compact three-metric impact strip.
5. Four keyboard-accessible outcome disclosures in a dense grid.
6. Sixteen-logo professional-affiliation grid: four swipeable 2×2 pages on mobile, two pages visible at tablet widths, and one static 8×2 grid at desktop widths.
7. One collapsed nine-session curriculum disclosure; the graduation-project row has a compact accent treatment.
8. Nine-card approved testimonial image carousel.
9. Compact footer.
10. Mobile-only sticky Start Application CTA after the full hero/conversion cluster leaves view and before the footer enters view.
11. Shared application modal for the sticky CTA, mounted once at page level.

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
| `MEDIA_PLACEMENT_PLAN.md` | Approved placement, responsive behavior, copy, and interaction decisions for landing media. |
| `MEDIA_ASSET_MANIFEST.md` | Complete asset provenance, local filenames, dimensions, sizes, placement, authorization, tracking, and Framer-upload status. |
| `tests/rendered-html.test.mjs` | SSR checks for `/` and `/thank-you`; verifies metadata, critical content, forms, and absence of Pixel code. |
| `vite.config.ts` | vinext, Sites build packaging, Cloudflare Worker configuration, local inspector disablement, and sandbox HMR polling. |
| `worker/index.ts` | Cloudflare Worker entry and image-optimization route. |
| `build/sites-vite-plugin.ts` | Packages `.openai/hosting.json` into the build output. |
| `app/chatgpt-auth.ts` | Unused starter authentication helper; it is not part of the diploma journey. |
| `FRAMER_HANDOFF.md` | Native Framer recreation and Meta tracking specification. |
| `NEXT_CHAT_HANDOFF.md` | Standalone current-state, decision-history, responsive, tracking, validation, and continuation handoff. |
| `AGENTS.md` | Permanent rules for future Codex chats. |

`app/components/sections.tsx` exports the reusable major components: `BrandMark`, `SiteHeader`, `SectionHeading`, `DiplomaVideo`, `VideoPlaceholder`, `LeadCapture`, `StatsStrip`, `OutcomesSection`, `OrganizationLogoRail`, `SyllabusSection`, `TestimonialCarousel`, `LeadModal`, `StickyMobileCTA`, `CheckoutSection`, `SnippetsCarousel`, `InstructorSection`, `FAQSection`, `SiteFooter`, and `ThankYouLeadTracker`.

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
| `--radius-lg` | `36px` |
| `--shadow-sm` | `0 10px 40px rgba(0, 17, 28, 0.08)` |
| `--shadow-blue` | `0 20px 60px rgba(10, 114, 243, 0.24)` |
| `--shell` | `1280px` |
| `--space-1` … `--space-10` | `4, 8, 12, 16, 20, 24, 32, 40, 48, 64px` |
| `--section-space` | `40px` base; `48px` from 700px; `64px` from 960px |
| `--page-gutter` | `16px` base; `24px` from 700px; `32px` from 960px |
| `--font-sans` | `Inter` followed by the system sans-serif stack |

Global body text is 16px/1.55 at every landing breakpoint. Form labels are 13px/1.35, controls are 50px tall, and interactive targets remain at least 44px. Mobile H1 is 40–44px/1.02; non-hero H2 is 26–30px/1.15. At 700px, H1 becomes 54–72px and H2 becomes 34–44px. From 1200px, H1 is capped at 88px and H2 at 52px.

## Responsive behavior and breakpoints

The stylesheet is mobile-first with three progressive breakpoints plus one narrow-mobile safeguard:

| Range | Current behavior |
|---|---|
| Base / below 700px | 16px gutters; hero → video → pricing → one-column form; 2×2 impact; one-column outcomes; four swipeable 2×2 logo pages; one testimonial card; collapsed curriculum; full-screen form overlay. |
| `min-width: 700px` | 24px gutters; intentional stacked 768px conversion cluster; two-column form rows; 4-cell impact row; two-column outcomes; two logo pages/four columns visible; two testimonial cards. |
| `min-width: 960px` | 32px gutters; hero copy above a top-aligned `46% / 54%` video-price/form row; three price facts in one row. |
| `min-width: 1200px` | 1280px max shell; four outcome cells; static 8×2 logo grid; three testimonial cards; controlled desktop typography. |
| `max-width: 359px` | Header spacing and brand sizing tighten without reducing form readability or touch targets. |

The required validation widths are 320, 360, 390, 430, 768, 1024, and 1440px, plus 1920px when relevant. Do not replace the breakpoint behavior with a simple universal stack: conversion-cluster proportions, content order, touch sizes, modal behavior, disclosure state, and carousel paging are intentional.

## Content management and assets

All editable course information is centralized in `app/content.ts`:

- `brand` and `hero`: diploma name and hero copy.
- `form`: form heading, disclosure, button label, and prototype notice.
- `diplomas`: waves, dates, times, duration, delivery format, venue, price, numeric value, currency, checkout URL, and inclusions.
- `stats`, `outcomes`, `syllabus`, `instructors`, and `faq`: repeatable content arrays.
- `media`: local main-video/poster paths, organization-section copy and logo records, and nine testimonial records with dimensions and alt text.
- `trackingNames`: stable CTA, form, view, and checkout identifiers.

Visual variables and responsive rules live in `app/globals.css`. Tracking behavior lives in `app/lib/tracking.ts`. Route SEO lives in `app/layout.tsx`, `app/page.tsx`, and `app/thank-you/page.tsx`.

Approved landing media is stored under `public/media/images`, `public/media/videos`, and `public/media/logos`. Each selected asset has an untouched original and, where needed, a separate optimized or monochrome presentation copy. The rendered page references only local files. See `MEDIA_ASSET_MANIFEST.md` for all original URLs, dimensions, sizes, local filenames, crop behavior, authorization, and Framer upload status. The Meska mark remains CSS-built. Review screenshots and the Mac launcher are under ignored `outputs/`; they are local artifacts, not source-of-truth production assets.

Still-required approved assets:

- Meska AI SVG logo.
- Thank-you participant video, poster, captions, and transcript.
- Three compressed portrait session clips and posters.
- Four instructor portraits and final alt text.
- 1200×630 Open Graph image.

## Existing interactions and animations

- Header CTA anchors to `#apply` without duplicating the form.
- The sticky CTA opens a native `<dialog>` containing the modal application form.
- The modal supports the close button, Escape/cancel, and native focus behavior; on mobile it becomes a full-screen sheet and hides its duplicate price panel.
- Diploma dropdown switches the visible price and delivery facts between offline and online.
- All seven form fields are required. Invalid submit shows inline errors and focuses the first invalid control.
- Valid local submit writes a pending lead token and attribution to `sessionStorage`, then redirects immediately to `/thank-you?diploma={selection}`.
- Main diploma video is user-initiated, 16:9, inline-capable, and uses visible native controls with no playback tracking.
- Outcomes use native `<details>` so all approved descriptions remain available without tall default cards.
- Curriculum uses one native `<details>` container, collapsed by default at every landing breakpoint; all nine rows remain keyboard-accessible when expanded.
- Testimonial carousel uses horizontal scroll snapping, shows three/two/one cards across desktop/tablet/mobile, and has no autoplay, click-through, expansion, or tracking. Every screenshot uses its natural responsive height with `object-fit: contain`; embedded post text is never cropped.
- Organization logos have no automatic motion and no duplicated loop set. Mobile shows four ordered 2×2 swipeable pages, tablet exposes two pages/four columns at a time, and desktop displays all sixteen in a static 8×2 grid. Every logo is contained, non-clickable, and untracked.
- Session snippets cycle vertically with up/down controls; no autoplay.
- FAQ uses native `<details>`; the first item begins open.
- Sticky mobile CTA visibility is driven by `IntersectionObserver` checks on the hero and footer: it appears only after the full conversion cluster leaves view and hides again when the footer enters view.
- Buttons use 180ms hover transitions. Smooth motion and transitions are effectively disabled under `prefers-reduced-motion: reduce`.

## CTA destinations

| CTA | Current destination or action |
|---|---|
| Header Start Application | `#apply` |
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
- Thank-you videos/session clips, instructor photography, Meska SVG logo, and Open Graph image are still missing. The landing video, sixteen organization logos, and nine testimonial screenshots are implemented locally.
- Session times remain `To be confirmed` in central content for later approval, but the empty-value Schedule fact has been intentionally removed from the landing pricing card.
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
- Dependencies are currently usable through the existing lockfile/runtime. The approved landing-media build completed successfully on 15 August 2026 without changing dependency versions.

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

`pnpm test` performs a production build and then runs the two SSR tests. Test mobile first at 320, 390, and 430px, then 768, 1024, and 1440px. At each width check horizontal overflow, heading order, form labels/errors, modal behavior, sticky CTA overlap, price switching, disclosures, both carousels, FAQ, checkout pending state, route metadata, and the console event array.

Current validation record on 15 August 2026:

- The cross-chat handoff re-ran `pnpm lint`, `pnpm exec tsc --noEmit`, and `pnpm test`; lint, TypeScript, the production build, and both SSR tests passed without dependency changes.
- Live server reachable at `localhost:3000`.
- Production build, lint, TypeScript, and both SSR tests pass. The existing lockfile and dependency versions are unchanged.
- Landing page rendered in the real browser at 320, 360, 390, 430, 768, 1024, 1440, and 1920px with `scrollWidth <= clientWidth` and no browser-console errors.
- The prior over-compressed 390×844 page measured 2,109px / 2.499 viewport heights. The corrected page is 4,745px / **5.622 viewport heights**. The height increase is intentional: 16px body copy, one-column mobile fields, uncropped natural-height testimonial media, comfortable section/card spacing, and usable controls now take precedence over the withdrawn hard height target.
- At 390px the first fold contains the header, complete hero copy, and complete 16:9 video; the pricing card begins immediately below. The form remains early in the journey without being forced into the first viewport.
- The 390px major-section heights are: header 56px; hero/conversion cluster 1,929px; impact 272px; outcomes 502px; logos 476px; curriculum 254px collapsed; testimonials 994px; footer 253px.
- Fully expanding the 390px curriculum produces 5,928px total height, or 7.024 viewport heights; all nine rows and the graduation-project treatment are accessible. The default initial state remains collapsed.
- At 768px the conversion area deliberately stacks to protect video and form usability. At 1024px and above, the video/price and same form instance share a top-aligned `46% / 54%` row.
- Thank-you page rendered in the 1440px review frame with both diploma cards.
- Empty submission focused `fullName`, rendered six errors (the diploma select has a valid default), logged `FormStart` and `FormError`, and logged no `Lead`.
- Sticky CTA visibility and modal opening passed at 390px; one deliberate click logged one `CTAOpenForm`. The CTA hides at the footer.
- A valid local submission redirected to `/thank-you?diploma=offline`, logged exactly one `Lead`, and logged one qualified `LeadThankYouView`; reload did not duplicate either event.
- Direct thank-you navigation logged `LeadThankYouView` with `has_submission_state: false` and did not log `Lead`. Opening outcomes/curriculum logged no conversion event.
- No Meta script, Pixel ID, `fbq`, production event, WhatsApp link, or duplicated responsive form was introduced.
- Approved landing media was checked in the live page: all 16 logos and all nine testimonial WebPs load from local paths; logos use `contain`; testimonial rendered ratios match their source ratios exactly; the video remains 16:9 with native controls and conservative metadata loading.
- Carousel next/previous movement, native outcome/curriculum disclosures, form modal, validation focus, internal routes, and media loading were exercised in the live page. Layout interactions emitted no conversion events.
- Final viewport screenshots are under ignored `outputs/layout-validation/` for 390px, 768px, and 1440px.

| Viewport | Viewport height | Collapsed page height | Page-height ratio | Result |
|---:|---:|---:|---:|---|
| 320px | 568px | 4,767px | 8.393 | No overflow; single-column form and 40px H1 remain readable. |
| 360px | 800px | 4,737px | 5.921 | Required project width; no overflow and 16:9 video preserved. |
| 390px | 844px | 4,745px | 5.622 | Primary mobile visual-quality check passed. |
| 430px | 932px | 4,857px | 5.211 | No overflow; natural media scaling preserved. |
| 768px | 1,024px | 4,390px | 4.287 | Dedicated stacked tablet conversion layout. |
| 1024px | 768px | 4,018px | 5.232 | Top-aligned 46/54 conversion row. |
| 1440px | 900px | 4,075px | 4.528 | Controlled 1280px desktop shell. |
| 1920px | 1,080px | 4,127px | 3.821 | Max-width and typography caps prevent stretching. |

## Permanent rules for future Codex chats

Future chats must read `NEXT_CHAT_HANDOFF.md`, `AGENTS.md`, this document, and `FRAMER_HANDOFF.md` before changing the project. Preserve the accepted baseline, approved conversion definition, section order, mobile-first behavior, centralized content/tokens/tracking, and no-invented-content rule. Do not repeat completed amendments, restore intentionally removed elements, install a real Pixel, add a Pixel ID, publish, deploy, connect production destinations, or introduce new conversion paths without explicit user approval. Do not treat review screenshots as the website; inspect the responsive code and validate the live routes after any future implementation change.
