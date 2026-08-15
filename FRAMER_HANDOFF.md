# Meska AI — Native Framer Handoff

Current implementation reference · 15 August 2026

This document is the authoritative Framer recreation specification for the current local prototype. Read `NEXT_CHAT_HANDOFF.md` and `PROJECT_HANDOFF.md` first for the accepted cross-chat baseline, repository state, approved decisions, run instructions, and unfinished work. The layout amendments are complete; do not repeat or undo them. Recreate the approved page with native Framer elements; do not import screenshots as the page.

## Journey and final section order

The landing page has one conversion goal: **Start Application**. The interest form is not a payment form. After durable lead capture, redirect to the thank-you page. Payment begins only from the thank-you page through the respective Shopify checkout.

Landing page:

1. `Global/Header/Pill`
2. `LP/Hero/Copy`
3. `LP/PrimaryConversion`, containing `Media/MainDiplomaVideo`, `Pricing/DynamicCard`, and one `Form/InterestCapture`
4. `LP/ImpactStrip`
5. `LP/Outcomes`
6. `LP/OrganizationLogoRail`
7. `LP/SyllabusDisclosure`
8. `LP/TestimonialCarousel`
9. `Global/Footer`
10. `Global/StickyApplicationCTA` on mobile after the full hero/conversion cluster and before the footer
11. `Form/ApplicationModal` overlay used only by the sticky CTA

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
| Landing hero section | `LP/Hero` | Vertical Stack with compact `Hero/Copy` above `LP/PrimaryConversion`. No orbit graphic or hero CTA row. |
| `DiplomaVideo` | `Media/MainDiplomaVideo` | Native 16:9 Video with Framer-hosted source/poster, visible controls, inline playback, and no autoplay. |
| `VideoPlaceholder` | `Media/VideoFrame` | Reusable placeholder frame for still-pending thank-you media only. |
| `LeadCapture` | `Form/InterestCapture` | One responsive primary instance plus the intentional overlay instance; do not duplicate the form for breakpoints. |
| Price panel | `Pricing/DynamicCard` | `Offline` and `Online` variants. |
| `StatsStrip` | `LP/ImpactStrip` | Blue section Stack plus three metric cells. |
| `OutcomesSection` | `LP/Outcomes` | Four compact native accordion/disclosure instances in a dense grid. |
| `OrganizationLogoRail` | `LP/OrganizationLogoGrid` | Four ordered 2×2 swipe pages on mobile; two pages visible on tablet; static 8×2 grid on desktop. Equal contained `Logo/Cell` instances, no duplicated loop set. |
| `LeadModal` | `Form/ApplicationModal` | Framer Overlay; full-screen sheet on mobile. |
| `SyllabusSection` | `LP/SyllabusDisclosure` | One collapsed native Accordion containing nine compact `Syllabus/Row` instances. |
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
| `Radius/Large` | `36px` |
| `Radius/Pill` | `999px` |
| `Shadow/Small` | `0 10px 40px rgba(0,17,28,.08)` |
| `Shadow/Blue` | `0 20px 60px rgba(10,114,243,.24)` |
| `Content/Max` | `1280px` |
| `Space/1` … `Space/10` | `4, 8, 12, 16, 20, 24, 32, 40, 48, 64px` |
| `Section/Vertical` | `40px` mobile; `48px` tablet; `64px` desktop |
| `Canvas/Desktop` | `32px` side gutter, capped by `Content/Max` |
| `Canvas/Tablet` | `24px` side gutter |
| `Canvas/Mobile` | `16px` side gutter |
| `Touch/Minimum` | `44px` |
| `Form/Control` | `50px` |

The primary conversion cluster stacks video → pricing → form below 960px. From 960px it uses `46% / 54%`: video above pricing on the left, the one primary form on the right, with aligned top edges. Do not duplicate the form for breakpoints.

## Fonts and typography

- Family: Inter, then system sans-serif fallbacks. The local prototype does not make a remote font request.
- Body: 16px/1.55 at all landing breakpoints.
- Landing H1: `clamp(40px, 10.5vw, 44px)` mobile at 1.02 line height; `clamp(54px, 7vw, 72px)` from 700px; capped at `88px` from 1200px.
- Thank-you H1: `clamp(58px, 6.8vw, 115px)` desktop; `clamp(54px, 16vw, 75px)` mobile.
- Section H2: `clamp(26px, 7vw, 30px)` mobile at 1.15; `clamp(34px, 4.3vw, 44px)` from 700px; capped at `52px` from 1200px.
- Hero accent: 20px/1.18 mobile; `clamp(25px, 3.2vw, 32px)` from 700px; up to 38px on desktop.
- Eyebrow: 12px/1.4, uppercase with controlled tracking.
- Form labels: 13px/1.35; supporting text: 12–14px with at least 1.4 line height.
- Headings use measured negative tracking, never clipped line boxes; hierarchy comes from size, weight, color, and spacing rather than maximum weight everywhere.

Use fluid sizing and copy-frame widths rather than hard-coded `<br>` elements.

## Mobile-first layout rules

### Base 320–699px

- Header uses 16px page gutters, a 56px pill, and a 44px CTA.
- Hero uses a vertical Stack: comfortable copy → uncropped 16:9 video → pricing → the one primary form.
- The decorative orbit graphic, hero CTA row, curriculum link, duplicate details bar, mid-page CTA, and second full form do not exist.
- The main video fills the content width, keeps its complete 16:9 frame, and uses native controls.
- Pricing uses a readable two-column fact grid. Location spans both columns. The empty `Schedule / To be confirmed` fact is intentionally absent.
- The primary form is one column with 50px controls. Email/mobile and job/company remain separate rows on mobile.
- Modal becomes a 100dvh sheet and shows the form only.
- Impact is a readable 2×2 grid. Outcomes use one-column accordion rows with descriptions collapsed initially.
- Organization logos use four manual 2×2 swipe pages; no autoplay, looping duplication, or partially clipped cards.
- Curriculum is one collapsed Accordion. Its nine rows remain accessible; the graduation project gets an accent border, tint, and badge when expanded.
- Testimonial cards occupy 100% of the track width; one card is visible and swiped at a time. Images remain contained with name and caption visible.
- Sticky CTA appears only after the full hero/conversion cluster leaves view and hides when the footer enters view.
- Corrected 390×844 reference: 4,745px / 5.622 viewport heights collapsed; 5,928px / 7.024 with curriculum fully expanded. These are measurement records, not height caps.

### Tablet 700–959px

- 24px page gutters.
- Headline and subtitle remain above an intentional stacked conversion layout at 768px.
- Video, pricing, and the one form use full available width. Form field pairs become two columns because each input remains comfortably usable.
- Outcomes use two columns; logo rail shows two 2×2 pages/four columns at once; testimonials show two cards.
- Thank-you checkout cards remain stacked.

### Laptop 960–1199px

- Hero copy remains above the conversion row.
- Video/pricing and form use a top-aligned `46% / 54%` row; no duplicate responsive form is created.
- Outcomes and instructors use two columns; organization logos remain two rows.

### Desktop 1200–1920px+

- Center the 1280px max-width shell.
- Hero copy remains above the `46% / 54%` video/pricing + form row.
- Outcomes use four compact disclosure cells; organization logos use a static 8×2 grid; testimonials show three cards.
- Checkout uses two equal cards on the thank-you page.

## Interaction and animation specifications

- Primary button hover: 180ms ease, -2px vertical lift, darker blue, stronger blue shadow.
- Internal anchor scroll: smooth unless reduced motion is requested.
- Application overlay: focus trap, Escape close, close button, backdrop, and focus restoration. Full-screen on mobile.
- Sticky CTA: `IntersectionObserver` driven by hero and footer visibility, not an arbitrary scroll distance.
- Outcomes and curriculum: native keyboard-operable disclosure behavior. They do not emit CTA or conversion events.
- Testimonial carousel: horizontal drag/scroll plus previous/next buttons; no autoplay.
- Organization-logo grid: manual native horizontal scrolling with page snap below 1200px; static 8×2 grid from 1200px. No autoplay, duplicates, links, tracking, or original-color hover.
- Session snippets: one portrait video at a time, up/down controls, looping index; no autoplay.
- FAQ: native keyboard-operable summary; first item may start open.
- `prefers-reduced-motion: reduce`: remove smooth scrolling and make transitions/animations effectively instant.
- Final videos must not autoplay simultaneously. Lazy-load below-the-fold media.

## Native Framer recreation instructions

### Landing page

1. Create an English page using a white root vertical Stack and the tokens above.
2. Build the pill header with the approved SVG logo when supplied. Link its CTA to `#apply`.
3. Build `LP/Hero` as compact copy above `LP/PrimaryConversion`; do not recreate the removed orbit visual or hero buttons.
4. Upload VID-01 and its poster to Framer, then add the native 16:9 video with visible controls, inline playback, `preload="metadata"` or Framer's nearest conservative setting, and no autoplay, caption, transcript, link, or tracking.
5. Build `LP/PrimaryConversion` from native Stacks/Grid: mobile and 768px tablet use video → pricing → form; 960px+ uses video+pricing left and form right. Do not duplicate the form for responsive variants.
6. Build `Pricing/DynamicCard` with `Offline` and `Online` variants. Keep price/date/format/location synchronized here; do not restore the removed Schedule placeholder or the removed details bar.
7. Build the native form with exactly these required field names: `fullName`, `email`, `mobile`, `diploma`, `job`, `company`, `website`.
8. Bind the diploma select to the pricing-card variant and keep its price, date, format, and venue synchronized.
9. Provide explicit inline errors and focus the first invalid field.
10. Connect the approved Framer form/webhook to the future Google Sheet. Redirect only after the provider confirms durable capture.
11. Preserve attribution through the success redirect to `/thank-you?diploma={value}`.
12. Build metrics, compact outcome disclosures, the approved sixteen-logo rail, collapsed curriculum disclosure, and nine-testimonial carousel as reusable components or CMS collections.
13. Use one shared application overlay instance for the sticky CTA. Do not restore removed mid-page promotional CTAs.
14. Keep the footer immediately after testimonials; do not add a second application form.

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
| Landing video | VID-01 implemented locally at 1920×1080 with a 1200×675 poster | Upload video and poster to Framer; use the Framer-hosted URLs. No caption/transcript/tracking requested. |
| Organization logos | 16 deduplicated local originals plus monochrome presentation copies | Upload all 16 presentation copies to Framer and rebuild the approved paged grid. Relationship: organizations represented by professionals who learned AI with Meska. |
| Testimonials | 9 approved originals plus optimized WebP presentation copies | Upload all 9 optimized files to Framer; preserve order, natural aspect ratios, names, captions, and alt text. |
| Participant video | Placeholder | Video, poster, captions, transcript. |
| Session snippets | 3 portrait placeholders | Compressed clips and poster frames. |
| Instructor photos | 4 initials placeholders | Approved portraits and alt text. |
| Open Graph image | Missing | Approved 1200×630 image. |
| Shopify links | Missing | Offline and online destinations. |
| Lead destination | Missing | Framer form/webhook/Google Sheet integration. |

Use SVG for logos and AVIF/WebP for raster images. Provide responsive sizes and dimensions, lazy-load below-the-fold media, and avoid cumulative layout shift.

`MEDIA_ASSET_MANIFEST.md` is the authoritative complete inventory for VID-01, IMG-01 through IMG-09, and the selected LOGO records. It contains every original source URL or supplied filename, local original and presentation path, file type, dimensions, size, exact order, alt text, crop behavior, authorization, tracking requirement, and Framer-upload status.

### Approved landing-media copy and behavior

- Logo eyebrow: **Our Impact**.
- Logo heading: **Professionals from Egypt’s Leading Corporations Learn AI with Meska**.
- Logo supporting copy: **Professionals across these organizations have joined Meska’s AI learning experiences.**
- Do not call the organizations partners, clients, sponsors, certifications, or corporate-training customers.
- Logo presentation color: `Color/MeskaBlue` (`#0A72F3`) with consistent opacity on white/paper cells.
- Testimonial order: Ali Elsheikh, Eslam Momtaz, Eslam Osman, Amr Mosallam, Ibrahim Mubarak, Reem Fahim, Ali Shaker, Dr. Khaled Said Salem, Kholoud Samy.
- Testimonial caption: **AI Copilot Diploma graduate**.
- Testimonials and logos have no click destinations or tracking.
- The landing video has no playback tracking hooks.

### Framer media upload procedure

1. Upload the local VID-01 MP4 and WebP poster directly to Framer.
2. Upload the nine optimized testimonial WebP files to Framer in IMG-01 through IMG-09 order.
3. Upload the sixteen monochrome logo presentation assets. Preserve the original logo files separately for future reprocessing.
4. Replace every local `/media/...` value with the corresponding Framer-hosted URL in the content/CMS records.
5. Set explicit width/height or aspect ratio on every Frame before assigning media.
6. Rebuild four ordered 2×2 logo pages on mobile, expose two pages/four columns at tablet widths, and switch to a static 8×2 grid on desktop. Use equal cells and contained images.
7. Keep only one semantic instance of every logo; do not create seamless-loop duplicates or automatic motion.
8. Rebuild the three/two/one-card testimonial behavior with drag/swipe and no autoplay. Use natural responsive image height or an equivalent non-cropping contained frame.
9. Verify that the final published network requests contain no essential third-party media URLs.

## CTA destinations

| Element | Current prototype | Final Framer destination |
|---|---|---|
| Header Start Application | `#apply` | Primary application form. |
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
| Primary form | `primary_interest_form` |
| Primary submit | `primary_interest_form_submit` |
| Sticky CTA | `sticky_mobile_start_application` |
| Modal form | `modal_interest_form` |
| Modal submit | `modal_interest_form_submit` |
| Thank-you header | `header_choose_diploma` |
| Thank-you meaningful view | `lead_thank_you_view` |
| Offline checkout | `offline_shopify_checkout` |
| Online checkout | `online_shopify_checkout` |
| Landing main video | No tracking ID or playback events approved |
| Participant video | `thank_you_testimonial_video` |
| Session snippets | `session_snippet_1` through `session_snippet_3` |

## Event-tracking matrix

Approved consent setting: marketing events remain enabled and are not blocked by an on-page consent gate. The production owner must still approve required disclosures and ensure the final implementation follows Meta’s terms and applicable launch requirements.

| Business action | Meta event | Trigger condition | Component/element | Parameters | Role | Destination | Consent | Duplicate prevention | Testing |
|---|---|---|---|---|---|---|---|---|---|
| Base site view | `PageView` | Meta base code loads | Site `<head>` | Meta defaults only | Base | Current page | Always enabled per project setting | Install base code once; never send manually | Pixel Helper shows one base event |
| Meaningful diploma view | `ViewContent` | Landing client render after attribution capture | `LP/Page` / `diploma_landing_view` | `tracking_id`, `content_name`, `content_category` | Secondary optimization | Stay on page | Same | Session once-key | Reload in same session; expect one |
| Header application intent | `CTAOpenForm` custom | Intentional header CTA click | `header_start_application` | `tracking_id`, `cta_location` | Behavioral | `#apply` | Same | Debounce accidental double-click only | Verify exact ID and zero `Lead` |
| Sticky application intent | `CTAOpenForm` custom | Intentional sticky CTA click | `sticky_mobile_start_application` | `tracking_id`, `cta_location` | Behavioral | Form overlay | Same | Overlay state plus short click lock | One event; zero `Lead` |
| Pricing exposure | `PricingView` custom | At least 35% of the primary pricing/form cluster enters view | Primary pricing layer | `tracking_id`, `form_location`, `variant` | Behavioral | Stay on page | Same | Once per session | Scroll past twice; expect one |
| Form engagement | `FormStart` custom | First focus inside a form instance | Named form | `tracking_id`, `form_location`, `variant` | Behavioral | Stay on form | Same | Per-instance started flag | Focus several fields; expect one |
| Validation failure | `FormError` custom | Invalid submit | Named submit | `tracking_id`, `form_location`, `error_type`, `invalid_field_count` | Diagnostic | First invalid field | Same | Validation fingerprint/cooldown | Empty submit; no conversion |
| Lead captured | `Lead` standard | Thank-you loads with a valid pending token created after confirmed capture | `TY/LeadTracker` | `tracking_id`, `variant`, `wave`, `form_location`, approved UTMs, `event_id` | **Primary conversion** | `/thank-you` | Same | Unique event ID; session once-key; consume token | Valid capture then redirect; reload stays one |
| Thank-you view | `LeadThankYouView` custom | Thank-you client render | `TY/Page` / `lead_thank_you_view` | `tracking_id`, `has_submission_state` | Diagnostic | Stay on page | Same | Session once-key | Test direct and post-submit visits |
| Checkout-section intent | `PricingView` custom | Choose Diploma click | `header_choose_diploma` | `tracking_id`, `cta_location` | Behavioral | `#checkout` | Same | Short double-click debounce | Verify anchor and one custom event |
| Real checkout begins | `InitiateCheckout` standard | Intentional click with a non-empty final Shopify URL | Named offline/online button | `tracking_id`, `variant`, numeric `value`, `currency`, `event_id` | Funnel conversion | Respective Shopify checkout | Same | Disable during navigation; unique event ID | Test each final URL and exact parameters |
| Checkout URL missing | Local diagnostic only | Checkout click while URL empty | Named checkout button | `tracking_id`, `variant` | Not a conversion | Stay on page | N/A | Pending component state | Zero `InitiateCheckout` |
| Confirmed payment | `Purchase` standard | Verified Shopify order confirmation/webhook only | Shopify order pipeline | `value`, `currency`, safe order/content IDs, `event_id` | Down-funnel primary | Shopify confirmation | Shopify policy | Stable order-based event ID; browser/server dedupe | Place test order; one Purchase |
| Future enrollment milestone | `CompleteRegistration` standard | Only if Meska later defines a distinct genuine post-payment registration | Future system | Approved non-PII parameters, `event_id` | Future | Future success state | Production policy | Stable registration ID | Do not enable until defined |
| Future video playback | Not approved | Do not track the landing video. Add a future playback event only after Meska approves a separate tracking specification. | Future named video | Pending | Behavioral | Stay on page | Pending | Pending | No landing-video event should appear |

Never fire `Lead`, `CompleteRegistration`, or `Purchase` from an ordinary CTA click. Do not fire `Lead` and `CompleteRegistration` for the same milestone unless Meska explicitly defines separate approved stages.

Removed tracking sources: `hero_start_application`, `midpage_start_application`, `final_interest_form`, and `final_interest_form_submit`. Their visual controls were intentionally removed in the compact-layout amendment. Do not rebind these IDs to another element, and do not restore their events through hidden responsive layers.

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

## Measured corrected-layout reference

These browser measurements were captured after the corrective visual-quality pass, with outcomes and curriculum collapsed. Match the visual relationships and responsive behavior; do not force Framer to an arbitrary viewport-height target.

| Viewport | Viewport height | Page height | Ratio |
|---:|---:|---:|---:|
| 320px | 568px | 4,767px | 8.393 |
| 360px | 800px | 4,737px | 5.921 |
| 390px | 844px | 4,745px | 5.622 |
| 430px | 932px | 4,857px | 5.211 |
| 768px | 1,024px | 4,390px | 4.287 |
| 1024px | 768px | 4,018px | 5.232 |
| 1440px | 900px | 4,075px | 4.528 |
| 1920px | 1,080px | 4,127px | 3.821 |

At 390px, expanding all nine curriculum rows produces 5,928px / 7.024 viewport heights. The first fold contains the full header, hero copy, and 16:9 video; pricing starts immediately below. The 768px layout stacks the conversion cluster intentionally, while 1024px and above use the top-aligned two-column row. Screenshots are stored under `outputs/layout-validation/`.

## Final Framer QA checklist

- [ ] Compare the native build with the local live routes and saved review screenshots.
- [ ] Validate 320, 360, 390, 430, 768, 1024, 1440, and 1920px widths.
- [ ] Confirm no horizontal overflow.
- [ ] Record the 390px collapsed and expanded page heights without imposing a fixed viewport-height cap.
- [ ] Confirm the first mobile fold includes the full header, hero copy, and uncropped 16:9 video, with pricing immediately following.
- [ ] Confirm 768px uses the dedicated stacked tablet layout; confirm video/pricing and the same form share a top-aligned row at 1024px and desktop.
- [ ] Confirm the removed hero CTAs, orbit graphic, details bar, mid-page CTAs, and duplicate final form have not returned.
- [ ] Test anchors, dropdown/price sync, all required fields, validation focus, outcome/curriculum disclosures, overlay close/Escape/focus return, sticky CTA, both carousels, FAQ, and checkout behavior.
- [ ] Confirm every event’s trigger and duplicate-prevention rule.
- [ ] Confirm accessibility labels, heading order, focus rings, touch targets, alt text, captions, and reduced motion.
- [ ] Compress and lazy-load final media; supply explicit dimensions/posters.
- [ ] Upload VID-01, its poster, all nine testimonial WebPs, and all sixteen logo presentation files to Framer.
- [ ] Confirm no essential image, video, poster, or logo remains externally hotlinked.
- [ ] Confirm the landing video emits no Meta or custom playback events.
- [ ] Confirm exactly 16 semantic logo instances, correct ordering, contained artwork, manual paging below 1200px, and a static 8×2 desktop grid.
- [ ] Confirm landing canonical/OG metadata and thank-you `noindex`.
- [ ] Record every intentional difference from the approved local implementation.
- [ ] Do not publish until the user explicitly approves publishing.
