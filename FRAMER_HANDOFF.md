# Meska AI — Native Framer Handoff

Current implementation reference · 15 August 2026

This document is the authoritative Framer recreation specification for the current local prototype. Read `PROJECT_HANDOFF.md` first for repository state, approved decisions, run instructions, and unfinished work. Recreate the approved page with native Framer elements; do not import screenshots as the page.

## Journey and final section order

The landing page has one conversion goal: **Start Application**. The interest form is not a payment form. After durable lead capture, redirect to the thank-you page. Payment begins only from the thank-you page through the respective Shopify checkout.

Landing page:

1. `Global/Header/Pill`
2. `LP/Hero`
3. `Media/MainDiplomaVideo`
4. `LP/CourseDetails`
5. `LP/PrimaryApplication` containing `Pricing/DynamicCard` and `Form/InterestCapture`
6. `LP/ImpactStrip`
7. `LP/Outcomes`
8. `LP/ClientLogoGrid`
9. `LP/MidCTA`
10. `LP/Syllabus`
11. `LP/TestimonialCarousel`
12. `LP/FinalApplication`
13. `Global/Footer`
14. `Global/StickyApplicationCTA` on mobile after the hero
15. `Form/ApplicationModal` overlay shared by mid-page and sticky CTAs

Thank-you page:

1. `Global/Header/Pill` with Choose Diploma
2. `TY/ParticipantStoryHero`
3. `TY/CheckoutOptions`
4. `TY/SessionSnippets`
5. `TY/Instructors`
6. `TY/FAQ`
7. `Global/Footer`

Keep the FAQ on the thank-you page. Do not add landing eligibility/audience content, WhatsApp, checkout gating, payment-before-eligibility explanation, or a confirmation summary above checkout.

## Component list and native Framer structure

| Local component | Framer component/layer | Native structure |
|---|---|---|
| `SiteHeader` | `Global/Header/Pill` | Horizontal Stack; logo/brand left, CTA right. |
| Landing hero section | `LP/Hero` | Responsive Stack with `Hero/Copy` and `Hero/OrbitGraphic`. |
| `VideoPlaceholder` | `Media/VideoFrame` | Aspect-ratio Frame with native Video, poster, and play control. |
| `CourseDetailsBar` | `LP/CourseDetails` | Nested responsive Stacks or Grid with five bordered cells. |
| `LeadCapture` | `Form/InterestCapture` | Responsive Stack containing dynamic pricing and native Framer Form. |
| Price panel | `Pricing/DynamicCard` | `Offline` and `Online` variants. |
| `StatsStrip` | `LP/ImpactStrip` | Blue section Stack plus three metric cells. |
| `OutcomesSection` | `LP/Outcomes` | Four instances of `Outcome/Card`. |
| `ClientLogoGrid` | `LP/ClientLogoGrid` | CMS Collection List or grid of `Logo/Cell`. |
| `MidPageCTA` | `LP/MidCTA` | Dark CTA Stack; vertical mobile variant. |
| `LeadModal` | `Form/ApplicationModal` | Framer Overlay; full-screen sheet on mobile. |
| `SyllabusSection` | `LP/Syllabus` | Nine CMS/list instances of `Syllabus/Row`. |
| `TestimonialCarousel` | `LP/TestimonialCarousel` | Horizontal scroll/drag section with `Testimonial/ImageCard`. |
| `StickyMobileCTA` | `Global/StickyApplicationCTA` | Fixed bottom Stack, mobile-only, intersection-controlled. |
| `CheckoutSection` | `TY/CheckoutOptions` | Two `Checkout/Card` variants. |
| `SnippetsCarousel` | `TY/SessionSnippets` | Portrait Video plus vertical controls. |
| `InstructorSection` | `TY/Instructors` | CMS list of four `Instructor/Card` instances. |
| `FAQSection` | `TY/FAQ` | Native accordion or open/closed component variants. |
| `SiteFooter` | `Global/Footer` | Horizontal Stack; vertical on mobile. |

Use these names as stable tracking contracts. Do not bind tracking to generated class names, CMS indexes, or visual position.

## Design tokens

### Color

| Framer token | Value | Use |
|---|---:|---|
| `Color/Ink` | `#00111C` | Main text and dark surfaces. |
| `Color/InkSoft` | `#31414B` | Supporting text. |
| `Color/Muted` | `#6A747C` | Metadata and secondary copy. |
| `Color/MeskaBlue` | `#0A72F3` | Primary CTA and accents. |
| `Color/BrightBlue` | `#00A8FF` | Focus, gradient, eyebrow dot. |
| `Color/BluePale` | `#EAF5FF` | Pale hover/background state. |
| `Color/White` | `#FFFFFF` | Page surfaces and inverse text. |
| `Color/Paper` | `#F5F7F9` | Alternating section background. |
| `Color/Line` | `#DCE2E7` | Dividers and fields. |
| `Color/LineDark` | `rgba(255,255,255,.18)` | Dividers on dark surfaces. |
| `Color/Success` | `#087D52` | Confirmed future success states. |
| `Color/Error` | `#BD1E37` | Validation errors. |

### Radius, shadow, width, and spacing

| Token | Value |
|---|---:|
| `Radius/Small` | `14px` |
| `Radius/Medium` | `24px` |
| `Radius/Large` | `36px` desktop; `26px` mobile |
| `Radius/Pill` | `999px` |
| `Shadow/Small` | `0 10px 40px rgba(0,17,28,.08)` |
| `Shadow/Blue` | `0 20px 60px rgba(10,114,243,.24)` |
| `Content/Max` | `1280px` |
| `Section/Vertical` | `clamp(80px, 9vw, 144px)`; `86px` mobile |
| `Canvas/Desktop` | `20px` minimum side gutter |
| `Canvas/Tablet` | `24px` side gutter |
| `Canvas/Mobile` | `16px` side gutter |
| `Touch/Minimum` | `44px` |

Primary form/card proportions are approximately `0.82fr / 1.18fr` above 1100px, `0.72fr / 1.28fr` from 821–1100px, and stacked at 820px and below.

## Fonts and typography

- Family: Inter, then system sans-serif fallbacks. The local prototype does not make a remote font request.
- Body: 16px/1.55 desktop; 15px/1.55 mobile.
- Landing H1: `clamp(72px, 8vw, 126px)` desktop; `clamp(58px, 18vw, 80px)` mobile.
- Thank-you H1: `clamp(58px, 6.8vw, 115px)` desktop; `clamp(54px, 16vw, 75px)` mobile.
- Section H2: `clamp(43px, 6.2vw, 102px)` desktop; `clamp(43px, 13.5vw, 64px)` mobile.
- Hero accent: `clamp(25px, 3.2vw, 51px)` desktop; 29px mobile.
- Eyebrow: 12px desktop; 10px mobile; uppercase with 5% tracking.
- Headings: about `.98` line height and `-4.5%` tracking; landing hero uses `.83` line height and tighter tracking.

Use fluid sizing and copy-frame widths rather than hard-coded `<br>` elements.

## Mobile-first layout rules

### Base 360–560px

- Header uses 16px page gutters, a 60px pill, and a 44px CTA.
- Hero is a vertical Stack: copy first, orbit graphic second.
- Hero CTA is full width; curriculum link remains visible.
- Orbit graphic has a 330px minimum height.
- Landscape video becomes 10:7.
- Details use two columns; the fifth cell spans both.
- Price panel sits above the form. Four facts become one column on mobile.
- Fields become one column, 54px minimum height, and 16px input text.
- Modal becomes a 100dvh sheet and shows the form only.
- Impact, outcomes, instructors, and checkout details are one column.
- Logo grid is two columns.
- Curriculum outcome copy wraps under each session title.
- Testimonial cards occupy about 84% of the track width to show a next-card cue.
- Checkout cards stack.
- Sticky CTA appears after the hero leaves view and must not cover focused inputs or accordion controls.
- No important content is hidden to shorten the page.

### Tablet 561–820px

- 24px page gutters.
- Hero and price/form remain stacked; orbit graphic minimum height is 430px.
- Price facts use two columns.
- Outcomes and instructors use two columns.
- Checkout cards remain stacked.
- Mid CTA becomes vertical.

### Laptop 821–1100px

- Hero is an asymmetric two-column grid.
- Price/form is a two-column `0.72fr / 1.28fr` layout.
- Details use three columns across two rows.
- Outcomes and instructors use two columns.
- Logos use four columns.

### Desktop 1101–1440px+

- Center the 1280px max-width shell.
- Hero uses two columns and a fluid 48–104px gap.
- Details use five equal cells.
- Price/form is `0.82fr / 1.18fr`.
- Outcomes and instructors use four columns.
- Logos use six columns.
- Checkout uses two equal cards.

## Interaction and animation specifications

- Primary button hover: 180ms ease, -2px vertical lift, darker blue, stronger blue shadow.
- Internal anchor scroll: smooth unless reduced motion is requested.
- Application overlay: focus trap, Escape close, close button, backdrop, and focus restoration. Full-screen on mobile.
- Sticky CTA: `IntersectionObserver` driven by hero visibility, not an arbitrary scroll distance.
- Testimonial carousel: horizontal drag/scroll plus previous/next buttons; no autoplay.
- Session snippets: one portrait video at a time, up/down controls, looping index; no autoplay.
- FAQ: native keyboard-operable summary; first item may start open.
- `prefers-reduced-motion: reduce`: remove smooth scrolling and make transitions/animations effectively instant.
- Final videos must not autoplay simultaneously. Lazy-load below-the-fold media.

## Native Framer recreation instructions

### Landing page

1. Create an English page using a white root vertical Stack and the tokens above.
2. Build the pill header with the approved SVG logo when supplied. Link its CTA to `#apply`.
3. Build `LP/Hero` with responsive Stacks. Recreate the orbit visual with native Frames, borders, gradients, and labels; no canvas or WebGL.
4. Add the main video with responsive poster, captions, and transcript support when supplied.
5. Build the details bar from nested Stacks or Grid; use cell borders instead of absolute divider lines.
6. Build `Pricing/DynamicCard` with `Offline` and `Online` variants.
7. Build the native form with exactly these required field names: `fullName`, `email`, `mobile`, `diploma`, `job`, `company`, `website`.
8. Bind the diploma select to the pricing-card variant and keep its price, date, format, and venue synchronized.
9. Provide explicit inline errors and focus the first invalid field.
10. Connect the approved Framer form/webhook to the future Google Sheet. Redirect only after the provider confirms durable capture.
11. Preserve attribution through the success redirect to `/thank-you?diploma={value}`.
12. Build metrics, outcomes, logos, curriculum, testimonials, and instructors as reusable components or CMS collections.
13. Use one shared application overlay instance for mid-page and sticky CTAs.
14. Keep the final application form and footer in the approved order.

### Thank-you page

1. Create `/thank-you` with `noindex, nofollow`.
2. Reuse the pill header with label Choose Diploma and destination `#checkout`.
3. Build the participant-story hero and landscape video.
4. Build two visible checkout cards; do not gate either card.
5. Add the final offline/online Shopify URLs when supplied. Merge permitted attribution parameters without overwriting existing Shopify query parameters.
6. Build the portrait snippet carousel from three CMS/video records.
7. Build instructors from records containing name, title, secondary title, bio, image, and alt text.
8. Build the six-item FAQ. Keep unknown policy answers visibly pending until approved.
9. Do not add a confirmation summary above the checkout options.

### Functionality requiring code components or overrides

- Diploma select → dynamic pricing variant synchronization.
- Attribution capture and propagation if the chosen form integration does not support it natively.
- Pending-success token, post-capture redirect, and reliable deduplicated `Lead` firing.
- Conditional sticky mobile CTA visibility.
- Central Meta `trackEvent()` bridge and future Pixel/CAPI event ID sharing.
- Optional vertical snippet carousel only if native Framer effects cannot match it.

Everything else should use native Stacks, Grids, Forms, Components, Variants, CMS, Video, Overlay, and Accordion behavior.

## Editable content and asset inventory

Keep these easy to locate as variables, component properties, or CMS records:

- Diploma name, hero copy, CTA labels, and disclosure.
- Waves, dates, schedule, duration, format, venue, prices, numeric values, currency, discounts/payment plans, inclusions, and checkout URLs.
- Outcomes, curriculum, metrics, logos, testimonials, instructors, and FAQs.
- Form field labels, validation messages, capture destination, and success route.
- SEO title/description/canonical/Open Graph values.
- Every stable tracking name and event parameter mapping.

| Asset | Current state | Production requirement |
|---|---|---|
| Meska logo | CSS approximation | Approved SVG. |
| Landing video | Placeholder | Video, poster, captions, transcript. |
| Client logos | 12 neutral slots | Approved logos and alt text/permissions. |
| Testimonials | 6 neutral slots | Approved images and alt text. |
| Participant video | Placeholder | Video, poster, captions, transcript. |
| Session snippets | 3 portrait placeholders | Compressed clips and poster frames. |
| Instructor photos | 4 initials placeholders | Approved portraits and alt text. |
| Open Graph image | Missing | Approved 1200×630 image. |
| Shopify links | Missing | Offline and online destinations. |
| Lead destination | Missing | Framer form/webhook/Google Sheet integration. |

Use SVG for logos and AVIF/WebP for raster images. Provide responsive sizes and dimensions, lazy-load below-the-fold media, and avoid cumulative layout shift.

## CTA destinations

| Element | Current prototype | Final Framer destination |
|---|---|---|
| Header Start Application | `#apply` | Primary application form. |
| Hero Start Application | `#apply` | Primary application form. |
| Curriculum link | `#curriculum` | Curriculum section. |
| Mid-page Start Application | Application modal | Shared application overlay. |
| Sticky Start Application | Application modal | Shared application overlay. |
| Form submit | `/thank-you?diploma={selection}` | Redirect only after confirmed capture. |
| Thank-you Choose Diploma | `#checkout` | Checkout section. |
| Offline checkout | Pending | Offline Shopify checkout. |
| Online checkout | Pending | Online Shopify checkout. |

No WhatsApp destination is part of the approved journey.

## SEO handoff

- Landing title: `AI Co-Pilot Diploma | Meska AI`.
- Landing description: `A hands-on AI diploma for professionals and managers who want to automate work, improve decisions, and lead smarter.`
- Thank-you title: `Your AI Co-Pilot Diploma Options | Meska AI`.
- Thank-you description: `Compare the Meska AI online and offline diploma options and continue to the appropriate checkout.`
- Language: `en`.
- Thank-you: `noindex, nofollow`.
- Production canonical, final slug, final Open Graph copy, and 1200×630 image remain pending.

Use one H1 per page, H2 for sections, H3 for cards/sessions, descriptive alt text for real images, and captions/transcripts for real videos.

## Meta Pixel installation

The local prototype logs events only. It contains no Pixel ID and no `fbq` call.

For the final Framer site:

1. Create or select the production Pixel in Meta Events Manager.
2. Open Framer Site Settings → Custom Code.
3. Install Meta’s unmodified base code **once, at the start of the site-wide `<head>`**.
4. Never install the base code in individual pages, CMS templates, components, embeds, or overrides.
5. Do not manually duplicate `PageView`; the base code owns it.
6. Keep the production Pixel ID in Framer/site settings, not in component source or documentation.
7. Add one centralized event bridge after the base code.
8. Verify one Pixel and one base `PageView` with Meta Pixel Helper and Events Manager.

Installing the base Pixel more than once will duplicate `PageView` and may duplicate conversions.

## Central tracking bridge example

Use this as a pattern; do not add a Pixel ID to it.

```ts
type MeskaEvent =
  | "ViewContent"
  | "Lead"
  | "InitiateCheckout"
  | "Purchase"
  | "CTAOpenForm"
  | "PricingView"
  | "FormStart"
  | "FormError"
  | "LeadThankYouView"
  | "VideoPlay"

const standard = new Set(["ViewContent", "Lead", "InitiateCheckout", "Purchase"])
const pii = new Set([
  "name", "fullname", "email", "phone", "mobile", "job", "company", "website",
])

export function trackEvent(
  event: MeskaEvent,
  parameters: Record<string, string | number | boolean> = {},
  eventId?: string,
) {
  const safe = Object.fromEntries(
    Object.entries(parameters).filter(([key]) => !pii.has(key.toLowerCase())),
  )
  if (typeof window === "undefined" || typeof window.fbq !== "function") return
  window.fbq(
    standard.has(event) ? "track" : "trackCustom",
    event,
    safe,
    eventId ? { eventID: eventId } : undefined,
  )
}
```

Do not send full name, email, mobile, job, company, company website, free text, or unrestricted personal information in event parameters.

## Stable Framer tracking names

| Component/layer | `tracking_id` |
|---|---|
| Landing meaningful view | `diploma_landing_view` |
| Header application CTA | `header_start_application` |
| Hero application CTA | `hero_start_application` |
| Primary form | `primary_interest_form` |
| Primary submit | `primary_interest_form_submit` |
| Mid-page CTA | `midpage_start_application` |
| Sticky CTA | `sticky_mobile_start_application` |
| Modal form | `modal_interest_form` |
| Modal submit | `modal_interest_form_submit` |
| Final form | `final_interest_form` |
| Final submit | `final_interest_form_submit` |
| Thank-you header | `header_choose_diploma` |
| Thank-you meaningful view | `lead_thank_you_view` |
| Offline checkout | `offline_shopify_checkout` |
| Online checkout | `online_shopify_checkout` |
| Landing main video | `main_diploma_video` |
| Participant video | `thank_you_testimonial_video` |
| Session snippets | `session_snippet_1` through `session_snippet_3` |

## Event-tracking matrix

Approved consent setting: marketing events remain enabled and are not blocked by an on-page consent gate. The production owner must still approve required disclosures and ensure the final implementation follows Meta’s terms and applicable launch requirements.

| Business action | Meta event | Trigger condition | Component/element | Parameters | Role | Destination | Consent | Duplicate prevention | Testing |
|---|---|---|---|---|---|---|---|---|---|
| Base site view | `PageView` | Meta base code loads | Site `<head>` | Meta defaults only | Base | Current page | Always enabled per project setting | Install base code once; never send manually | Pixel Helper shows one base event |
| Meaningful diploma view | `ViewContent` | Landing client render after attribution capture | `LP/Page` / `diploma_landing_view` | `tracking_id`, `content_name`, `content_category` | Secondary optimization | Stay on page | Same | Session once-key | Reload in same session; expect one |
| Header/hero application intent | `CTAOpenForm` custom | Intentional CTA click | Named header/hero layers | `tracking_id`, `cta_location` | Behavioral | `#apply` | Same | Debounce accidental double-click only | Verify exact ID and zero `Lead` |
| Mid/sticky application intent | `CTAOpenForm` custom | Intentional overlay-open click | Named mid/sticky layers | `tracking_id`, `cta_location` | Behavioral | Form overlay | Same | Overlay state plus short click lock | One event; zero `Lead` |
| Pricing exposure | `PricingView` custom | At least 35% of pricing/form enters view | Primary/final pricing layer | `tracking_id`, `form_location`, `variant` | Behavioral | Stay on page | Same | Once per placement/session | Scroll past twice; expect one per placement |
| Form engagement | `FormStart` custom | First focus inside a form instance | Named form | `tracking_id`, `form_location`, `variant` | Behavioral | Stay on form | Same | Per-instance started flag | Focus several fields; expect one |
| Validation failure | `FormError` custom | Invalid submit | Named submit | `tracking_id`, `form_location`, `error_type`, `invalid_field_count` | Diagnostic | First invalid field | Same | Validation fingerprint/cooldown | Empty submit; no conversion |
| Lead captured | `Lead` standard | Thank-you loads with a valid pending token created after confirmed capture | `TY/LeadTracker` | `tracking_id`, `variant`, `wave`, `form_location`, approved UTMs, `event_id` | **Primary conversion** | `/thank-you` | Same | Unique event ID; session once-key; consume token | Valid capture then redirect; reload stays one |
| Thank-you view | `LeadThankYouView` custom | Thank-you client render | `TY/Page` / `lead_thank_you_view` | `tracking_id`, `has_submission_state` | Diagnostic | Stay on page | Same | Session once-key | Test direct and post-submit visits |
| Checkout-section intent | `PricingView` custom | Choose Diploma click | `header_choose_diploma` | `tracking_id`, `cta_location` | Behavioral | `#checkout` | Same | Short double-click debounce | Verify anchor and one custom event |
| Real checkout begins | `InitiateCheckout` standard | Intentional click with a non-empty final Shopify URL | Named offline/online button | `tracking_id`, `variant`, numeric `value`, `currency`, `event_id` | Funnel conversion | Respective Shopify checkout | Same | Disable during navigation; unique event ID | Test each final URL and exact parameters |
| Checkout URL missing | Local diagnostic only | Checkout click while URL empty | Named checkout button | `tracking_id`, `variant` | Not a conversion | Stay on page | N/A | Pending component state | Zero `InitiateCheckout` |
| Confirmed payment | `Purchase` standard | Verified Shopify order confirmation/webhook only | Shopify order pipeline | `value`, `currency`, safe order/content IDs, `event_id` | Down-funnel primary | Shopify confirmation | Shopify policy | Stable order-based event ID; browser/server dedupe | Place test order; one Purchase |
| Future enrollment milestone | `CompleteRegistration` standard | Only if Meska later defines a distinct genuine post-payment registration | Future system | Approved non-PII parameters, `event_id` | Future | Future success state | Production policy | Stable registration ID | Do not enable until defined |
| Real video playback | `VideoPlay` custom | First actual `play` event, not placeholder/thumbnail click | Named video | `tracking_id`, `video_location` | Behavioral | Stay on page | Same | Once per video/session | Play/pause/replay; expect one |

Never fire `Lead`, `CompleteRegistration`, or `Purchase` from an ordinary CTA click. Do not fire `Lead` and `CompleteRegistration` for the same milestone unless Meska explicitly defines separate approved stages.

## UTM handling

1. Capture `utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, and `fbclid` from the landing URL.
2. Store the first/current approved values in one namespaced `sessionStorage` object.
3. Include them as hidden form fields when supported so the future lead record retains attribution.
4. Preserve them through the confirmed-success redirect and thank-you route.
5. Merge approved parameters into Shopify URLs with `URLSearchParams`; do not overwrite existing checkout query parameters.
6. Pass only approved attribution fields to Meta. Never mix form PII into events or URLs.
7. Keep session-scoped attribution unless a different documented window is approved.

## Duplicate-prevention rules

- Install Meta’s base code once site-wide and never send a second manual `PageView`.
- Store once-only view events under stable session keys.
- Create one UUID event ID for each confirmed lead and real checkout start.
- Create the pending lead token only after durable form capture.
- Consume the pending token immediately after `Lead` fires.
- Disable submit and checkout controls while capture/navigation is processing.
- If future Pixel and CAPI both send the same event, use the same event name and event ID.
- Derive `Purchase` event IDs from stable Shopify order IDs.
- Do not count responsive remounts, component remounts, route transitions, reloads, or repeated double-clicks as new conversions.

## Meta Events Manager testing checklist

- [ ] Base code appears once at the start of the rendered site-wide `<head>`.
- [ ] Pixel Helper reports one Pixel and one base `PageView`.
- [ ] `ViewContent` follows the once-per-session rule.
- [ ] CTA clicks never fire `Lead`.
- [ ] Empty/invalid form fires `FormError`, not a conversion.
- [ ] Confirmed form capture redirects and fires exactly one `Lead`.
- [ ] Thank-you reload does not fire a second `Lead`.
- [ ] Direct thank-you visit does not fire `Lead`.
- [ ] Offline/online checkout events contain correct variant, numeric value, and `EGP` currency.
- [ ] Empty checkout URL fires zero `InitiateCheckout` events.
- [ ] `Purchase` fires only after verified Shopify payment.
- [ ] No event contains name, email, mobile, job, company, website, or free text.
- [ ] UTMs survive landing → lead capture → thank-you and, when supported, checkout.
- [ ] Browser/server events deduplicate when CAPI is later enabled.

## Pixel verification checklist

- [ ] Correct production domain and Pixel selected.
- [ ] Base code installed site-wide once, not in components/pages/embeds.
- [ ] No duplicate-Pixel or duplicate-base-code warning.
- [ ] Test Events displays the intended URL, event name, tracking ID, and safe parameters.
- [ ] Campaign-optimization events are distinct from diagnostic custom events.
- [ ] Event quality is reviewed after form and Shopify integrations are live.
- [ ] Ad blockers are disabled during Events Manager Test Events QA.

## Future Conversions API recommendation

Add CAPI only after the form capture and Shopify systems can send verified server events. Begin with `Lead` after durable form capture and `Purchase` after verified payment. Keep secrets server-side, validate webhooks, share the browser event ID with the corresponding server event, and use the same event name for deduplication. Never use CAPI to send unrestricted personal information or bypass platform requirements.

## Final Framer QA checklist

- [ ] Compare the native build with the local live routes and saved review screenshots.
- [ ] Validate 360, 390, 768, 1024, and 1440px widths.
- [ ] Confirm no horizontal overflow.
- [ ] Test anchors, dropdown/price sync, all required fields, validation focus, overlay close/Escape/focus return, sticky CTA, both carousels, FAQ, and checkout behavior.
- [ ] Confirm every event’s trigger and duplicate-prevention rule.
- [ ] Confirm accessibility labels, heading order, focus rings, touch targets, alt text, captions, and reduced motion.
- [ ] Compress and lazy-load final media; supply explicit dimensions/posters.
- [ ] Confirm landing canonical/OG metadata and thank-you `noindex`.
- [ ] Record every intentional difference from the approved local implementation.
- [ ] Do not publish until the user explicitly approves publishing.

