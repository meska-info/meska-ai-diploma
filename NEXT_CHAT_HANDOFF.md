# Meska AI Diploma Journey — Next Chat Handoff

Standalone continuation source of truth · 15 August 2026

This file describes the accepted coded prototype at the cross-chat checkpoint. The layout amendments and the later corrective visual-quality pass are already implemented. A new chat must inspect and continue from the current files; it must not recreate, recompress, redesign, or revert the website unless the user gives a new instruction.

## A. Project identity

| Item | Current value |
|---|---|
| Project | Meska AI Diploma Journey / AI Co-Pilot Diploma approval prototype |
| Absolute working directory | `/Users/ahmedzaki/Documents/Codex/2026-08-14/create-a-high-conversion-journey-of-2` |
| Git repository root | `/Users/ahmedzaki/Documents/Codex/2026-08-14/create-a-high-conversion-journey-of-2` |
| Branch | `main` |
| Cross-chat checkpoint | `HEAD`, with subject `Checkpoint final layout amendments and cross-chat handoff` |
| Parent inspected before the checkpoint | `6e175fc97030e8b7c9f87ce46fe7a77b31f06346` (`Checkpoint Meska diploma prototype handoff`) |
| Runtime requirement | Node.js `>=22.13.0`; handoff runtime was Node.js `v24.19.0` |
| Package manager | pnpm, `pnpm-lock.yaml` lockfile version 9; handoff runtime was pnpm `11.19.0` |
| Stack | Next.js App Router 16.2.6, React/React DOM 19.2.6, TypeScript 5.9.3, vinext 0.0.50, Vite 8.0.13, Cloudflare Vite plugin/Worker, CSS, Tailwind PostCSS tooling |
| Hosting declaration | `.openai/hosting.json`; no D1 or R2 binding; publication is not approved |

The checkpoint hash cannot be self-recorded inside the commit that generates it. The new chat must resolve it from the repository with `git rev-parse HEAD` and verify the exact subject with `git log -1 --format='%H %s'`.

Important directories and files:

- `app/`: App Router routes, content, components, tracking, and global CSS.
- `app/components/LandingPage.tsx`: landing composition and sticky/modal state.
- `app/components/ThankYouPage.tsx`: thank-you composition.
- `app/components/sections.tsx`: reusable sections, form, disclosures, carousels, modal, checkout, footer, and lead tracker.
- `app/content.ts`: authoritative editable copy, course/pricing facts, media records, alt text, arrays, and stable tracking names.
- `app/globals.css`: authoritative design tokens, component styles, breakpoints, focus states, and reduced-motion rules.
- `app/lib/tracking.ts`: local-only tracking bridge, once-key handling, safe parameter filtering, event IDs, and attribution capture.
- `app/page.tsx`, `app/thank-you/page.tsx`: landing and thank-you route entries/metadata.
- `app/preview/{mobile,tablet,desktop}/page.tsx`: review routes at 390, 768, and 1440px.
- `tests/rendered-html.test.mjs`: two SSR route tests and landing-regression assertions.
- `public/media/`: approved local landing video, poster, testimonial originals/presentation copies, and logo originals/presentation copies.
- `MEDIA_PLACEMENT_PLAN.md`: approved media-placement decisions.
- `MEDIA_ASSET_MANIFEST.md`: authoritative asset provenance/specifications/upload status.
- `PROJECT_HANDOFF.md`: detailed coded-prototype state and validation history.
- `FRAMER_HANDOFF.md`: native-Framer recreation and production tracking specification.
- `README.md`: concise setup and project map.
- `AGENTS.md`: permanent repository rules.
- `outputs/`: ignored local launcher/screenshots/historical export; it is not authoritative and is not committed.

Commands:

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm build
pnpm test
pnpm lint
pnpm exec tsc --noEmit
```

`pnpm test` runs a production build and then the two SSR tests. Do not upgrade dependencies; restore only from the existing lockfile.

Local URLs while `pnpm dev` is running:

- Landing: `http://localhost:3000/`
- Thank-you: `http://localhost:3000/thank-you`
- Mobile review: `http://localhost:3000/preview/mobile`
- Tablet review: `http://localhost:3000/preview/tablet`
- Desktop review: `http://localhost:3000/preview/desktop`

## B. Final project objective

The project is an English, mobile-first approval prototype for Meska AI's AI Co-Pilot Diploma. Its single landing conversion goal is **Start Application**. A visitor reviews the diploma, selects offline or online, completes the required interest form, and reaches the thank-you page. Payment begins later from the thank-you page through the appropriate Shopify checkout.

The current layout amendments and the corrective visual-quality pass have already been implemented. The current source is the accepted working baseline. Future chats must not repeat or undo completed work and should continue only from new user instructions.

The local prototype simulates submission but does not persist leads. Production must redirect only after durable form capture. `Lead` means confirmed capture plus a qualified thank-you success state; a valid Shopify click is `InitiateCheckout`; confirmed payment is `Purchase`.

## C. Complete decision history

### Decisions currently in effect

- Preserve one landing conversion goal: **Start Application**.
- Keep one primary seven-field form plus the intentionally separate sticky-CTA modal form. Do not create hidden breakpoint duplicates.
- Required fields are `fullName`, `email`, `mobile`, `diploma`, `job`, `company`, and `website`.
- Mobile order is header → hero copy → complete 16:9 video → pricing → primary form.
- At 768px the conversion cluster intentionally remains stacked. From the implemented 960px breakpoint (validated at 1024px), video/pricing and the same form use a top-aligned 46%/54% row.
- Prioritize compact but comfortable spacing, readable 16px body copy, usable 44px+ targets, 50px controls, normal document flow, and uncropped meaningful media.
- The 2.5–3 viewport mobile-height limit was withdrawn. Final height is a measurement, not a cap.
- The diploma video is local, user-initiated, contained at 16:9, and has native controls, `playsInline`, `preload="metadata"`, no autoplay, no caption/transcript request, no click destination, and no playback tracking.
- The testimonial carousel contains nine supplied graduate screenshots in approved order. It shows one/two/three cards on mobile/tablet/desktop, retains natural image height, has visible controls and manual swipe/scroll, visible name/caption, no crop, no expansion, no click destination, and no tracking.
- The organization section uses 16 deduplicated local logos. The approved relationship wording is that professionals from these organizations have joined Meska's AI learning experiences. Do not call them partners, clients, sponsors, certifications, or corporate-training customers.
- Logo behavior is manual four-page 2×2 swipe below 700px, two 2×2 pages visible from 700–1199px, and a static 8×2 grid from 1200px. There is no autoplay, infinite-loop duplication, link, hover-to-original-color behavior, or tracking.
- Outcomes and the nine-session curriculum use native keyboard-accessible disclosures; both are collapsed initially. The graduation project has a restrained blue tint, border, and badge.
- The sticky mobile CTA appears only after the full hero/conversion section leaves view and hides as the footer enters view.
- FAQ remains on the thank-you page.
- Essential landing media is local in Codex and must be uploaded to Framer for production; external URLs are provenance only.
- The actual Framer project remains untouched. Do not publish or deploy.

### Elements intentionally removed

- Hero `Start Application` button row and `Explore Curriculum` link.
- Decorative orbit/AI hero artwork and its wrapper/request.
- Duplicate course-details bar.
- Mid-page promotional CTA blocks and their tracking bindings.
- Duplicate final application section/form.
- Empty `Schedule / To be confirmed` fact tile from landing and thank-you pricing displays. The central `diplomas.*.time` values remain pending content for possible future approval; they are not rendered.
- Tall outcome cards, always-expanded curriculum, placeholder client-logo wall, and testimonial placeholders.

### Elements intentionally retained

- Pill header and header Start Application anchor.
- Hero eyebrow, headline, accent statement, and subtitle.
- Main video, dynamic pricing card, primary form submit, sticky CTA/modal, impact metrics, outcomes, logos, curriculum, testimonials, footer.
- Offline/online price/date/format/location facts and diploma-switch behavior.
- Immediate local prototype redirect after valid form data; production must wait for confirmed persistence.
- Thank-you participant-video placeholder, checkout comparison, snippet placeholders, instructor placeholders, FAQ, and footer.
- Centralized content, design tokens, and tracking behavior.

### Rejected or superseded ideas

- The earlier non-negotiable 390px target of 2.5–3 viewport heights was superseded after it produced a crowded 2,109px / 2.499 layout. Do not restore that compression target.
- The earlier demand to force video/form into the first mobile viewport was relaxed. The accepted first fold contains the header, complete hero copy, and complete video, with pricing immediately after; the form remains early but is not forced into the first fold.
- An earlier 768px same-row request was superseded by the approved corrective pass. The accepted 768px layout is stacked because it protects video and form usability.
- Automatically sliding/dynamic logos were superseded by manual scroll-snap paging below desktop and a static desktop grid.
- Testimonial expansion/lightbox was considered in corrective guidance but is not approved. Full screenshots are already visible without crop, and clicking does nothing.
- The 720p video transcode was rejected because it was larger than the supplied 1080p file.
- Duplicate Orascom Construction sources and the blocked Orange source were superseded by the selected local Orascom asset and approved Orange SVG.

### Final philosophies

- Mobile height: eliminate waste, not readability. Report height, but do not force a fixed number of scrolls.
- Spacing/density: use the 4–64px token scale, 16px mobile gutters, comfortable card padding, and no negative-margin or hidden-overflow compression tricks.
- Responsive: mobile-first and breakpoint-specific; 768px is not a shrunken desktop, and desktop is not a stretched mobile page.
- Tracking: preserve names, parameters, qualification, and deduplication. Never fire a conversion from an ordinary CTA click or validation failure, never send PII, and never install/fires a production Pixel locally.
- Framer: recreate the accepted source with native Stacks, Grids, Forms, Components, Variants, Overlays, Video, CMS, and Breakpoints. Use code only for the limited behaviors documented below. Upload essential assets into Framer; do not hotlink them.

## D. Final page structure

### Landing `/`

| Order | Component / source | Purpose and content | Current layout / behavior | Tracking / destination / assets |
|---:|---|---|---|---|
| 1 | `SiteHeader` in `app/components/sections.tsx` | Meska mark and primary navigation CTA | 56px mobile pill, 64px from 700px; compact 320px safeguard | `CTAOpenForm`, `header_start_application`, `cta_location: header`; destination `#apply`; CSS-built mark |
| 2 | hero copy in `LandingPage` | Eyebrow, H1, accent, subtitle from `siteContent.hero` | Copy above the conversion cluster at every width | No direct tracking or CTA |
| 3 | `LeadCapture` with `DiplomaVideo` | Main proof media, selected-diploma price facts, and the primary form | Mobile/768: video → price → form; 960px+: video+price left and same form right | Video has no tracking; pricing exposure emits `PricingView`; form events below; video/poster from `public/media` |
| 4 | `StatsStrip` | 2,000+ graduates, 100+ corporate teams, 7+ countries | 2×2 blue metric grid on mobile; four cells in one row from 700px | No interaction/tracking |
| 5 | `OutcomesSection` | Four approved work outcomes from `siteContent.outcomes` | One-column disclosures mobile, two columns from 700px, four from 1200px | Native `<details>`; no tracking |
| 6 | `OrganizationLogoRail` | Professional-affiliation proof and 16 approved logo records | Four 2×2 pages mobile; two pages visible tablet/laptop; static 8×2 at 1200px | Manual scroll only; no links/tracking; local monochrome logos |
| 7 | `SyllabusSection` | Nine approved sessions | One collapsed `<details>` container; responsive session rows when open | No tracking; session 09 has graduation treatment |
| 8 | `TestimonialCarousel` | Nine graduate social-proof screenshots | Manual horizontal scroll-snap; one/two/three visible cards | No clicks/expansion/tracking; local WebPs and visible captions |
| 9 | `SiteFooter` | Brand, prototype label, Back to top | Vertical mobile; horizontal from 700px | Back to `#top`; no tracking |
| Overlay | `StickyMobileCTA` + `LeadModal` | Reopen application after primary cluster | Mobile-only sticky pill; intersection-controlled; full-screen modal under 700px | CTA emits one deliberate `CTAOpenForm`; modal has its own tracked form |

### Thank-you `/thank-you`

| Order | Component / source | Purpose and behavior | Tracking / destination / assets |
|---:|---|---|---|
| 1 | `ThankYouLeadTracker` | Qualifies a pending prototype submission, consumes the token, records the view | `Lead` only with pending token; `LeadThankYouView` once per session |
| 2 | `SiteHeader` | Choose Diploma navigation | `PricingView`, `header_choose_diploma`; destination `#checkout` |
| 3 | participant-story hero + `VideoPlaceholder` | Reserved approved participant story/video | Placeholder click emits `MediaPlaceholderClick`; final media pending |
| 4 | `CheckoutSection` | Offline/online comparison and inclusions | Empty URLs currently emit `CheckoutLinkPending`; non-empty final URL would emit `InitiateCheckout` and navigate |
| 5 | `SnippetsCarousel` | Three portrait session placeholders | Manual up/down cycling; placeholder diagnostic tracking only |
| 6 | `InstructorSection` | Four approved bios with initials placeholders | No conversion tracking; portraits pending |
| 7 | `FAQSection` | Six questions; first open | Native disclosure; no tracking |
| 8 | `SiteFooter` | Footer | No conversion tracking |

## E. Final responsive behavior

Implementation breakpoints are base, `min-width: 700px`, `min-width: 960px`, `min-width: 1200px`, and a `max-width: 359px` header safeguard.

| Viewport | Actual behavior |
|---:|---|
| 320px | Base mobile plus the 359px header safeguard: 16px gutters; 56px header; 40–44px H1; video/pricing/one-column form stack; 2×2 impact; one-column outcomes; 2×2 logo page; collapsed curriculum; one testimonial; vertical footer; mobile sticky CTA/full-screen modal. |
| 390px | Primary base-mobile behavior; complete hero copy and 16:9 video in first fold, pricing immediately below; one-column field rows; one logo page and one testimonial visible. |
| 430px | Same base behavior with wider natural text/media flow; no fixed-width assumptions. |
| 768px | 24px gutters; 64px header; hero/video/pricing/form remain stacked; paired email/mobile and job/company rows become two columns; impact becomes four cells; outcomes two columns; two logo pages/four columns visible; testimonials two cards; horizontal footer. |
| 1024px | 32px gutters; top-aligned 46% video+price / 54% form row; three price facts in one row; two-column outcomes; two logo pages visible; two testimonials. |
| 1440px | 1280px max shell; 46/54 conversion row; four outcomes; all 16 logos in static 8×2 grid; three testimonials; capped desktop type. |
| 1920px | Same 1280px centered shell and typography caps; no stretched content. |

Additional exact behavior:

- Containers: `.shell` is `min(100% - 2 × gutter, 1280px)`.
- Section padding: 40px base, 48px from 700px, 64px from 960px.
- Hero padding: 32px/48px base, 48px/64px from 700px, 64px from 960px.
- Video: complete `16 / 9`, `object-fit: contain`, width 100%.
- Pricing: two fact columns mobile, with Location spanning both; three fact columns from 960px. The Schedule fact does not render.
- Form: one column below 700px; `.field-row` pairs become two columns from 700px; the select and website remain full-width.
- Impact: four 112px minimum cells arranged 2×2 mobile; 128px minimum and one row from 700px.
- Outcomes: one/two/four columns at base/700/1200.
- Logo cells: 2×2 pages with 88px rows mobile, 96px rows from 700px; 108px minimum cells in the 8×2 desktop grid. Artwork is contained and 48px/54px high.
- Curriculum: collapsed by default at every breakpoint; summary target 52px; rows become a four-part grid from 700px.
- Testimonials: grid-auto columns 100%, `(100% - 16px)/2`, and `(100% - 32px)/3` at base/700/1200. Images use natural height.
- Footer: vertical and padded for the sticky CTA on mobile; horizontal with 104px minimum height from 700px.
- Sticky CTA: rendered below 700px only; appears after hero intersection ends and disappears at footer intersection.
- Modal: native `<dialog>`; 100dvh full-screen under 700px and hides its repeated price panel; bounded desktop dialog otherwise.
- Reduced motion: smooth scrolling and transitions are effectively disabled when requested.

## F. Final design system

Canonical source: `app/globals.css`.

### Tokens

| Token | Value |
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
| pill radius | `999px` |
| `--shadow-sm` | `0 10px 40px rgba(0, 17, 28, 0.08)` |
| `--shadow-blue` | `0 20px 60px rgba(10, 114, 243, 0.24)` |
| `--shell` | `1280px` |
| `--space-1` … `--space-10` | `4, 8, 12, 16, 20, 24, 32, 40, 48, 64px` |
| `--section-space` | `40px` base; `48px` at 700px; `64px` at 960px |
| `--page-gutter` | `16px` base; `24px` at 700px; `32px` at 960px |
| `--font-sans` | `Inter`, then UI/system sans-serif fallbacks; no remote font request |

### Typography and component treatment

- Body: 16px/1.55, normal responsive flow.
- Letter spacing: headings `-0.045em`; landing H1 `-0.055em`; price `-0.06em`.
- Mobile landing H1: `clamp(40px, 10.5vw, 44px)`, weight 830, line-height 1.02, uppercase.
- H1 from 700px: `clamp(54px, 7vw, 72px)`; from 1200px capped at 88px.
- Mobile H2: `clamp(26px, 7vw, 30px)`, weight 760, line-height 1.15.
- H2 from 700px: `clamp(34px, 4.3vw, 44px)`; from 1200px capped at 52px.
- Hero accent: 20px/1.18 mobile; `clamp(25px, 3.2vw, 32px)` from 700px; capped around 38px desktop.
- Eyebrows: 12px/1.4, weight 700, uppercase, 0.05em tracking.
- Form heading: 30px/1.1 mobile; fluid from 960px. Labels: 13px/1.35, weight 680.
- Controls: 50px minimum height, 16px text, 12px radius, pale background, blue focus border, and 4px translucent focus ring.
- Focus: global 3px bright-blue outline with 4px offset.
- Buttons: 48px minimum, pill by default; 44px small header target; blue surface, 180ms hover lift/darken/shadow. Submit is 50px high with 13px radius.
- Cards: thin `--line` borders, small/medium/large radii according to hierarchy, restrained `--shadow-sm`; no fixed text height.
- Pricing: dark blue gradient/tint surface; 20px padding mobile, 24px from 700px; contained fact grid.
- Outcome cards: paper surface, 14px radius, 56px summary target mobile and 64px from 700px.
- Curriculum: line-based disclosure; graduation row uses pale blue, accent border, small badge.
- Main media: 16:9 `contain`, 24px radius, dark fallback, explicit dimensions.
- Logo treatment: presentation assets are theme-blue monochrome, opacity 0.9, `object-fit: contain`, equal optical cells.
- Testimonial treatment: full-width natural-height `contain` images, no overlay, caption below, 24px card radius.
- Thank-you media placeholders: 16/8.5 landscape and 9/15.5 portrait ratios; final approved assets remain pending.

## G. Content and media inventory

All editable landing/thank-you copy and media references are in `app/content.ts`. Do not invent or silently change prices, dates, statistics, claims, outcomes, policies, instructor facts, testimonials, or relationship labels.

### Implemented local landing media

- `VID-01`: `public/media/videos/original/meska-ai-diploma-main-video.mp4`, 1920×1080, 16:9, 1:55.84, 46,515,455 bytes. Poster: `public/media/images/posters/meska-ai-diploma-main-video-poster.webp`, 1200×675. Source: `https://drive.google.com/file/d/1gPZaqKDdFWgYZNg-Jjp1OAklF8kGiTDI/view?usp=drive_link`.

Testimonial records:

| ID / graduate | Supplied source filename | Local original | Local presentation |
|---|---|---|---|
| IMG-01 / Ali Elsheikh | `WhatsApp Image 2026-08-15 at 15.22.32.jpeg` | `public/media/images/original/testimonial-ali-elsheikh.jpeg` | `public/media/images/optimized/testimonial-ali-elsheikh.webp` |
| IMG-02 / Eslam Momtaz | `WhatsApp Image 2026-08-15 at 15.22.15.jpeg` | `public/media/images/original/testimonial-eslam-momtaz.jpeg` | `public/media/images/optimized/testimonial-eslam-momtaz.webp` |
| IMG-03 / Eslam Osman | `WhatsApp Image 2026-08-15 at 15.21.58.jpeg` | `public/media/images/original/testimonial-eslam-osman.jpeg` | `public/media/images/optimized/testimonial-eslam-osman.webp` |
| IMG-04 / Amr Mosallam | `WhatsApp Image 2026-08-15 at 15.21.28.jpeg` | `public/media/images/original/testimonial-amr-mosallam.jpeg` | `public/media/images/optimized/testimonial-amr-mosallam.webp` |
| IMG-05 / Ibrahim Mubarak | `WhatsApp Image 2026-08-15 at 15.20.55.jpeg` | `public/media/images/original/testimonial-ibrahim-mubarak.jpeg` | `public/media/images/optimized/testimonial-ibrahim-mubarak.webp` |
| IMG-06 / Reem Fahim | `WhatsApp Image 2026-08-15 at 15.20.20.jpeg` | `public/media/images/original/testimonial-reem-fahim.jpeg` | `public/media/images/optimized/testimonial-reem-fahim.webp` |
| IMG-07 / Ali Shaker | `WhatsApp Image 2026-08-15 at 15.17.22.jpeg` | `public/media/images/original/testimonial-ali-shaker.jpeg` | `public/media/images/optimized/testimonial-ali-shaker.webp` |
| IMG-08 / Dr. Khaled Said Salem | `WhatsApp Image 2026-08-15 at 15.17.56.jpeg` | `public/media/images/original/testimonial-khaled-said-salem.jpeg` | `public/media/images/optimized/testimonial-khaled-said-salem.webp` |
| IMG-09 / Kholoud Samy | `WhatsApp Image 2026-08-15 at 15.19.01.jpeg` | `public/media/images/original/testimonial-kholoud-samy.jpeg` | `public/media/images/optimized/testimonial-kholoud-samy.webp` |

Each testimonial's alt text is `Meska AI post celebrating AI Copilot Diploma graduate {name}`; the visible caption is `AI Copilot Diploma graduate`; crop is none.

Logo records and provenance:

| Order / organization | Original source URL or supplied file | Local original | Local monochrome presentation |
|---|---|---|---|
| 1 / SODIC | `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQXt4Rxy9Wqv5ejkXzgjczcXjYtH97-eTyVEJMjNPrawg&s=10` | `public/media/logos/original/sodic.png` | `public/media/logos/monochrome/sodic.png` |
| 2 / Banque Misr | `https://blogs.realestate.gov.eg/wp-content/uploads/2024/10/Banque-Misr.png` | `public/media/logos/original/banque-misr.png` | `public/media/logos/monochrome/banque-misr.png` |
| 3 / AXA | `https://icisa.org/wp-content/uploads/2018/12/axa.png` | `public/media/logos/original/axa.png` | `public/media/logos/monochrome/axa.png` |
| 4 / WUZZUF | `https://gemini.wuzzuf.net/lovable-uploads/78f28dbb-de4d-46f8-aff3-a83b0cee2e52.png` | `public/media/logos/original/wuzzuf.png` | `public/media/logos/monochrome/wuzzuf.png` |
| 5 / Emirates NBD | `https://www.amd.com/content/dam/amd/en/images/logos/partners/2450100-amd-emirates-nbd-logo.png` | `public/media/logos/original/emirates-nbd.png` | `public/media/logos/monochrome/emirates-nbd.png` |
| 6 / Palm Hills Developments | `https://theaddress-eg.com/uploads/logo_85281718284.png` | `public/media/logos/original/palm-hills-developments.png` | `public/media/logos/monochrome/palm-hills-developments.png` |
| 7 / Orange | `https://upload.wikimedia.org/wikipedia/commons/c/c8/Orange_logo.svg?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=original` | `public/media/logos/original/orange.svg` | `public/media/logos/monochrome/orange.svg` |
| 8 / Orascom Development | `https://invest-gate.me/wp-content/uploads/2016/08/Orascom-Devel.gif` | `public/media/logos/original/orascom-development.gif` | `public/media/logos/monochrome/orascom-development.png` |
| 9 / The American University in Cairo | `https://www.universitiesegypt.com/ImageHandler.ashx?Id=12734&SS=2f4b759a533e4ad5b1db622ff646146c` | `public/media/logos/original/american-university-cairo.png` | `public/media/logos/monochrome/american-university-cairo.png` |
| 10 / Wadi Group | `https://syecommunity.com/wp-content/uploads/2023/05/Partner-1.png` | `public/media/logos/original/wadi-group.png` | `public/media/logos/monochrome/wadi-group.png` |
| 11 / National Bank of Egypt | `https://mir-s3-cdn-cf.behance.net/projects/404/3c65d7240080589.Y3JvcCwxNDAwLDEwOTUsMCw4Ng.png` | `public/media/logos/original/national-bank-of-egypt.png` | `public/media/logos/monochrome/national-bank-of-egypt.png` |
| 12 / Hassan Allam Properties | `https://www.xurustays.com/images/home/our-partners/hassan-allam-properties.png` | `public/media/logos/original/hassan-allam-properties.png` | `public/media/logos/monochrome/hassan-allam-properties.png` |
| 13 / G Developments | `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS94jqSv7-pmkjZC04W1cU0tHVnnkqVL25AUJMqXzU1434jSSH16HSNGpE&s=10` | `public/media/logos/original/g-developments.png` | `public/media/logos/monochrome/g-developments.png` |
| 14 / saib | `https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXU1QSnDk5RGaWOUdHQ8EdE_X6zrWaAZrxZTtReueb4x9PFxomOsLUI-I&s=10` | `public/media/logos/original/saib.jpg` | `public/media/logos/monochrome/saib.png` |
| 15 / Arab Academy for Science, Technology and Maritime Transport | `https://sakscholarship.org/wp-content/uploads/2025/07/Academy.png` | `public/media/logos/original/arab-academy.png` | `public/media/logos/monochrome/arab-academy.png` |
| 16 / Orascom Construction | user-supplied `codex-clipboard-a334120c-2042-41dd-983d-b177c3025c48.png` | `public/media/logos/original/orascom-construction.png` | `public/media/logos/monochrome/orascom-construction.png` |

Excluded/superseded sources: `https://www.orascomservices.com/wp-content/uploads/Orascom_Construction-Logo.wine_.png` and the second user-supplied Orascom clipboard PNG were duplicates; `https://support.travel.orange.com/hc/theming_assets/01J213YJSH8J5F3G4Z426VY7RD` returned 403 and was replaced by the approved Orange SVG. Exact dimensions, sizes, alpha/quality notes, authorization, and Framer status remain in `MEDIA_ASSET_MANIFEST.md`. None of these source URLs is requested by the rendered page.

### Key final copy decisions

- Hero eyebrow: `AI Co-Pilot Diploma · New waves now open`.
- Hero H1: `Learn AI for business.`
- Hero accent: `Automate work. Lead smarter. Make better decisions.`
- Hero subtitle: `A hands-on diploma that helps professionals and managers use AI to automate daily work, improve decisions, and manage teams smarter.`
- Form disclosure: `This is not a payment form. Share your interest and the Meska AI team will contact you with the next steps.`
- Organization heading: `Professionals from Egypt’s Leading Corporations Learn AI with Meska`.
- Organization support: `Professionals across these organizations have joined Meska’s AI learning experiences.`
- Testimonial caption: `AI Copilot Diploma graduate`.

No essential production media is approved to remain third-party hosted. All implemented landing assets are intended for Framer upload. External source URLs are retrieval/provenance only.

### Pending media/content

- Approved Meska AI SVG mark; current logo is CSS-built.
- Thank-you participant video, poster, captions, transcript.
- Three compressed portrait session clips and posters.
- Four instructor portraits and final alt text.
- Approved 1200×630 Open Graph image.
- Final canonical/slug/social copy, form provider/Google Sheet endpoint, Shopify URLs, policy/legal/privacy copy.

Original nine testimonial attachments and the selected Orascom image are now preserved inside the repository. The user’s chat-only screenshot identifying the empty `Schedule / To be confirmed` tile is not a project asset; its removal is implemented, documented, and tested. If the visual evidence itself is needed: **Must be attached again in the new chat.** No other implementation-critical screenshot needs reattachment; the ignored `outputs/layout-validation/` images are local reference artifacts and not part of Git.

## H. Meta Pixel and conversion tracking

Canonical code: `app/lib/tracking.ts`, form/CTA/thank-you triggers in `app/components/sections.tsx`, page-view trigger in `app/components/LandingPage.tsx`. Production mapping and Framer installation rules: `FRAMER_HANDOFF.md`.

- Pixel initialization: none in the local prototype. There is no Pixel ID, `fbq`, CAPI, or third-party analytics request. Future Meta base code belongs once in the site-wide Framer `<head>` and owns `PageView`; never add a second manual `PageView`.
- Local debug: `trackEvent()` appends safe payloads to `window.__MESKA_EVENTS__` and logs `[Meska tracking · local only]` in the console.
- `ViewContent`: landing client render after attribution capture; `tracking_id: diploma_landing_view`, content name/category; session once-key.
- Header application: `CTAOpenForm` with `tracking_id: header_start_application`, `cta_location: header`; destination `#apply`; never a `Lead`.
- Sticky application: `CTAOpenForm` with `tracking_id: sticky_mobile_start_application`, `cta_location: sticky_mobile`; opens the modal; never a `Lead`.
- Pricing exposure: `PricingView` when at least 35% of the primary capture cluster enters view; `tracking_id: primary_interest_form_pricing_view`, `form_location`, `variant`; session once-key.
- Form engagement: `FormStart` once per mounted primary/modal instance on first focus; includes stable form ID, location, and selected variant.
- Validation failure: `FormError` on invalid submit with stable ID, location, `error_type: validation`, and `invalid_field_count`. The first invalid field receives focus. No success token, redirect, or conversion occurs.
- Successful local submission: validates seven required fields, creates a unique lead event ID, stores variant/wave/form location/approved attribution in `meska-pending-lead`, then redirects to `/thank-you?diploma={selection}`. It does not fire `Lead` before the redirect.
- `Lead`: thank-you client render only when `meska-pending-lead` exists; includes `tracking_id` of `primary_interest_form_submit` or `modal_interest_form_submit`, variant, wave, form location, event ID, and approved UTM subset. The event uses the unique event ID as a once-key, copies state to `meska-last-lead`, and consumes the pending token immediately.
- `LeadThankYouView`: thank-you client render, once per session, with `tracking_id: lead_thank_you_view` and `has_submission_state`.
- Direct visit protection: no pending token means no `Lead`; the diagnostic thank-you view records false.
- Refresh protection: the pending token is consumed and the event ID/session once-key prevents another `Lead`; the thank-you view also has a session once-key.
- Responsive protection: there is one primary form for all breakpoints and no hidden tracked breakpoint duplicate. The separate modal form is intentional and only mounts in the shared dialog.
- Checkout: a non-empty final Shopify URL would emit `InitiateCheckout` with stable ID, variant, numeric value, `EGP`, and unique event ID immediately before navigation. Current empty URLs emit local `CheckoutLinkPending` and no conversion.
- Placeholder media: only pending thank-you placeholders emit `MediaPlaceholderClick`. The implemented landing video has no playback event.
- Registration/WhatsApp: no approved links or events exist. `CompleteRegistration` is future-only if Meska defines a distinct milestone. There is no WhatsApp path.
- `Purchase`: not implemented locally; it must originate from verified Shopify payment/order confirmation with a stable order-based event ID.
- Attribution: captures `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, and `fbclid` into one namespaced session object and carries them through the prototype redirect.
- Privacy: event calls contain no form-field values. The bridge filters common PII keys, and future work must not add full name, email, phone/mobile, job, company, website, free text, or unrestricted personal data.
- Removed event sources: `hero_start_application`, `midpage_start_application`, `final_interest_form`, and `final_interest_form_submit`. Do not rebind or restore them.

Verified locally in the completed browser pass: one meaningful landing view per fresh session; header/sticky CTA intent without Lead; invalid form produced `FormStart`/`FormError` and no Lead; valid form produced one qualified Lead and one thank-you view; reload produced no duplicates; direct thank-you visit produced no Lead; pending checkout produced no `InitiateCheckout`; disclosure/carousel/media layout interactions produced no conversion events. Production Pixel Helper/Events Manager, live form persistence, Shopify checkout, Purchase, and future CAPI remain unverified because those integrations do not exist.

## I. Framer handoff state

- No external Framer project is connected in this repository/session.
- The actual Framer project has not been modified, published, or deployed.
- The complete responsive implementation, local media, form simulation, debug tracking, and review routes exist only in the coded prototype.
- Recreate with native Framer Stacks and Grids using 16/24/32px gutters, 700/960/1200 breakpoints, a 1280px maximum shell, one semantic primary form, native video, native disclosure/accordion patterns, reusable logo/testimonial components or CMS, an Overlay for the modal, and breakpoint variants.
- Upload VID-01, its poster, nine testimonial WebPs, and 16 monochrome logos directly into Framer. Replace every local or source URL with a Framer-hosted asset URL before production. Verify no essential production media hotlinks remain.
- Preserve the central event bridge, stable names, pending-success qualification, attribution, deduplication, and one site-wide Pixel base installation. Do not place a Pixel ID in code or documentation.
- Likely code component/override needs: diploma select ↔ pricing variant synchronization; form-attribution propagation if unsupported natively; durable-capture success token and deduplicated Lead; intersection-controlled sticky CTA; centralized Meta bridge/event IDs; optional snippet carousel if native effects are insufficient.
- Native Framer should cover normal page flow, header/hero, pricing, form visuals, metrics, outcomes, logo grid, curriculum, testimonials, checkout cards, instructor cards, FAQ, video, overlay, and responsive layout.
- Remaining Framer work: connect a confirmed form destination; add final checkout URLs; upload remaining and implemented assets; install/test production tracking only after approval; approve SEO/legal/policies; recreate and validate all breakpoints; obtain explicit approval before publication.

## J. Validation status

Latest completed browser validation (15 August 2026):

| Viewport | Viewport height | Landing height, collapsed | Ratio | Result |
|---:|---:|---:|---:|---|
| 320px | 568px | 4,767px | 8.393 | No overflow; readable one-column form/H1 |
| 360px | 800px | 4,737px | 5.921 | No overflow; full 16:9 video |
| 390px | 844px | 4,745px | 5.622 | Primary corrected mobile pass |
| 430px | 932px | 4,857px | 5.211 | No overflow; natural media scaling |
| 768px | 1,024px | 4,390px | 4.287 | Intentional stacked tablet conversion |
| 1024px | 768px | 4,018px | 5.232 | Top-aligned 46/54 conversion row |
| 1440px | 900px | 4,075px | 4.528 | Controlled 1280px shell |
| 1920px | 1,080px | 4,127px | 3.821 | Max-width/type caps prevent stretching |

At 390px with all nine curriculum rows expanded: 5,928px / 7.024 viewport heights. At 390px the measured major sections were header 56px; hero/conversion 1,929px; impact 272px; outcomes 502px; logos 476px; curriculum 254px collapsed; testimonials 994px; footer 253px.

Status inventory:

- Development server: previously started and visually validated. It is a local process, not a deployment; it must be running for localhost to respond.
- Production build: passed in the completed implementation pass and again during this handoff (`pnpm test`).
- Tests: both SSR tests passed in the completed implementation pass and again during this handoff.
- Lint/type check: `pnpm lint` and `pnpm exec tsc --noEmit` passed again during this handoff.
- Browser console: no runtime errors at validated widths.
- Mobile/tablet/desktop: inspected at all table widths; no horizontal overflow or sticky coverage.
- Media: video 16:9 with controls; 16 local logos contained; nine local testimonials preserved at exact source ratios; no essential landing hotlinks.
- Form: all seven required fields; invalid focus/errors and successful prototype redirect verified.
- Navigation/modal/disclosures/carousels: header anchors, sticky modal, outcome/curriculum details, testimonial controls, and internal review navigation exercised.
- Thank-you: direct visit and qualified redirect tested; both checkout cards render; current empty checkout destinations remain visibly pending.
- Meta: only local debug bridge verified. No production Pixel/Events Manager/CAPI test was possible or appropriate.
- Screenshots: ignored local references under `outputs/layout-validation/`; they are not the website and not committed.

Do not claim fresh browser validation after this checkpoint unless a new chat actually runs it. Documentation-only changes in the handoff do not alter the rendered site.

## K. Remaining work

No further coded layout-amendment work remains. The project is safely positioned for new user instructions after the checkpoint.

| Remaining item | Status and files | Dependency/blocker | Acceptance criteria |
|---|---|---|---|
| Durable lead capture | Pending; `LeadCapture`, `ThankYouLeadTracker`, `FRAMER_HANDOFF.md` | Approved Framer form/webhook/Google Sheet destination | Capture confirms success before token/redirect; failed capture never produces Lead |
| Shopify destinations | Empty in `app/content.ts` | Final approved offline/online URLs | Each valid click reaches correct checkout and emits one `InitiateCheckout`; empty state emits none |
| Production Meta | Not installed | Explicit approval, production Pixel, final domain/integrations | One base Pixel/PageView; verified events/parameters/deduplication; no PII |
| Confirmed Purchase/CAPI | Not implemented | Verified Shopify order pipeline and optional server integration | Purchase only on confirmed payment; shared stable event IDs for browser/server dedupe |
| Missing approved media | Thank-you video/snippets, instructor portraits, Meska SVG, OG image pending | User-provided/approved assets | Correct local/Framer assets, alt/captions/posters, no hotlinks or crop |
| Framer recreation | Not begun | Connected Framer project and explicit edit approval | Native implementation matches this source at all breakpoints; integrations/media/tracking verified |
| Content/legal/SEO | Some FAQ answers, policies, canonical/slug/OG/privacy copy pending | Approved Meska copy and production owner review | No pending placeholders; claims/prices/dates/instructors re-approved before launch |
| Publication | Not authorized | Explicit user approval after final QA | Production checklist passes; no essential external media dependency |

## L. Rules for the next chat

1. Read `NEXT_CHAT_HANDOFF.md`, `AGENTS.md`, `PROJECT_HANDOFF.md`, `FRAMER_HANDOFF.md`, `README.md`, `MEDIA_PLACEMENT_PLAN.md`, and `MEDIA_ASSET_MANIFEST.md` completely before editing.
2. Inspect the actual source before relying on documentation; source and the most recent user instruction win over stale text.
3. Verify the Git checkpoint with `git log -1 --format='%H %s'` and inspect `git status --short`.
4. Do not repeat completed amendments.
5. Do not restore intentionally removed elements, including the empty Schedule tile.
6. Preserve Meta Pixel/conversion qualification, names, parameters, and duplicate prevention; do not add production tracking locally.
7. Validate every new change on mobile, tablet, and desktop, including interactions, overflow, accessibility, and events.
8. Keep `PROJECT_HANDOFF.md`, `FRAMER_HANDOFF.md`, and relevant tracking documentation synchronized.
9. Do not publish, deploy, or modify an external Framer project without explicit approval.
10. Ask one consolidated set of questions if new instructions are genuinely ambiguous.
