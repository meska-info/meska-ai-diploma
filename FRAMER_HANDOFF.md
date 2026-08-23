# Meska AI Co-Pilot Diploma — Native Framer Handoff

Authoritative recreation specification · 16 August 2026

Recreate the accepted local implementation with native Framer structures. Do not import screenshots as the page, hotlink Google Drive, publish, or alter the live project without explicit approval. Read `NEXT_CHAT_HANDOFF.md`, `PROJECT_HANDOFF.md`, `MEDIA_ASSET_MANIFEST.md`, and the actual source first.

Handoff status note · 23 August 2026: this file is retained as the detailed native-Framer recreation reference. It does not override the active local React implementation and does not authorize editing or publishing the live Framer project. The production Meta Pixel remains unimplemented; Pixel ID `4138749493027663` is documented for a future explicitly approved integration only.

## Journey contract

The landing page has one conversion goal: submit the interest form through the synchronized **Request Offline Diploma Details** or **Request Online Diploma Details** action. The interest form is not a payment form.

1. Visitor selects Offline or Online in the landing price card and completes six visible required controls. The selected toggle owns the required hidden `diploma` value.
2. The production Framer integration must route Offline to the verified Offline destination and Online to the verified Online destination, then persist exactly one submission. Both destination URLs are currently missing and must not be guessed.
3. Only after durable capture, redirect to `/thank-you?diploma={value}` with permitted attribution.
4. Fire `Lead` only in that qualified thank-you state.
5. Shopify click fires `InitiateCheckout`.
6. Confirmed Shopify payment fires `Purchase` in the production commerce integration.

Do not send PII in event parameters. Do not fire conversion events from ordinary CTA clicks.

## Final section order

### Landing

1. `Global/Header`
2. `LP/HeroCopy`
3. `LP/PrimaryConversion`
   - `Media/MainOverview`
   - `Pricing/FormatCard`
   - `Form/InterestCapture`
4. `LP/ImpactStats`
5. `LP/Outcomes`
6. `LP/OrganizationMarquee`
7. `LP/CurriculumDisclosure`
8. `LP/TestimonialCarousel`
9. `Global/Footer`
10. `Global/StickyApplicationCTA`, shown after the hero through 100% scroll depth on every breakpoint; returns to and focuses the primary form

### Thank-you

1. `Global/Header` with Choose Diploma
2. `TY/ApplicationConfirmation`
3. `TY/GraduationStory`
4. `TY/FormatCheckout`
5. `TY/InsideDiplomaCarousel`
6. `TY/SkillsBusinessValueMatrix`
7. `TY/Instructors`
8. `TY/FAQ`
9. `Global/Footer`

Keep this order. Do not add a landing eligibility section, landing WhatsApp CTA, checkout gate, or payment-before-eligibility explanation.

## Framer component map

| Local source | Framer component | Native structure |
| --- | --- | --- |
| `SiteHeader`, `BrandMark` | `Global/Header` | Horizontal Stack, official image logo linked home, CTA right. |
| Hero in `LandingPage` | `LP/HeroCopy` | Vertical Stack; eyebrow, H1, subtitle. |
| `DiplomaVideo` | `Media/MainOverview` | Native 16:9 Video, poster, controls, inline, no autoplay. |
| Landing price panel | `Pricing/FormatCard` | Accessible Offline/Online variants; this control owns price content, hidden format, form CTA, lead route and tracking variant. |
| `LeadCapture` | `Form/InterestCapture` | One primary form with six visible controls plus one controlled hidden format value. |
| `StatsStrip` | `LP/ImpactStats` | Four-cell blue grid: label plus three metrics. |
| `OutcomesSection` | `LP/Outcomes` | Four independent Accordion/Component instances aligned to start. |
| `OrganizationLogoRail` | `LP/OrganizationMarquee` | One semantic logo sequence plus one visual-only duplicate for seamless motion. |
| `SyllabusSection` | `LP/CurriculumDisclosure` | Full-width Accordion header plus nine session rows. |
| `TestimonialCarousel` | `LP/TestimonialCarousel` | Horizontal scroll/drag cards with manual controls. |
| `StickyMobileCTA` | `Global/StickyApplicationCTA` | Fixed/inset bottom CTA at every breakpoint, hero-triggered and persistent through the footer; smooth form return and visible focus. |
| `GraduationStory` | `TY/GraduationStory` | Copy + native portrait Video. |
| `CheckoutSection` | `TY/FormatCheckout` | Accessible two-tab control plus one dynamic card. |
| `SnippetsCarousel` | `TY/InsideDiplomaCarousel` | Nine portrait videos in manual horizontal scroll snap. |
| `SkillsBusinessValueSection` | `TY/SkillsBusinessValueMatrix` | Nine accessible skill tabs plus one dynamic application/value panel and a no-JavaScript reading fallback. |
| `InstructorSection` | `TY/Instructors` | Four balanced CMS cards with official portrait and LinkedIn link. |
| `FAQSection` | `TY/FAQ` | Sixteen independent native accordions; first open. |

Use stable component properties/CMS fields rather than generated layer indexes for tracking or content binding.

## Design tokens

### Color

| Token | Value | Primary use |
| --- | --- | --- |
| `Color/PrimaryBlue` | `#021F94` | CTAs, selected tabs, price accent, blue surfaces |
| `Color/OffWhite` | `#F5F2F3` | breathing backgrounds and fields |
| `Color/DeepNavy` | `#151130` | primary text and dark media section |
| `Color/Slate` | `#1E223D` | supporting text |
| `Color/AccentOrange` | `#F54F1B` | eyebrow dots, accent line, checks |
| `Color/White` | `#FFFFFF` | cards and inverse text |
| `Color/Muted` | `#626477` | metadata |
| `Color/Line` | `#D6D1D6` | borders and dividers |
| `Color/Success` | `#087D52` | no-payment reassurance |
| `Color/Error` | `#BD1E37` | validation |

### Geometry and space

- Radii: `10px`, `18px`, `26px`; header `14px`; pills only where semantically appropriate.
- Content max: `1280px`.
- Page gutters: `16px` base, `24px` from 700px, `32px` from 960px.
- Space scale: `4, 8, 12, 16, 20, 24, 32, 40, 48, 64px`.
- Minimum interactive target: `44px`; form control: `50px`.
- Small shadow: `0 12px 34px rgba(21,17,48,.08)`.
- Blue shadow: `0 18px 46px rgba(2,31,148,.20)`.

Typography remains Inter/system sans. Use fluid frames and natural wrapping; do not insert forced line breaks. Avoid clipping tight negative tracking.

## Responsive construction

### Base: 320–699px

- Header logo is 98px at 320px and 116px above 359px; CTA remains at least 42px high.
- Hero copy stays compact but breathable.
- Primary conversion order is explanation/video → price card → form.
- Price details use two columns; location spans both columns. The landing price card ends immediately after this essential information. It has no Included heading, checkmarks, benefit items, wrapper, disclosure, replacement control or reserved empty space.
- Render `5 interest-free payments via Sympl.` on one line at 320px and above. Use moderately fluid type, natural card padding and `nowrap` only after confirming the text remains contained without clipping or page overflow.
- Form is one column; keep six visible required controls plus the required hidden `diploma` value controlled by the format tabs.
- Impact is 2×2; outcomes are one column.
- Marquee logo slots are transparent, optically enlarged, consistently greyscale and move continuously; no page overflow.
- Curriculum control uses a substantial blue-bordered/tinted two-column header with a 38–44px orange state icon.
- Testimonials show one card.
- Sticky CTA uses 12px inset plus safe-area bottom padding.
- Graduation video is centered, max 360px, natural 9:16.
- Checkout card is one column.
- Inside Diploma shows an 86%-wide primary card with next-card peek.
- Skills use a horizontally scrollable, 62px-minimum card-tab row paired with one stacked value panel.
- Instructor cards are one column.

### 700–959px

- Form pairs use two columns; the skills matrix becomes a two-column selector/value layout.
- Outcomes and instructors use two columns.
- Session and testimonial carousels show two cards.
- Graduation story becomes copy plus portrait video.
- Sticky CTA becomes a 340px right-aligned floating control and remains present through the footer with reserved footer space.

### 960–1199px

- Landing primary conversion becomes a top-aligned `46% / 54%` media-price/form row.
- Within the narrower 46% landing column, stack the price and installment line so the complete installment wording remains one line inside its own content box.
- Unified checkout card becomes two internal columns with a divider.

### 1200px+

- Keep the landing price/installment group naturally stacked inside its conversion column; do not force the installment line into a narrower side cell.
- Outcomes use four columns.
- Testimonials and Inside Diploma show three cards.
- Instructors use four balanced columns.
- Marquee remains continuous; do not revert to a static desktop grid.

Validate 320, 375, 390, 768, 1024, 1280 and 1440px.

## Landing content and behavior

### Hero

- Eyebrow: `Meska AI Copilot Diploma`
- H1: `Learn AI. Apply it to real business.`
- Subtitle: `Solve real business challenges alongside managers, CEOs, founders, mentors, trainers, and subject-matter experts.`
- Keep the current hero footprint; do not add another paragraph or increase vertical height.

### Main video context

- Use one compact H2 only: `Why We Built the Diploma`.
- Remove the former eyebrow, long title, subtitle and duration row above the video. Preserve comfortable but reduced spacing.

### Pricing and form

- Put one accessible Offline/Online segmented tab control inside/directly above the single price card. Default Offline unless `diploma=online` is present.
- Display only price, wave, date, format, location and `5 interest-free payments via Sympl.` in a compact grouped layout.
- Remove the landing card’s entire Included area: heading, checks, items, container, gaps and space. The component must size naturally after the format details, with no inclusion-specific fixed/minimum height or bottom padding. Keep the thank-you checkout card’s separate verified inclusions list unchanged.
- Remove `Request Diploma Details` and `View everything included` from the price card; do not replace them.
- Form H3: `Interested? Let’s Talk!`
- Form subtitle: `A program advisor will answer your questions, walk you through payment options, and explain the next steps.`
- Offline submit: `Request Offline Diploma Details`; Online submit: `Request Online Diploma Details`.
- Reassurance: `No payment is required to submit your application.`
- The selected format must update price, wave, start, delivery, location, installment text, submit label, hidden format, lead route and tracking variant atomically.

### Form fields

Exactly seven submitted names, with six visible required controls and one controlled hidden value:

1. `fullName`
2. `email`
3. `mobile`
4. `diploma` — hidden; value must be exactly `offline` or `online`, controlled only by the landing format tabs
5. `job`
6. `company`
7. `website`

Do not render the former “Online or Offline Diploma” select. Provide inline errors, focus the first invalid field, preserve autocomplete values and prevent double submission. Before capture, assert that the hidden value, selected format, button label, route and tracking variant agree.

### Landing format/lead mapping

| Selected format | Price / current wave | Delivery / location | Form CTA | Hidden value | Durable lead destination |
| --- | --- | --- | --- | --- | --- |
| Offline | EGP 25,000 · Wave 14 · starts 22 August 2026 | 8 offline + 3 online live sessions · Creativa Innovation Hub, Giza | `Request Offline Diploma Details` | `offline` | **Missing** — obtain the verified Offline Google Sheets Apps Script/webhook URL; do not guess |
| Online | EGP 20,000 · Wave 10 · starts 23 August 2026 | 8 live + 3 online recap sessions · Virtual live sessions | `Request Online Diploma Details` | `online` | **Missing** — obtain the verified Online Google Sheets Apps Script/webhook URL; do not guess |

Both formats include 11 sessions plus the graduation project. The displayed installment wording is `5 interest-free payments via Sympl.` Never send one lead to both destinations. Preserve permitted UTMs and redirect only after the selected route confirms durable capture.

### Outcome/curriculum controls

- Outcome eyebrow: `THE SHIFT`
- H2: `Work differently after the diploma.`
- Each outcome owns its state; open content must not stretch a closed neighbor.
- Curriculum eyebrow: `THE FULL LEARNING JOURNEY`
- H2: `Explore the complete curriculum`
- Closed label: `Explore All Sessions`; open: `Hide Full Curriculum`.
- Entire summary is interactive; retain nine verified rows.
- Use the existing palette only: light blue tint/white surface, 2px primary-blue border, restrained orange state icon/accent, stronger depth than ordinary cards. Preserve visible hover, focus, open and closed states without making it a banner.

### Organization marquee

- Keep the approved 16-logo order from `app/content.ts`/manifest.
- Use one semantic sequence with organization-name alt text.
- Duplicate only for the seamless visual loop; mark duplicate sequence hidden from assistive technology and give duplicate images empty alt.
- Duration reference: 62 seconds linear, no jump.
- Pause on hover and keyboard focus.
- Reduced motion: stop animation, remove visual duplicate from layout and leave one manually scrollable sequence.
- Remove individual logo cards, borders, background boxes and the visible rail/track. The section and moving slots stay transparent.
- Apply consistent greyscale treatment, preserve `object-fit: contain`/intrinsic aspect ratios and optically enlarge/normalize the artwork instead of forcing identical artwork dimensions.
- Base slots are approximately 180×96px with 64px image wells; from 700px use approximately 214×108px with 72px image wells. Adjust individual optical size only when needed for clarity.
- Logos are not links and do not emit tracking.

## Thank-you content and behavior

### Application confirmation

- Eyebrow: `APPLICATION RECEIVED`
- H1: `Thank you — we’ve got your details.`
- Subtitle: `A Meska advisor will contact you soon.`
- Do not add another paragraph. Keep the confirmation immediate and compact.

### Graduation story

- Eyebrow: `A MOMENT FROM A PREVIOUS WAVE`
- H2: `Before you decide, see what the experience meant to them.`
- Use the approved body from `GraduationStory`.
- Native 9:16 controls, no autoplay, no heavy crop.

### One dynamic format card

- Eyebrow: `CHOOSE HOW YOU LEARN BEST`
- H2: `One outcome. Two practical ways to get there.`
- Use the approved body from `CheckoutSection`.
- Two tabs: Offline / Online, role tab semantics, selected state, visible focus, Arrow Left/Right/Up/Down and Home/End navigation.
- Default Offline unless the qualified query is Online.
- One panel/card; update wave, heading, price, installment copy, date, format, location, inclusions, CTA, event metadata and destination atomically.
- Offline CTA: `Continue with the Offline Diploma`.
- Online CTA: `Continue with the Online Diploma`.
- Supporting note: `You will be able to review your order before completing payment.`
- Preserve both complete checkout URLs from `app/content.ts`, including every original query parameter.
- Style the unified card with a subtle white/blue-to-navy-tint gradient, a very light 32px grid pattern, a stronger blue border, controlled blue depth and a small orange active/accent line. Maintain dark text contrast and avoid a loud multicolour surface.

### Inside Diploma carousel

- Eyebrow: `NEED MORE TIME TO DECIDE?`
- H2: `Step inside the diploma and see for yourself.`
- Use the approved body from `SnippetsCarousel`.
- Nine records in the exact manifest order.
- Manual swipe/drag plus previous/next controls and numeric indicator.
- One/two/three cards at mobile/tablet/desktop.
- No uncontrolled infinite animation.
- Starting a video pauses all other page videos.
- Advancing away from an active video pauses it.

### Skills-to-business-value matrix

- Position: immediately after `TY/InsideDiplomaCarousel` and before `TY/Instructors`.
- Eyebrow: `WHAT YOU’LL BE ABLE TO DO`
- H2: `From AI skills to measurable business value.`
- Subtitle: `Explore how the technical capabilities you build throughout the diploma translate into faster work, stronger decisions, and practical solutions for your role.`
- Desktop/tablet: nine vertically stacked skill tabs plus one dynamic application/value panel. Mobile: horizontally scrollable card tabs plus the stacked panel. Minimum tab target is 62px.
- Use `role=tablist` / `role=tab` / `role=tabpanel`, roving `tabIndex`, `aria-selected`, `aria-controls`, visible focus and Arrow/Home/End navigation. Pointer input must not be required to discover information.
- Default to the first item. Use a short transition and remove nonessential motion for `prefers-reduced-motion`.
- Provide a linear no-JavaScript fallback containing every capability, application and benefit in curriculum order.
- Render the `Curriculum sessions …` mapping as a content-sized inline Stack/pill: `Fit Content` width and height, centered alignment, approximately 10px vertical and 16px horizontal token-based padding, one line where space permits, and no absolute positioning. The dynamic panel must use natural height rather than `100%` minimum height so the pill cannot stretch into a large grid row on tablet or desktop.

| ID / sessions | Capability | What the participant will be able to do | Professional/business benefit |
| --- | --- | --- | --- |
| `ai-foundations` · 01 + 03 | AI foundations and tool selection | Understand what AI can and cannot do, map how it may disrupt an industry, and choose tools by capability rather than hype. | Make clearer technology choices and focus time and budget on tools that fit the business problem. |
| `applied-prompting` · 02 | Applied prompting | Build reusable prompt systems around role, context, recurring tasks and quality requirements. | Produce stronger work faster and more consistently across everyday responsibilities. |
| `research-analysis` · 03 | Research and information analysis | Use AI for research, reasoning, search, document analysis, comparison and decision support. | Reach better-informed decisions in less time and turn complex information into usable insight. |
| `structured-outputs` · 04 | Assistants and structured outputs | Configure assistants and use vision, voice, dashboards, tools and structured documents to support real work. | Turn scattered information into practical outputs that teams can understand, use and act on. |
| `workflow-automation` · 05 | Workflow design and automation | Move from one-off AI use to structured workflows and scheduled tasks that handle repeatable steps. | Save time, reduce manual effort and make recurring work more reliable. |
| `agent-design` · 06 | AI-agent design | Design task systems using triggers, tools, guardrails and trust, then turn a scheduled task into a working agent. | Create more capable AI-enabled processes while keeping responsibilities and safeguards clear. |
| `business-prototyping` · 07 | Business-solution prototyping | Frame AI opportunities around revenue, cost, risk and experience, then begin building a practical solution. | Test value before committing major time or budget and communicate the business case clearly. |
| `media-creation` · 08 | AI content and media creation | Build scalable systems for on-brand text, images, video, avatars and conversion-ready media. | Increase content capacity while protecting consistency, speed and brand quality. |
| `graduation-execution` · 09 | Graduation-project execution | Design and present a real AI solution for a work problem to an industry panel. | Leave with a tested concept, practical implementation experience and a clearer way to champion AI at work. |

Emit `CapabilitySelect` only after a changed pointer/keyboard selection, using `skills_business_value_matrix`, `capability_id`, `previous_capability_id`, `selection_source` and `interaction_location=thank_you_skills_matrix`.

### Instructors and FAQ

- Use the four records from `app/content.ts`; do not restore Ahmed Mostafa.
- Keep cards equal in presentation without truncating biographies.
- LinkedIn links open in a new tab with `noopener noreferrer` and an accessible new-tab label.
- The FAQ contains sixteen independent native details; open the first by default. WhatsApp appears only in the verified support answer. Use the following final copy exactly (minor typographic punctuation only):

| Question | Final answer |
| --- | --- |
| Does submitting the application charge me? | No. Submitting the application only tells the Meska team that you are interested. A program advisor will contact you, explain the details, and answer your questions. No payment is taken through the application form. |
| Do I need a technical background? | No. The diploma is designed for business professionals, managers, and entrepreneurs. You will learn how to use and apply AI without needing to code. |
| Is the diploma genuinely practical and hands-on? | Yes. Sessions are built around guided practice, real business tasks, applied workflows, and a graduation project. The objective is not simply to understand AI concepts; it is to use them in your actual work. |
| Will I receive support while applying what I learn? | Yes. You will have access to the Meska team and instructors through the program’s WhatsApp support channel. You can ask questions and get help as you apply the tools and workflows between sessions. |
| Are the sessions recorded? | Yes. Sessions are recorded so you can revisit explanations, demonstrations, and practical exercises after the live session. |
| What happens if I join Offline but miss a session? | The online cohort runs in parallel. If you miss an offline session, the Meska team can help you attend the corresponding online session where scheduling allows. You will also have access to the session recording. |
| What is the difference between Online and Offline? | Offline combines 8 in-person sessions at Creativa Innovation Hub in Giza with 3 online live sessions. Online is delivered virtually through 8 live sessions and 3 online recap sessions. Both formats centre on guided practice, real work, recordings, and hands-on support; the main difference is where and how you prefer to participate. |
| Are installment plans available? | Yes. You can pay through Sympl over five months, or speak with the Meska sales team to discuss the available payment arrangements. |
| Will I receive a certificate? | Yes. You will receive a certificate of completion after successfully completing the diploma requirements. |
| What are the eligibility requirements? | The diploma is designed for business professionals, managers, founders, and team leaders with at least 3–5 years of professional experience. You should be interested in applying AI to real business challenges and able to commit to the weekly live session, practical study, and graduation project. |
| What is the selection criteria? | We look for business professionals with at least 3–5 years of experience who are enthusiastic about AI, ready to practise consistently, and willing to contribute to and learn from the diploma community. Applicants must also have enough time to participate fully throughout the eight weeks. |
| What is the time commitment? | Plan for one live session each week, lasting up to five hours including breaks. In addition, you should dedicate approximately 15 hours per week to study, practice, applying the tools, and preparing your graduation project. |
| How long is the diploma? | The diploma runs for eight weeks. Offline sessions take place every Saturday, while Online sessions take place every Sunday. |
| What can I do to prepare? | Come ready to learn, practise, and contribute. The diploma works best when you actively apply what you learn and exchange experience with a group of like-minded business professionals. |
| What is the cancellation or refund policy? | Cancellation and refund requests are accepted only before 25% of the diploma has been completed. After that point, the diploma fees are non-refundable. |
| What language are sessions delivered in? | Sessions are primarily delivered in Arabic. Our instructors are also comfortable using English whenever it helps explain a concept, tool, or business case more clearly. |

## Asset upload matrix

Every rendered asset must be uploaded into Framer. Replace local paths with Framer asset URLs; Google Drive links are provenance only.

| Group | Count | Local source/presentation path | Framer treatment |
| --- | ---: | --- | --- |
| Official Meska logo | 1 | `public/media/brand/original/meska-2026-logo.png` | Native image, intrinsic 3283×576 ratio, linked home. |
| Main overview video/poster | 1 + 1 | `public/media/videos/original/meska-ai-diploma-main-video.mp4`; matching poster | 16:9 Video, metadata preload. |
| Graduation video/poster | 1 + 1 | `public/media/videos/optimized/graduation-wave.mp4`; `public/media/images/posters/graduation-wave.webp` | 9:16 Video. |
| Session videos | 9 | `public/media/videos/optimized/inside-diploma-session-01.mp4` … `-09.mp4` | 9:16 Video records, exact order. |
| Session posters | 9 | `public/media/images/posters/inside-diploma/session-01.webp` … `session-09.webp` | Exact video mapping. |
| Instructor portraits | 4 | `public/media/instructors/optimized/*.webp` | 4:5 contained/respectful crop, top-centered. |
| Testimonial images | 9 | `public/media/images/optimized/testimonial-*.webp` | Natural height, no crop. |
| Organization logos | 16 | `public/media/logos/monochrome/*` | Transparent slots, CSS greyscale, contain, normalized optical size; no cards/track. |

The 10 new videos are optimized H.264/AAC `720×1280` derivatives with fast-start metadata. Do not upload the temporary 1.35GB source-download set from outside the repository. See `MEDIA_ASSET_MANIFEST.md` for original Drive filenames, dimensions, durations, file sizes and provenance.

## Tracking plan

Use the project naming convention exactly.

| Action | Event | Stable ID / required parameters |
| --- | --- | --- |
| Landing view | `ViewContent` | `diploma_landing_view`, diploma/category |
| Header/sticky CTA | `CTAOpenForm` | source-specific tracking ID and `cta_location`; sticky uses `sticky_start_application` / `sticky` |
| First form interaction | `FormStart` | form ID, location, variant |
| Validation failure | `FormError` | form ID, location, error type/count, variant |
| Valid local submit intent | `FormSubmit` | form submit ID, variant, wave, form location, shared event ID and destination status; non-conversion diagnostic event |
| Confirmed capture | `Lead` | form submit ID, variant, wave, form location, shared event ID, permitted UTMs |
| Thank-you view | `LeadThankYouView` | `lead_thank_you_view`, qualified-state boolean |
| Landing format change | `FormatSelect` | `landing_format_toggle`, variant, previous variant, `selection_source`, form location |
| Thank-you format change | `FormatSelect` | `checkout_format_toggle`, variant, previous variant, `selection_source` |
| Skills-matrix change | `CapabilitySelect` | `skills_business_value_matrix`, capability IDs, source and interaction location |
| Offline checkout | `InitiateCheckout` | `offline_shopify_checkout`, offline, 25000, EGP, event ID |
| Online checkout | `InitiateCheckout` | `online_shopify_checkout`, online, 20000, EGP, event ID |
| Graduation first play | `VideoPlay` | `thank_you_graduation_video`, media location |
| Session first play | `VideoPlay` | `inside_diploma_video_01` … `_09`, location and 1-based index |

Deduplicate `Lead` and first-video-play events. Preserve the shared `event_id` for future Pixel/CAPI deduplication. Filter PII-shaped keys and never pass field values. Do not install a production Pixel in the local project. The future approved Pixel ID is `4138749493027663`; documenting it here is not authorization to initialize, fire, publish, or deploy it.

## Scoped correction verification · 16 August 2026

- The landing price panel has no Included heading, checkmarks, items or inclusion wrapper in either format. Its final content child is the format-details list, followed only by the normal 16px mobile or 20px desktop card padding.
- Offline/Online panel heights now range from approximately 390–408px at 320px, 392–394px at 375/390px and 353–371px at 1024–1440px, materially shorter than the prior 464–705px implementation.
- `5 interest-free payments via Sympl.` rendered as one line, stayed within its own content box and introduced no document overflow at 320, 375, 390, 768, 1024, 1280 or 1440px.
- The exact 768px review frame and direct 1024/1280/1440 checks rendered the curriculum-session pill at approximately 192×34px with 10px/16px padding, centered text, natural panel height and 26px bottom clearance. The mobile pill retained the same compact height and remained inside its panel.
- The thank-you checkout retained its separate eight-item inclusions list. Videos, FAQs, forms, sticky behavior and checkout destinations were not changed by this pass.
- Landing and checkout `FormatSelect`, form `FormStart` with the selected variant, and keyboard `CapabilitySelect` were observed in the local tracking log. No event names, parameters, submit logic or Pixel behavior changed.

## Production integration checklist

- [ ] Upload every asset in the matrix to Framer.
- [ ] Replace every local path; confirm no Google Drive hotlink remains.
- [ ] Recreate the official logo at the correct intrinsic ratio.
- [ ] Build one primary form with six visible required controls plus controlled hidden `diploma`; do not recreate the removed format select or modal duplicate.
- [ ] Obtain the missing verified Offline Google Sheets Apps Script/webhook destination.
- [ ] Obtain the missing verified Online Google Sheets Apps Script/webhook destination.
- [ ] Route exactly one selected format to exactly one durable destination and redirect only on confirmed success.
- [ ] Preserve attribution without overwriting Shopify query parameters.
- [ ] Build accessible landing and thank-you format tabs and atomic card/form variants.
- [ ] Confirm exact prices, dates, destinations and the `5 interest-free payments via Sympl.` copy, including one-line containment at 320px.
- [ ] Confirm the landing price card has no Included layers or reserved inclusion space while the thank-you checkout inclusions remain intact.
- [ ] Confirm every curriculum-session mapping is a compact content-sized pill at tablet and desktop widths.
- [ ] Build all ten user-controlled videos with posters and one-at-a-time coordination.
- [ ] Build the continuous logo marquee and reduced-motion fallback.
- [ ] Build the nine-item accessible skills-to-business-value matrix and linear no-JavaScript fallback.
- [ ] Validate focus, keyboard order, contrast, alt text and new-tab labels.
- [ ] Validate 320, 375, 390, 768, 1024, 1280 and 1440px with no overflow.
- [ ] Test form validation/capture, qualified Lead, both checkouts, video plays and event deduplication with actual debugging evidence.
- [ ] Publish only after explicit approval.

### Manual Framer configuration still required

1. Create two secure format-specific form actions after Meska supplies the verified destinations. Keep endpoint/secrets out of public CMS copy and analytics payloads.
2. Bind the landing `Pricing/FormatCard` selected variant to the hidden `diploma` value, form CTA property, route key and tracking variant. Do not maintain separate independent states.
3. Configure success handling so failed capture keeps the visitor on the form with an accessible error; only confirmed capture creates the qualified token and redirect.
4. Upload and bind all local media in the asset matrix; preserve complete Shopify query strings separately from the lead routes.
5. Recreate the sticky CTA’s hero trigger, full-depth persistence, safe-area inset, footer reserve space, smooth return and focus restoration.
6. Configure reduced-motion variants for the marquee, skills transition and all nonessential smooth scrolling.
