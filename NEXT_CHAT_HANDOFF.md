# Meska AI Co-Pilot Diploma — Next Chat Handoff

Standalone continuation source of truth · 16 August 2026

23 August 2026 packaging note: use `AGENTS.md`, `CURRENT_STATE.md`, `PROJECT_HANDOFF.md`, `PROJECT_STATE.json`, `CHANGELOG_PROJECT.md`, and `NEXT_CODEX_PROMPT.md` as the current fresh-chat package. This earlier detailed handoff remains valid supporting history. Meta Pixel is still absent; ID `4138749493027663` is a future explicitly approved requirement only. GitHub, Vercel, both production lead destinations, deployment, and live Framer publication remain pending.

## Start here

Work only in:

`/Users/ahmedzaki/Documents/Codex/2026-08-14/create-a-high-conversion-journey-of-2`

This path is both the working directory and Git repository root. Before changing anything, read this file, `PROJECT_HANDOFF.md`, `FRAMER_HANDOFF.md`, `AGENTS.md`, `MEDIA_ASSET_MANIFEST.md`, and `MEDIA_PLACEMENT_PLAN.md`, then inspect the actual source.

The accepted pre-amendment checkpoint is:

`77cf2e01faa8716ccd83ad066702bbc3c1b6c5ef` — `Checkpoint final layout amendments and cross-chat handoff`

The August 2026 conversion amendments described here are the current accepted working-tree state. They are intentionally uncommitted unless the user requests a commit. Do not revert them to match the checkpoint.

## Objective and guardrails

This is a local English approval prototype for Meska AI’s AI Co-Pilot Diploma. The landing page has one conversion goal: submit the interest form through its synchronized `Request Offline Diploma Details` or `Request Online Diploma Details` action. A CTA click is not a conversion. `Lead` requires a valid form submission and qualified thank-you token; `InitiateCheckout` requires a matching checkout click; `Purchase` belongs to confirmed Shopify payment.

Never:

- invent dates, prices, statistics, partners, testimonials, biographies, policies or outcomes;
- install/fire a production Meta Pixel locally, hard-code a Pixel ID or send PII;
- add a landing WhatsApp CTA, eligibility section, checkout gate or payment-before-eligibility flow;
- hotlink essential production media;
- publish, deploy or edit the live Framer project without explicit approval.

The verified WhatsApp support statement is approved only inside the thank-you FAQ.

## Current accepted experience

### Landing `/`

1. Official Meska 2026 logo on the off-white/white pill header.
2. Concise hero: “Meska AI Copilot Diploma” / “Learn AI. Apply it to real business.” / the approved collaborator subheadline.
3. Main conversion cluster:
   - one-line “Why We Built the Diploma” heading and local 16:9 overview video;
   - one compact accessible Offline/Online price card with atomic price/date/delivery/location mapping and one-line `5 interest-free payments via Sympl.` copy. The entire landing Included area is absent and no empty space or replacement control remains;
   - one required form with six visible controls plus a toggle-controlled hidden `diploma` value, dynamic format-specific submit label and no-payment reassurance.
4. Three impact statistics.
5. Four independent “Work differently after the diploma” disclosures.
6. Seamless transparent greyscale 16-logo marquee on mobile, tablet and desktop; the visual duplicate is `aria-hidden`, motion pauses on hover/focus, and reduced motion uses one static scrollable sequence.
7. Distinctive blue-bordered, blue-tinted nine-session curriculum control with orange state accent and closed/open labels.
8. Nine approved testimonial cards.
9. Footer.
10. All-breakpoint sticky “Speak with a Meska Advisor” CTA from the post-hero trigger through 100% scroll depth; it smoothly returns to and focuses the primary form, with safe-area and footer clearance.

### Thank-you `/thank-you`

1. Lead/thank-you trackers.
2. Official Meska logo and Choose Diploma anchor.
3. Compact “Application received” confirmation: “Thank you — we’ve got your details.” / “A Meska advisor will contact you soon.”
4. Portrait graduation video and emotional previous-wave copy.
5. One accessible Offline/Online tablist and one unified dynamic checkout card.
6. Nine portrait session videos in the supplied order, one/two/three cards by breakpoint.
7. Nine-item interactive skills-to-business-value matrix grounded in curriculum sessions 01–09, with pointer/keyboard controls and no-JavaScript fallback.
8. Official portraits and safe LinkedIn links for Nabil Khalifa, Dr. Amr Fahmy, Youssef Al Refaey and Omar El Monayar.
9. Sixteen FAQs containing all newly approved factual answers and the retained verified topics.
10. Footer.

All ten thank-you videos are local optimized `720×1280` MP4s with `720×1280` WebP posters. They are user-controlled, never autoplay and are globally exclusive: starting one pauses every other video. Scrolling a session clip out of the active carousel position pauses it.

## Program facts and checkout routing

| Format | Wave | Start | Delivery | Location | Price |
| --- | --- | --- | --- | --- | --- |
| Offline | 14 | 22 August 2026 | 8 offline + 3 online live sessions | Creativa Innovation Hub, Giza | EGP 25,000 |
| Online | 10 | 23 August 2026 | 8 live + 3 online recap sessions | Virtual live sessions | EGP 20,000 |

Both formats list 11 sessions plus a graduation project. The displayed installment wording is `5 interest-free payments via Sympl.` Exact session times remain pending.

The complete approved checkout URLs live in `app/content.ts`. Do not shorten, reconstruct or overwrite their existing query parameters. Attribution may be appended only when the key is not already present.

Default checkout selection is Offline unless the `diploma=online` query is present. Pointer and Arrow/Home/End keyboard input update the tab, all card content, CTA label and destination atomically.

The landing format toggle is the single source of truth for price content, the hidden `diploma` value (`offline`/`online`), form CTA label and tracking variant. `Request Offline Diploma Details` and `Request Online Diploma Details` update immediately. No verified Offline or Online Google Sheets Apps Script/webhook destination exists anywhere in the repository or Git history, so both `leadDestination` values remain `null`/`pending` and the local prototype makes no external lead request.

## Source ownership

- `app/content.ts` — all editable program copy/facts, complete checkout URLs, media records and tracking names
- `app/components/LandingPage.tsx` — landing composition and hero/footer sticky observers
- `app/components/ThankYouPage.tsx` — thank-you composition
- `app/components/sections.tsx` — header/logo, shared format tabs, form, pricing, disclosures, carousels, checkout, skills matrix, instructors, FAQ, video coordination and trackers
- `app/lib/tracking.ts` — local tracking bridge, event IDs, once keys, attribution and PII filtering
- `app/globals.css` — canonical tokens, responsive design, focus and reduced-motion rules
- `public/media/` — local rendered assets
- `tests/rendered-html.test.mjs` — route/regression assertions

Do not scatter editable course facts into components or tracking IDs into CSS/visual indexes.

## Design tokens

- primary blue `#021F94`
- off-white `#F5F2F3`
- deep navy `#151130`
- slate `#1E223D`
- accent orange `#F54F1B`
- radii `10 / 18 / 26px`
- content max `1280px`
- gutters `16 / 24 / 32px`

The implementation is mobile-first. Breakpoints are 700, 960 and 1200px; exact required QA widths are 320, 375, 390, 768, 1024, 1280 and 1440px.

## Tracking contract

Local events currently implemented:

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

Stable IDs include `sticky_start_application`, `landing_format_toggle`, `checkout_format_toggle`, `skills_business_value_matrix`, `thank_you_graduation_video`, `inside_diploma_video_01` through `_09`, `offline_shopify_checkout`, and `online_shopify_checkout`.

Do not fire `Lead` from a CTA, initial thank-you view without pending state, validation error or checkout click. Do not emit field values. The local bridge filters common PII-shaped parameter names and records evidence in `window.__MESKA_EVENTS__` and console logs.

## Validation evidence

On 16 August 2026 the amended implementation was exercised in the in-app browser across the required mobile/tablet/desktop widths on both routes:

- direct 320, 375, 390, 1024, 1280 and 1440 tests had no page overflow; the exact 768px live review frame was inspected and adjacent 767/769 direct tests remained contained;
- the scoped correction removed every landing Included layer while retaining the thank-you checkout’s eight inclusions. The landing card now ends after its details at approximately 390–408px on mobile and 353–371px at 1024–1440px, with only normal bottom padding;
- `5 interest-free payments via Sympl.` stayed on one contained line at every required width. The curriculum-session label measured approximately 192×34px with natural panel height at exact 768px and direct 1024/1280/1440px checks, and remained compact on mobile;
- no video exceeded the viewport; landing contained one video and 32 visual logo cells representing 16 semantic logos plus one hidden duplicate sequence;
- thank-you contained ten videos, one unified checkout card, nine skills controls, four instructor cards and sixteen FAQs;
- sticky CTA appeared after the hero, remained visible through 100% scroll, did not cover footer children and returned focus visibly to full name;
- landing price, hidden format, format-specific submit CTA, query and tracking variant stayed atomic by pointer and keyboard;
- pointer and keyboard format changes emitted `FormatSelect` with `selection_source`; form start/submit and qualified Lead events included the selected format;
- both exact checkout destinations navigated to their corresponding live Shopify checkout and emitted matching `InitiateCheckout` values/currency;
- the six visible fields plus hidden format produced six correct inline errors when empty; separate Offline and Online prototype submissions preserved UTMs and emitted one PII-free qualified `Lead` each without any external lead request;
- graduation/session plays emitted `VideoPlay`; switching videos paused the previous media; carousel navigation paused inactive media;
- FAQ/outcome disclosures were independent; curriculum exposed nine sessions with distinctive closed/open states;
- skills matrix pointer/keyboard interactions updated the value panel and emitted stable `CapabilitySelect` events;
- marquee sequence widths matched, animation ran at mobile/desktop, CSS greyscale/object-fit containment applied consistently and motion paused on keyboard focus.

Reduced-motion fallback is defined in CSS: animation is removed, the `aria-hidden` duplicate sequence is removed from layout, and the remaining sequence becomes manually scrollable. Re-test this in the final Framer environment because the in-app browser does not expose a reduced-motion emulation control.

## Commands

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

`pnpm test` builds first and then runs the rendered HTML assertions. Do not upgrade dependencies without a separate instruction.

## Remaining production work

1. Recreate the approved source natively in Framer following `FRAMER_HANDOFF.md`.
2. Upload every essential asset to Framer and replace local paths.
3. Obtain and connect separate verified Offline and Online lead destinations; route one selected format to one destination and redirect only after confirmed durable capture.
4. Add production Pixel/CAPI only after IDs, consent requirements and deduplication are approved.
5. Re-run every required viewport, focus, reduced-motion, media, checkout and tracking test in Framer.
6. Publish only with explicit approval.
