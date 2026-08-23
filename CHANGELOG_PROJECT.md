# Meska AI Diploma — project evolution

This is a product/design changelog, not a commit-by-commit history. It explains how the current accepted local baseline was reached and which earlier approaches must not return accidentally.

## Local checkpoint history

### `6e175fc` — initial prototype handoff

- Established the local Meska AI Diploma prototype and first cross-chat handoff.
- Created the landing/thank-you journey, responsive source structure, content model, and local verification foundation.

### `77cf2e01faa8716ccd83ad066702bbc3c1b6c5ef` — final layout amendments checkpoint

- Subject: `Checkpoint final layout amendments and cross-chat handoff`.
- Current `HEAD` on `main`.
- This is the accepted pre-August-amendment checkpoint. The active accepted state is the later uncommitted working tree; do not restore the checkpoint over it.

## August 2026 accepted working-tree evolution

### Landing hero and conversion focus

- Shortened the hero to `Meska AI Copilot Diploma`, `Learn AI. Apply it to real business.`, and the approved collaborator/business-challenge subtitle.
- Removed the old hero CTA pair and retained a single conversion path through the current header anchor, primary form, and sticky advisor CTA.
- Kept the previously removed orbit artwork and course-detail bar out of the page.
- Simplified the video introduction to one compact `Why We Built the Diploma` heading.

### One synchronized format state

- Replaced separate/duplicated format experiences with one accessible Offline/Online segmented toggle.
- Made the toggle the source of truth for price, wave, date, delivery, location, hidden `diploma`, form CTA, lead-route status, and tracking variant.
- Removed the visible Online/Offline form select and retained a controlled hidden `diploma` value.
- Added pointer and Arrow/Home/End keyboard selection with `aria-selected`, visible focus, and synchronized dynamic content.

### Landing price-card height correction

- Removed the entire landing Included area: heading, checks, items, wrapper, gaps, bottom space, and secondary controls.
- Did not replace it with a disclosure, list, or button.
- Preserved the inclusion arrays for the separate thank-you checkout card.
- Shortened installment copy to `5 interest-free payments via Sympl.` and kept it on one contained line at 320px and above.
- Removed inclusion-driven fixed/minimum height so the landing card ends naturally after format details.

### Form and conversion semantics

- Kept six visible required controls plus hidden selected format.
- Preserved inline validation, focus-first-error, duplicate-submit guard, attribution capture, and dynamic format CTA.
- Implemented local prototype success state with `FormSubmit` diagnostics, session token, qualified thank-you `Lead`, and no external lead request.
- Explicitly left both durable Offline and Online lead destinations pending instead of inventing endpoints.

### Sticky advisor CTA

- Changed text to `Speak with a Meska Advisor`.
- Made it available on mobile, tablet, and desktop after the hero through 100% scroll depth.
- Kept source-specific tracking and smooth/reduced-motion-aware return to a visibly focused full-name field.
- Added footer clearance and mobile safe-area spacing rather than hiding the CTA near the footer.

### Impact, outcomes, curriculum, and page height

- Compressed Impact and outcome presentation without squeezing readable type or normal professional spacing.
- Kept outcomes as independent disclosures.
- Made curriculum visually distinctive with a blue border/tinted surface, stronger depth, and restrained orange interaction accent.
- Preserved nine sessions and clear open/closed labels.

### Organization marquee

- Removed logo cards, borders, opaque boxes, and the visible track treatment.
- Applied consistent greyscale/contain behavior and optical sizing to sixteen organizations.
- Kept one semantic sequence plus one assistive-technology-hidden duplicate for a seamless 62-second loop.
- Added hover/focus pause and a reduced-motion static/manual-scroll fallback.

### Testimonials and approved media

- Preserved all nine testimonial screenshots at natural responsive height with no heavy crop.
- Added/retained the official Meska logo, local main video/poster, graduation video/poster, nine session videos/posters, four official instructor portraits, testimonial originals/derivatives, and organization logo originals/derivatives.
- Ensured rendered pages use local media rather than essential asset hotlinks.
- Rejected a trial main-video 720p transcode because it increased file size instead of improving delivery.

### Thank-you page

- Shortened confirmation to `Thank you — we’ve got your details.` and `A Meska advisor will contact you soon.`
- Kept one unified dynamic checkout card with Offline/Online tabs and exact Shopify destinations.
- Gave the checkout card a restrained blue/pale-blue grid/gradient, stronger border/depth, and orange active accent.
- Added the approved graduation story and nine portrait `Inside the Diploma` clips.
- Enforced one-video-at-a-time playback and pause-on-inactive-carousel behavior.
- Added four official instructor cards and retained safe LinkedIn links.
- Replaced/expanded FAQ content to sixteen approved questions; WhatsApp remains only in the verified support answer.

### Skills-to-business-value matrix

- Added nine curriculum-grounded capabilities after Inside the Diploma and before instructors.
- Implemented accessible pointer/keyboard tabs, one dynamic application/business-value panel, and a linear no-JavaScript fallback.
- Corrected the `Curriculum sessions …` element to a compact `fit-content` pill with natural height, centered text, 10px/16px padding, and no absolute positioning.
- Removed the panel height behavior that made the pill large and vertically unbalanced on tablet/desktop.

### Responsive and accessibility work

- Preserved mobile-first breakpoints at 700, 960, and 1200px plus narrow-mobile overrides.
- Verified/targeted 320, 375, 390, 768, 1024, 1280, and 1440px.
- Kept local carousels scrollable while preventing page-level overflow.
- Preserved visible focus, 44–50px interaction targets, keyboard toggles/matrix, safe-area spacing, natural media ratios, and reduced-motion rules.
- Rejected breakpoint-only cosmetic patches that hid the underlying layout cause.

### Local tracking bridge

- Centralized names/IDs and PII filtering.
- Kept `Lead` separate from CTA and checkout clicks.
- Added format, capability, checkout, thank-you, and video events with dedupe keys/event IDs.
- Deliberately did not install Meta Pixel or CAPI.

## 23 August 2026 handoff packaging

- Audited repository, source, assets, Git/configuration, forms, tracking, responsive rules, and existing handoffs.
- Verified local Git root, `main`, checkpoint hash/subject, and absence of remotes.
- Confirmed there is no Vercel state/config, production deployment, production lead endpoint, or Meta Pixel implementation.
- Added `PROJECT_STATE.json`, `CURRENT_STATE.md`, `NEXT_CODEX_PROMPT.md`, and this changelog.
- Expanded `AGENTS.md`, `PROJECT_HANDOFF.md`, and `README.md` into a fresh-chat-safe local handoff.
- Preserved local website source and all media; nothing was published, deployed, pushed, or added to the live Framer project.

## Rejected approaches that remain rejected

- Rebuilding or redesigning the accepted pages from scratch.
- Saving height through excessive vertical squishing, tiny type, minimal padding, or heavy media cropping.
- Restoring removed hero content, price inclusions, secondary controls, modal form, orbit art, or course detail bar.
- Fixing only mobile or only desktop and accepting regressions elsewhere.
- Turning the institutional marquee back into boxed cards or a static wide-screen grid.
- Stretching the curriculum-session pill or using absolute positioning.
- Replacing approved media with placeholders.
- Inventing integrations, analytics completion, infrastructure, facts, policies, or claims.
