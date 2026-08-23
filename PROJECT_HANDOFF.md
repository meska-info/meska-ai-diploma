# Meska AI Co-Pilot Diploma — master local project handoff

Complete continuation record · updated 23 August 2026

This document is the primary replacement for the previous Codex conversation. A fresh Codex session must be able to continue from the repository and these handoff files alone. Read `AGENTS.md`, `CURRENT_STATE.md`, `PROJECT_STATE.json`, `CHANGELOG_PROJECT.md`, `FRAMER_HANDOFF.md`, `MEDIA_ASSET_MANIFEST.md`, `MEDIA_PLACEMENT_PLAN.md`, and the actual source before making changes.

## 1. Project objective

This is a local English approval prototype for the Meska AI Co-Pilot Diploma. It contains:

- a mobile-first conversion landing page at `/`;
- a post-application consideration and checkout page at `/thank-you`;
- live responsive review wrappers at `/preview/mobile`, `/preview/tablet`, and `/preview/desktop`.

The landing page has one conversion goal: a valid interest-form submission. The current local form demonstrates validation, selected-format synchronization, attribution, tracking semantics, and the thank-you transition, but it deliberately does not send a lead to a production destination because neither verified format-specific endpoint exists.

## 2. Current local status

```text
LOCAL DEVELOPMENT: YES
LOCAL GIT REPOSITORY: YES
GIT BRANCH: main
GITHUB REMOTE: NOT YET
VERCEL PROJECT: NOT YET
PRODUCTION DEPLOYMENT: NOT YET
CUSTOM DOMAIN CONFIGURED BY THIS PROJECT: NOT YET
META PIXEL: NOT YET IMPLEMENTED
PRODUCTION LEAD DESTINATIONS: BOTH PENDING
LIVE FRAMER PROJECT CHANGED: NO
```

`app/layout.tsx` uses `https://meska.ai` as `metadataBase`; that metadata value is not evidence that this local project has been deployed or connected to a production domain.

The repository includes `.openai/hosting.json` with `d1: null` and `r2: null`, plus a vinext/Vite/Cloudflare Worker build path. It contains no Sites project ID, no Vercel project metadata, no `vercel.json`, no `.vercel/` state, no environment files, and no remote Git URL.

## 3. Git and checkpoint state

- Working directory and repository root: `/Users/ahmedzaki/Documents/Codex/2026-08-14/create-a-high-conversion-journey-of-2`
- Branch: `main`
- Current `HEAD`: `77cf2e01faa8716ccd83ad066702bbc3c1b6c5ef`
- Subject: `Checkpoint final layout amendments and cross-chat handoff`
- Commit date: 15 August 2026, Cairo time.
- Earlier local checkpoint: `6e175fc Checkpoint Meska diploma prototype handoff`.
- `git remote -v`: no output; no GitHub or other remote is configured.
- The accepted August conversion work is intentionally present in the uncommitted working tree. Do not reset or check out the checkpoint to “clean” the repository.
- The pre-handoff working tree contained 17 modified tracked files plus untracked local media, screenshots, and an unrelated `deliverables/meska-meetup/` artifact. Preserve all of them. The handoff task adds/updates documentation files only.

Never use `git reset --hard`, `git clean -fd`, force-push, or otherwise erase the accepted working tree.

## 4. Framework and runtime architecture

- Next.js App Router source conventions.
- React 19 and TypeScript 5.
- vinext on Vite 8.
- Cloudflare Worker entry at `worker/index.ts`.
- Sites packaging helper at `build/sites-vite-plugin.ts`.
- Plain CSS in one canonical stylesheet; Tailwind is imported but the implementation is component-class CSS rather than a Tailwind utility rewrite.
- pnpm with committed `pnpm-lock.yaml` and `pnpm-workspace.yaml`.
- Required Node.js version: `>=22.13.0`.
- No database, R2 bucket, app-owned authentication, external form service, or production analytics SDK is wired into the rendered routes.

The active web implementation is the local React application. Framer files are retained reference material, not runtime dependencies.

## 5. Actual repository map

```text
/
├── .openai/
│   └── hosting.json                 # Local Sites/vinext resource declaration; no project ID
├── app/
│   ├── components/
│   │   ├── DevicePreview.tsx        # Responsive review wrapper/iframe
│   │   ├── LandingPage.tsx          # Landing composition and sticky trigger
│   │   ├── ThankYouPage.tsx         # Thank-you composition
│   │   └── sections.tsx             # Shared sections, form, media, controls, trackers
│   ├── lib/
│   │   └── tracking.ts              # Local event bridge, dedupe, attribution, PII filter
│   ├── preview/
│   │   ├── mobile/page.tsx          # 390px review frame
│   │   ├── tablet/page.tsx          # 768px review frame
│   │   └── desktop/page.tsx         # 1440px review frame
│   ├── thank-you/page.tsx            # Thank-you route metadata and composition
│   ├── chatgpt-auth.ts               # Unused scaffold auth helper; not active on current routes
│   ├── content.ts                    # Approved copy, facts, assets, checkout URLs, tracking IDs
│   ├── globals.css                   # Tokens, components, responsive and motion rules
│   ├── layout.tsx                    # Root metadata/layout
│   └── page.tsx                      # Landing route
├── artifacts/full-page-pngs/         # 390/768/1440 full landing-page review PNGs
├── build/sites-vite-plugin.ts         # Copies Sites metadata into the build
├── deliverables/meska-meetup/         # Existing unrelated design exports; preserve, not runtime
├── public/media/
│   ├── brand/original/                # Official Meska logo
│   ├── images/original/               # Nine source testimonial screenshots
│   ├── images/optimized/              # Nine WebP testimonials
│   ├── images/posters/                # Main, graduation, and nine session posters
│   ├── instructors/optimized/         # Four instructor portraits
│   ├── logos/original/                # Sixteen organization source assets
│   ├── logos/monochrome/              # Sixteen presentation assets
│   ├── videos/original/                # Main landing video
│   └── videos/optimized/               # Graduation and nine session videos
├── tests/rendered-html.test.mjs       # Three rendered/regression tests
├── worker/index.ts                    # vinext Worker request/image entry
├── AGENTS.md                          # Fast operating rules
├── CHANGELOG_PROJECT.md               # Important project evolution
├── CURRENT_STATE.md                   # Concise continuation snapshot
├── FRAMER_HANDOFF.md                  # Native Framer reference specification
├── MEDIA_ASSET_MANIFEST.md            # File-level asset provenance and dimensions
├── MEDIA_PLACEMENT_PLAN.md            # Approved media order/behavior
├── NEXT_CHAT_HANDOFF.md               # Previous standalone handoff, retained
├── NEXT_CODEX_PROMPT.md               # Exact prompt for a fresh Codex session
├── PROJECT_STATE.json                 # Machine-readable state
├── README.md                          # Local setup and documentation map
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
└── vite.config.ts
```

Generated directories such as `node_modules`, `.next`, `.vinext`, `.wrangler`, and `dist` are not source of truth and are ignored by Git.

## 6. Important file ownership and stability

| File | Responsibility | Status / dependency notes |
| --- | --- | --- |
| `app/content.ts` | All approved program facts, copy, format records, inclusions, curriculum, FAQs, instructors, media, checkout URLs, stable tracking IDs. | Authoritative. Change only with approved facts. Landing intentionally does not render the inclusion arrays; thank-you checkout does. |
| `app/components/LandingPage.tsx` | Landing section order, selected format state, query initialization, hero observer, sticky form-return/focus behavior. | Accepted baseline. |
| `app/components/ThankYouPage.tsx` | Thank-you section order. | Accepted baseline. |
| `app/components/sections.tsx` | Shared semantic components, accessible toggles, form validation/redirect, disclosures, carousels, checkout, video exclusivity, matrix, FAQ, trackers. | Core behavior. `VideoPlaceholder` and `LeadModal` remain exported but are not mounted by current routes. |
| `app/lib/tracking.ts` | Local-only event bridge, session dedupe, event IDs, supported attribution, PII-key filtering. | No Pixel initialization or network transport. |
| `app/globals.css` | Tokens, layout, component styling, responsive breakpoints, focus, safe areas, reduced motion. | Canonical final cascade. It retains earlier style blocks followed by August override blocks; later rules are intentional and determine the accepted appearance. Do not delete/flatten casually. |
| `app/layout.tsx` | Site metadata and root HTML/body. | Local metadata only; `metadataBase` is not deployment proof. |
| `app/components/DevicePreview.tsx` | Local review toolbar and same-origin responsive iframe. | Development/review utility, not part of the conversion journey. |
| `tests/rendered-html.test.mjs` | Landing, thank-you, checkout URL, asset, Pixel absence, reduced-motion, form, and skills regressions. | Must continue to pass. |
| `public/media/` | Approved local media. | Critical; rendered pages do not hotlink essential images/video. |
| `FRAMER_HANDOFF.md` | Native Framer recreation/integration specification. | Reference only unless Framer work is explicitly resumed. |
| `MEDIA_ASSET_MANIFEST.md` | Full provenance, dimensions, original/derived records. | Authoritative asset inventory. |

## 7. Landing page — current accepted structure

Route: `/`

1. `SiteHeader`: official Meska logo linked home and a header `Start Application` anchor to `#apply`.
2. Hero copy:
   - eyebrow: `Meska AI Copilot Diploma`
   - H1: `Learn AI. Apply it to real business.`
   - subtitle: `Solve real business challenges alongside managers, CEOs, founders, mentors, trainers, and subject-matter experts.`
3. Primary conversion cluster:
   - compact `Why We Built the Diploma` H2;
   - local 16:9 overview video with poster/native controls;
   - one Offline/Online landing price card;
   - one interest form.
4. `StatsStrip`: `2,000+`, `100+`, `7+`.
5. `OutcomesSection`: four independent native disclosures.
6. `OrganizationLogoRail`: sixteen semantic logos plus one `aria-hidden` visual duplicate for a seamless loop.
7. `SyllabusSection`: one distinctive nine-session curriculum disclosure.
8. `TestimonialCarousel`: nine full, uncropped testimonial screenshots.
9. `SiteFooter`.
10. `StickyMobileCTA`: appears after the hero is no longer intersecting and remains through the footer; returns to/focuses full name.

The old hero CTA pair (`Start Application` and `Explore Curriculum`) is absent. This historical removal must not be confused with the current header Start Application anchor or sticky advisor CTA, which are active parts of the accepted conversion path. The old orbit image and course-detail bar are also absent.

## 8. Landing price card and format state

The landing uses one `selectedId` state in `LandingPage`, passed into `LeadCapture`. `FormatToggle` changes that same state. The following remain atomic:

- selected tab and ARIA state;
- price, wave, start, delivery, and location;
- one-line installment copy;
- hidden `diploma` value;
- form submit label;
- form/tracking variant;
- future lead-route record.

| Format | Wave | Start | Delivery | Location | Price | Form CTA |
| --- | --- | --- | --- | --- | ---: | --- |
| Offline | 14 | 22 August 2026 | 8 offline + 3 online live sessions | Creativa Innovation Hub · Giza | EGP 25,000 | Request Offline Diploma Details |
| Online | 10 | 23 August 2026 | 8 live + 3 online recap sessions | Virtual · Live sessions | EGP 20,000 | Request Online Diploma Details |

Both show `5 interest-free payments via Sympl.` and both have `leadDestination: null` / `leadDestinationStatus: "pending"`.

The landing Included heading, checkmarks, items, wrapper, gaps, reserved height, replacement disclosure, and secondary controls were intentionally removed. Nothing replaces them. The price card ends after its essential details. Do not delete the `included` arrays from `app/content.ts`; the thank-you checkout card legitimately uses those eight items.

## 9. Form implementation and current conversion flow

Rendered form: `primary_interest_form` inside the landing conversion cluster.

Visible required controls:

1. `fullName` — text, `autocomplete=name`
2. `email` — email, `autocomplete=email`
3. `mobile` — tel, `autocomplete=tel`
4. `job` — text, `autocomplete=organization-title`
5. `company` — text, `autocomplete=organization`
6. `website` — URL, `autocomplete=url`

Submitted hidden value:

7. `diploma` — exactly `offline` or `online`, controlled by the price toggle.

Current behavior:

- `noValidate` lets the component render its own accessible inline errors using native validity state.
- Empty/invalid submission builds errors, focuses the first invalid field, and emits PII-free `FormError`.
- Before success, the handler verifies the submitted hidden value equals the selected format.
- `submittingRef` and disabled state prevent duplicate submission in the current page lifecycle.
- A valid prototype submit creates an event ID, emits `FormSubmit`, stores `meska-pending-lead` in `sessionStorage`, preserves supported attribution, and redirects to `/thank-you?diploma={format}`.
- No external request is made. There is no implemented network error state because no endpoint exists.
- On thank-you, `ThankYouLeadTracker` fires one `Lead` only when the pending token exists, stores `meska-last-lead`, removes the pending token, and separately records `LeadThankYouView` with the qualified-state boolean.
- A direct/unqualified thank-you visit does not fire `Lead`.

Production must replace the prototype-only redirect sequence with: validate → submit exactly once to the selected verified destination → confirm durable capture → create qualified state → redirect. Never submit one lead to both destinations.

## 10. Attribution

`captureAttribution()` preserves these keys in `sessionStorage`:

- `utm_source`
- `utm_medium`
- `utm_campaign`
- `utm_term`
- `utm_content`
- `fbclid`

They are carried into the local thank-you query and qualified Lead payload. Checkout URLs receive stored attribution only when a key is not already present, so the complete approved Shopify query strings remain intact.

## 11. Thank-you page — current accepted structure

Route: `/thank-you`; route metadata is `noindex, nofollow`.

1. `ThankYouLeadTracker`.
2. `SiteHeader` with official logo and `Choose Diploma` anchor to `#checkout`.
3. Compact confirmation:
   - eyebrow: `Application received`
   - H1: `Thank you — we’ve got your details.`
   - subtitle: `A Meska advisor will contact you soon.`
4. `GraduationStory`: approved portrait graduation video plus previous-wave copy.
5. `CheckoutSection`: one accessible Offline/Online tablist and one unified dynamic checkout card.
6. `SnippetsCarousel`: nine portrait session videos.
7. `SkillsBusinessValueSection`: nine curriculum-grounded capability tabs plus one value panel and no-JavaScript fallback.
8. `InstructorSection`: Nabil Khalifa, Dr. Amr Fahmy, Youssef Al Refaey, Omar El Monayar.
9. `FAQSection`: sixteen independent details; first is open by default.
10. Light footer.

All ten thank-you videos are local 720×1280 H.264/AAC derivatives with local 720×1280 WebP posters, native controls, metadata preload, `playsInline`, and no autoplay. Starting one pauses all other page videos. Moving a playing session clip away from the active carousel position pauses it.

## 12. Checkout behavior

The checkout section has its own accessible format state, initialized from `diploma` query when valid. Arrow Left/Right/Up/Down and Home/End move focus and selection. One card updates wave, price, installment text, date, format, location, eight inclusions, CTA label, event value/currency, and destination together.

- Offline CTA: `Continue with the Offline Diploma`.
- Online CTA: `Continue with the Online Diploma`.
- Both complete Shopify destinations live only in `app/content.ts`; do not shorten or reconstruct their query strings.
- Checkout click emits `InitiateCheckout` with format, value, EGP currency, stable tracking ID, and event ID, then navigates to the matching checkout.
- `Purchase` is not implemented; it belongs to confirmed payment in the future commerce integration.

## 13. Curriculum, outcomes, and skills behavior

- Outcomes are four independent `<details>` elements. Opening one does not own or force the others.
- Curriculum is one `<details>` with a fully interactive summary, nine verified sessions, distinct closed/open action text, blue border/tint, orange action icon, and strong blue open state.
- Skills matrix uses `role=tablist`, roving `tabIndex`, `aria-selected`, `aria-controls`, `role=tabpanel`, pointer input, Arrow keys, Home/End, and visible focus.
- Mobile skill controls are horizontally scrollable card tabs. From 700px they become a vertical selector alongside the value panel.
- `Curriculum sessions …` is an inline `width: fit-content` pill with `10px 16px` padding, natural height, centered text, nowrap where it fits, and no absolute positioning.
- `CapabilitySelect` is emitted only after a changed selection.

## 14. Component inventory

| Component | File | Purpose and responsive behavior | Status / do not regress |
| --- | --- | --- | --- |
| `LandingPage` | `app/components/LandingPage.tsx` | Landing composition, query-selected format, hero observer, sticky focus return. | Active/stable. |
| `ThankYouPage` | `app/components/ThankYouPage.tsx` | Thank-you composition/order. | Active/stable. |
| `BrandMark` | `sections.tsx` | Official local logo and home link. | Active on headers/footers. Never recreate logo in CSS. |
| `SiteHeader` | `sections.tsx` | Responsive logo/CTA shell; emits CTA/Pricing event. | Active on both routes. |
| `SectionHeading` | `sections.tsx` | Shared eyebrow/H2/description hierarchy. | Active. |
| `DiplomaVideo` | `sections.tsx` | Main local 16:9 video. | Active; no autoplay/crop. |
| `FormatToggle` | `sections.tsx` | Shared accessible two-tab control. | Private helper; keyboard semantics locked. |
| `LeadCapture` / `FormField` | `sections.tsx` | Landing price/form, validation, prototype transition. | Active; single state source. |
| `StatsStrip` | `sections.tsx` | Three metrics plus label cell. | Active; intentionally compact. |
| `OutcomesSection` | `sections.tsx` | Four independent disclosures. | Active. |
| `OrganizationLogoRail` | `sections.tsx` | Sixteen-logo seamless marquee with hidden duplicate. | Active; transparent/greyscale. |
| `SyllabusSection` | `sections.tsx` | Distinctive nine-session disclosure. | Active. |
| `TestimonialCarousel` | `sections.tsx` | Nine natural-height screenshot cards, manual scroll/buttons. | Active; never crop aggressively. |
| `StickyMobileCTA` | `sections.tsx` | All-breakpoint advisor control and tracking. | Active through 100% depth. |
| `GraduationStory` | `sections.tsx` | Portrait graduation video/copy. | Active. |
| `CheckoutSection` | `sections.tsx` | One dynamic checkout card and routing. | Active; inclusions remain here. |
| `SnippetsCarousel` | `sections.tsx` | Nine portrait videos, manual scroll, exclusivity. | Active. |
| `SkillsBusinessValueSection` | `sections.tsx` | Interactive capability/value mapping. | Active; pill fix locked. |
| `InstructorSection` | `sections.tsx` | Four portraits/bios/LinkedIn links. | Active; do not restore Ahmed Mostafa. |
| `FAQSection` | `sections.tsx` | Sixteen approved FAQs. | Active; WhatsApp only in support answer. |
| `SiteFooter` | `sections.tsx` | Logo, local-prototype label, back to top. | Active. |
| `ThankYouLeadTracker` | `sections.tsx` | Qualified Lead/thank-you local events. | Active; conversion semantics locked. |
| `DevicePreview` | `app/components/DevicePreview.tsx` | 390/768/1440 same-origin review frames. | Development utility. |
| `VideoPlaceholder` | `sections.tsx` | Old placeholder implementation. | Exported but not rendered. Do not substitute it for approved media. |
| `LeadModal` | `sections.tsx` | Old modal form path. | Exported but not rendered. Do not reintroduce a duplicate form without explicit instruction. |

## 15. Design system extracted from source

Canonical tokens in `app/globals.css`:

| Token | Value |
| --- | --- |
| Deep navy / primary ink | `#151130` |
| Slate / soft ink | `#1E223D` |
| Muted | `#626477` |
| Primary blue | `#021F94` |
| Accent orange (`--blue-bright`) | `#F54F1B` |
| Pale blue | `#EBEEFA` |
| Paper/off-white | `#F5F2F3` |
| White | `#FFFFFF` |
| Line | `#D6D1D6` |
| Success | `#087D52` |
| Error | `#BD1E37` |
| Radii | `10px`, `18px`, `26px`; current header `14px` |
| Shadows | `0 12px 34px rgba(21,17,48,.08)` and `0 18px 46px rgba(2,31,148,.20)` |
| Shell max | `1280px` |
| Spacing scale | `4, 8, 12, 16, 20, 24, 32, 40, 48, 64px` |

Typography:

- Inter with system sans-serif fallbacks.
- Body `16px / 1.55`.
- Headings use strong weights around 760–830 and tight negative tracking; no forced line breaks.
- Hero H1 is fluid: approximately 40–44px base, 54–72px from 700px, and up to 88px from 1200px.
- Section H2s and price/checkout type use `clamp()` for controlled scaling.
- Form inputs remain 16px with 50px minimum height to avoid mobile zoom and preserve touch usability.

Interaction styling:

- Global visible focus: 3px orange outline with 4px offset.
- Primary buttons: blue, 10px radius, minimum 48px (44px small header), short transform/color/shadow transition.
- Fields: paper surface, 1px line border, 12px radius, blue focus ring, explicit error border/message.
- Cards: white/paper/navy surfaces using token radii and controlled shadows.
- Reduced motion disables smooth scrolling/animations/transitions, stops the marquee, hides the duplicate logo sequence, and keeps one manually scrollable semantic sequence.

## 16. Responsive system

Mobile-first source breakpoints are `700px`, `960px`, and `1200px`, with narrow overrides below `360px` and mobile-only rules through `699px`.

Global layout:

- `.shell` width is `min(100% - 2 × gutter, 1280px)`.
- Gutters: 16px base, 24px from 700px, 32px from 960px.
- Section spacing: 40px base, 48px from 700px, 64px from 960px.
- `main` clips page-level overflow; local horizontal carousels remain scrollable.

### Mobile: 320–699px

- Header keeps official logo and compact header CTA. Below 360px logo is 98px and CTA type/padding reduce moderately; above it logo is 116px.
- Hero and conversion stack: copy → media → price → form.
- Price details use two columns, with location spanning both. Installment copy stays on one line with fluid 12–14px type.
- Form fields are one column.
- Impact is a 2×2 grid; outcomes one column.
- Logo marquee remains transparent and moving; base slots are approximately 180×96 with 64px contained artwork.
- Curriculum summary is two columns with a 44px action icon (38px below 360px).
- Testimonials show one card; session videos show 86% width plus next-card peek.
- Skills are horizontally scrollable card tabs and one stacked panel.
- Instructors one column; checkout one column; graduation video is centered up to 360px.
- Sticky CTA is a safe-area-aware full-width inset bar. Landing footer reserves extra bottom space.

### Tablet: 700–959px

- Logo becomes 136px; page gutters 24px.
- Form email/mobile and job/company pairs become two columns.
- Outcomes and instructors use two columns.
- Graduation story becomes copy plus portrait video.
- Testimonial and session carousels show two cards.
- Skills become a two-column vertical selector/value layout with natural-height value panel.
- Logo slots grow to approximately 214×108 with 72px artwork.
- Sticky CTA becomes a right-aligned control up to 340px; footer still reserves clearance.

### Desktop transition: 960–1199px

- Page gutters 32px and section spacing 64px.
- Landing conversion becomes a top-aligned 46% media/price and 54% form grid.
- Price summary deliberately stacks within the narrower left column; details become three columns.
- Unified thank-you checkout becomes two internal columns with a divider.
- Skills selector/value columns widen to 280px/remaining space.

### Wide desktop: 1200px+

- Outcomes use four columns.
- Testimonials and Inside Diploma show three cards.
- Instructor grid uses four columns.
- The logo rail remains the later continuous marquee implementation; do not revive the earlier static desktop grid block found above the final override cascade.

Required future QA widths: 320, 375, 390, 768, 1024, 1280, 1440px.

## 17. Media and asset inventory

`public/media` currently contains 77 files (about 84 MiB):

- 1 official Meska logo: `public/media/brand/original/meska-2026-logo.png` (3283×576).
- 1 main 16:9 landing MP4 plus 1 WebP poster.
- 10 optimized portrait MP4s: graduation plus nine session clips.
- 10 portrait WebP posters: graduation plus nine session posters.
- 4 instructor WebP portraits.
- 9 original JPEG testimonial screenshots plus 9 optimized WebP presentation copies.
- 16 original organization assets plus 16 monochrome presentation assets.

The exact filenames, source provenance, original dimensions, durations, file sizes, optical treatment, authorization status, and Framer upload status are recorded in `MEDIA_ASSET_MANIFEST.md`. `MEDIA_PLACEMENT_PLAN.md` records order and responsive behavior. Both are authoritative and must be preserved.

Important behavior:

- Runtime pages use local assets; external URLs in the manifest are provenance/reference only.
- The main video uses its natural 16:9 frame with no crop.
- Portrait videos use their natural 9:16 frame with no heavy crop.
- Testimonials use `object-fit: contain` and natural height; do not crop them into uniform thumbnails.
- Instructor portraits use 4:5 `object-fit: cover` with top-centered focal point.
- Organization logos are transparent, borderless, greyscale, `object-fit: contain`, and optically normalized rather than forced into identical artwork dimensions.

`artifacts/full-page-pngs/` contains full landing captures at 390, 768, and 1440px. `deliverables/meska-meetup/` is an existing unrelated design export and is not imported by the website.

## 18. Tracking — implemented locally

`app/lib/tracking.ts` records PII-filtered local evidence to `window.__MESKA_EVENTS__` and the console. It does not call Meta, send a network request, or install a Pixel.

Implemented event names:

- `ViewContent`
- `CTAOpenForm`
- `FormStart`
- `FormError`
- `FormSubmit`
- `PricingView`
- `Lead`
- `LeadThankYouView`
- `FormatSelect`
- `CapabilitySelect`
- `InitiateCheckout`
- `VideoPlay`

The union also retains dormant placeholder/pending names used by non-rendered helpers. Stable active IDs include `diploma_landing_view`, `header_start_application`, `sticky_start_application`, `landing_format_toggle`, `primary_interest_form`, `checkout_format_toggle`, `skills_business_value_matrix`, `thank_you_graduation_video`, `inside_diploma_video_01` through `_09`, `offline_shopify_checkout`, and `online_shopify_checkout`.

Never pass full name, email, phone/mobile, job, company, or website values to events. CTA click is not Lead. Checkout click is not Lead or Purchase.

## 19. PENDING — Meta Pixel implementation

The production Meta Pixel is not present in source, generated HTML, environment configuration, or local runtime.

Future approved Pixel ID: `4138749493027663`.

When the user explicitly authorizes tracking implementation, the future agent must choose the correct framework-safe integration and implement the standard Meta loader/noscript equivalent once. It must prevent:

- duplicate Pixel initialization;
- duplicate initial or SPA `PageView` events;
- duplicate `Lead` between browser and future CAPI;
- hydration errors;
- PII in browser event parameters;
- conversions from ordinary CTA clicks.

The existing event IDs should be reused for future browser/server deduplication. Form conversion should occur only after durable capture. Thank-you state, UTMs, consent requirements, debug evidence, and actual emitted behavior must be tested before production. Do not add invented events without approval.

## 20. PENDING — production lead routing

Both `leadDestination` records are `null`. No Google Sheets Apps Script URL, webhook, secret, or environment variable exists in source, docs, ignored env files, or Git history.

Required future behavior after Meska supplies verified destinations:

- Offline → Offline destination only.
- Online → Online destination only.
- Never fan out to both.
- Preserve validation, consent/spam rules if supplied, errors, duplicate-submit prevention, attribution, selected format, and qualified thank-you semantics.
- Keep endpoint secrets out of analytics and public documentation; determine whether a server-side proxy is required.
- Use the project’s approved non-production test method before production traffic.

## 21. PENDING — GitHub setup

No remote exists. Do not create a repository during this handoff.

When explicitly requested, the next agent should:

1. re-read Git status and inspect the full accepted diff;
2. verify `.gitignore` and scan for secrets/credentials;
3. decide with the user whether current local assets and unrelated deliverables belong in the first remote push;
4. establish an intentional clean baseline commit without discarding the working tree;
5. ask for GitHub login/OAuth only if required;
6. create/connect the requested repository;
7. push without force;
8. verify branch and remote state.

Do not ask the user to paste passwords or tokens into chat.

## 22. PENDING — Vercel deployment

No Vercel project or deployment exists. Do not deploy during this handoff.

Detected local build contract:

- install: `pnpm install --frozen-lockfile`
- local development: `pnpm dev`
- current build: `pnpm build`
- package manager: pnpm
- Node: `>=22.13.0`
- current output: vinext/Vite Cloudflare Worker-style `dist/`, not a documented standard Vercel output directory.

Because this repository uses vinext, the Cloudflare Vite plugin, and `worker/index.ts`, a future Vercel phase must first decide whether to preserve the current adapter with a supported Vercel configuration or migrate the deployment build back to standard Next.js. Do not assume Vercel auto-detection is production-ready, and do not change the app architecture merely to prepare this handoff. Preserve route behavior, local media delivery, noindex thank-you metadata, client-side session state, and checkout redirects during any future deployment adaptation.

No application environment variables are currently required. Future lead endpoints, Pixel/CAPI configuration, or secrets must be documented in `.env.example` without real secret values and configured in the chosen host securely.

## 23. Framer reference status

`FRAMER_HANDOFF.md`, the media manifest, and placement plan remain comprehensive native Framer recreation material from an earlier/parallel direction. They are intentionally preserved.

They do not override the active local React implementation, trigger a Framer rebuild, authorize asset upload, or authorize publishing. Resume Framer only when explicitly instructed. If resumed, use native Stacks/Grids/Components/Variants/Forms/Video/Accordion structures and the exact current local behavior; do not import screenshots as the page.

## 24. LOCKED / APPROVED DECISIONS

- Current uncommitted implementation is the baseline.
- Mobile-first; every future change must be tested on mobile, tablet, and desktop.
- Page height matters, but hierarchy, readability, media integrity, and professional spacing matter more.
- Do not create crowded layouts or excessively reduce padding/type.
- Landing hero copy stays concise; no extra explanatory paragraph.
- Old hero CTA pair, orbit image, and course-detail bar stay removed; current header/sticky conversion controls stay.
- Landing Included area stays fully removed; thank-you checkout inclusions stay.
- Installment line remains `5 interest-free payments via Sympl.` and fits at 320px.
- Price/format/form state remains atomic and accessible.
- Form remains six visible controls plus hidden toggle-owned format.
- Impact/outcome sections remain compact but readable.
- Logo marquee remains transparent, greyscale, continuous, semantic, and reduced-motion safe.
- Curriculum remains a distinctive disclosure, not an oversized banner.
- Testimonials remain complete/natural-height and manually controlled.
- Thank-you confirmation remains compact.
- One dynamic checkout card; ten user-controlled exclusive videos; nine capability items; four official instructors; sixteen FAQs.
- Curriculum-session pill remains content-sized and natural-height at tablet/desktop.
- No invented facts, dates, claims, endpoints, policies, people, partners, or outcomes.
- Production tracking is future work. Pixel ID is `4138749493027663`; it is not implemented.
- GitHub, Vercel, production deployment, domain setup, and production lead routing are pending.
- Framer documentation is reference material unless explicitly resumed.

## 25. DO NOT REPEAT

- Do not vertically squash the page simply to shorten it.
- Do not fix one breakpoint with a viewport-specific patch that breaks another.
- Do not restore removed hero buttons, orbit art, course detail bar, price-card Included area, duplicate form modal, or secondary pricing controls.
- Do not crop testimonials or portrait videos aggressively to force equal heights.
- Do not turn the logo marquee back into bordered cards or a static desktop grid.
- Do not stretch the curriculum-session label to the value-panel height or use absolute positioning.
- Do not make unrelated copy/component changes during a scoped correction.
- Do not replace approved logo, instructors, testimonials, videos, or posters with placeholders.
- Do not assume a form backend, GitHub remote, Vercel deployment, live Framer update, or Meta Pixel exists.
- Do not treat CTA clicks, unqualified thank-you views, checkout clicks, or validation failures as Lead.
- Do not hotlink Drive assets or expose endpoints/secrets in client analytics.
- Do not reset the accepted working tree to the checkpoint.

## 26. COMPLETED / CURRENT BASELINE

- Local landing and thank-you routes implemented.
- Responsive preview routes implemented.
- Approved concise hero/video/form/thank-you copy implemented.
- Unified format toggle and dynamic price/form/checkout behavior implemented.
- Landing Included area removed and installment copy shortened.
- Required form validation, hidden format, duplicate guard, attribution, prototype redirect, and qualified local Lead semantics implemented.
- Impact, outcomes, institutional marquee, curriculum, testimonial carousel, graduation story, dynamic checkout, session carousel, skills matrix, instructors, FAQ, and footers implemented.
- Official/approved assets stored locally with manifests and optimized derivatives.
- Local PII-filtered tracking bridge and deduplication semantics implemented.
- Accessibility semantics, visible focus, keyboard toggles/matrix, reduced-motion CSS, safe-area sticky behavior, and noindex thank-you metadata implemented.
- Rendered regression tests cover key copy, assets, form structure, missing Pixel, checkout URLs, reduced motion, and skill-pill regression.
- Full landing PNGs exist at mobile, tablet, and desktop widths.

## 27. PENDING / NEXT PHASE

Highest priority when separately authorized:

1. obtain verified Offline and Online lead destinations and implement confirmed single-route capture;
2. decide GitHub repository/asset scope, create remote, and push safely;
3. decide deployment target/adapter, then configure Vercel only if still desired;
4. implement consent-aware Meta Pixel `4138749493027663` and any approved CAPI deduplication;
5. perform production browser/device/accessibility/tracking/form/checkout/media testing;
6. configure production domain and monitoring only after deployment approval;
7. resume native Framer recreation only if explicitly desired;
8. confirm pending exact session times before displaying them anywhere.

## 28. Known issues and technical cautions

- Both durable form destinations are missing; current lead flow is prototype-only.
- Exact session times are `To be confirmed` in data and intentionally not displayed.
- Production Pixel/CAPI, consent handling, Purchase confirmation, GitHub, Vercel, deployment, and domain are absent.
- `app/globals.css` contains earlier style blocks and later accepted override blocks; broad cleanup is risky without all-breakpoint visual regression.
- `VideoPlaceholder`, `LeadModal`, and `app/chatgpt-auth.ts` are currently dormant. They are not evidence of active placeholder media, a duplicate form, or route authentication.
- Large local video assets make the repository about 413 MiB including installed/generated directories; `public/media` itself is about 84 MiB. Future hosting/repository work must verify limits and delivery strategy without replacing approved assets casually.
- Reduced-motion behavior is defined and regression-tested in source; final production emulation/device testing remains required.

## 29. Commands

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

`pnpm test` executes `pnpm run build` and then three Node rendered-HTML tests. There is no formatter script and no separate unit-test runner beyond the current Node tests.

## 30. Verification history and current handoff audit

Last fully confirmed implementation verification (16 August 2026): lint, TypeScript, production build, and all three rendered regression tests passed; landing and thank-you routes were exercised across required widths; form/toggle/tracking/sticky/media/marquee/curriculum/matrix/checkout interactions were reviewed. Detailed evidence remains in `NEXT_CHAT_HANDOFF.md` and the prior version history of this file.

Current handoff audit (23 August 2026):

- repository path and Git root matched exactly;
- checkpoint hash/subject were verified;
- branch `main` and absence of remotes were verified;
- source, content, tracking, stylesheet, configuration, tests, handoffs, media inventory, and actual public-media tree were inspected;
- no `.env*`, Vercel state/config, production lead endpoint, Pixel initialization, or Pixel ID was found in application source;
- asset inventory counted 77 files under `public/media` and all runtime groups matched `app/content.ts`/the manifest;
- `pnpm lint` passed with no findings;
- `pnpm exec tsc --noEmit` passed;
- `pnpm build` completed all five vinext/Vite stages successfully and emitted `/`, all three preview routes, and `/thank-you`;
- all three tests in `tests/rendered-html.test.mjs` passed against the freshly built output;
- the freshly built landing and thank-you routes loaded in the in-app browser with zero broken images observed;
- direct CSS viewport checks covered 320, 375, 390, 1024, 1280, and 1440px; tablet behavior was bracketed at 767/769px and the exact 768px live review frame was visually inspected;
- no page-level horizontal overflow was observed at the checked widths. The 320px installment text remained one `nowrap` line with equal client/scroll width;
- repeated landing format selection kept the selected tab, `diploma` hidden value, price panel, and submit label synchronized for Offline and Online;
- local console evidence showed `ViewContent`, `PricingView`, pointer `FormatSelect`, header/sticky `CTAOpenForm`, and `FormStart` with the expected PII-free parameters and selected variant;
- the sticky advisor button was visible at full scroll depth and returned focus to `primary_interest_form-fullName`;
- the skills source badge measured about 192×34px at mobile, tablet-adjacent, and desktop widths with `display:flex`, `white-space:nowrap`, and `10px 16px` padding;
- current local full-page PNGs are `landing-mobile-390.png`, `landing-tablet-768.png`, and `landing-desktop-1440.png` under `artifacts/full-page-pngs/`;
- reduced-motion CSS and event-deduplication contracts passed source/regression assertions; the in-app browser did not provide reduced-motion emulation, so that presentation still needs final production-device verification;
- a new verification rerun must be recorded here before claiming a new current pass if source changes after this handoff.

## 31. Authentication rule for future external work

For GitHub, Vercel, Meta, Framer, or another external account, Codex should perform all technical work it can. Ask the user only when a genuine human login/OAuth/account-selection/permission step is required. State the service, exact action, reason, and when control can return. Never ask for passwords or secret credentials in chat.

## 32. Instructions for the next Codex session

1. Open this exact local project.
2. Paste `NEXT_CODEX_PROMPT.md` into a fresh Codex chat.
3. Read the ordered handoff files and inspect actual source/Git state.
4. Compare documentation to implementation; source wins if a contradiction remains.
5. Do not make speculative changes or rebuild from scratch.
6. Treat the current working tree as baseline and wait for the user’s next implementation instruction.
