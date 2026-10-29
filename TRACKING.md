# Tracking inventory

Meta Pixel ID: `1982493002344234`

The Pixel is initialized once by `app/components/MetaPixel.tsx`. `PageView` is deduplicated by pathname for the current browser page lifecycle. All other events flow through `app/lib/tracking.ts`, which retains the local `window.__MESKA_EVENTS__` evidence log, filters PII-shaped parameter keys, and forwards events to Meta only after initialization.

Meta forwarding is enabled only on the production hostname `diploma.meska.ai`. Vercel Preview and localhost sessions retain the PII-free diagnostic evidence log without sending synthetic `PageView`, `Lead`, or other test events to the live dataset.

| Event | Trigger | Component/page | Meta call | Expected behavior |
| --- | --- | --- | --- | --- |
| `PageView` | Initial Pixel load and changed App Router pathname | `MetaPixel`, all routes | `track` | Once for each pathname navigation; never duplicated by rerender/script reload. |
| `ViewContent` | First landing render per session | `LandingPage`, `/` | `track` | Standard event; diploma/category plus value, `EGP`, `content_ids` (Shopify variant) and `content_type: product` of the format shown first (`?diploma=online` → Online, otherwise Offline). |
| `CTAOpenForm` | Header or sticky free-guide activation | `SiteHeader`, `StickyMobileCTA`, `/` | `trackCustom` | Diagnostic interaction, never `Lead`. |
| `PricingView` | Primary price/form cluster becomes visible, or thank-you header Choose Diploma is clicked | `LeadCapture`, `SiteHeader` | `trackCustom` | Deduplicated visibility event for the primary cluster. |
| `FormStart` | First focus within the interest form | `LeadCapture`, `/` | `trackCustom` | Once per mounted form; no field value. |
| `FormError` | Validation or format synchronization failure | `LeadCapture`, `/` | `trackCustom` | Error type/count plus `error_fields` (comma-separated field names, e.g. `mobile,linkedin`); never a field value. |
| `FormSubmit` | Valid local submit intent before qualified transition | `LeadCapture`, `/` | `trackCustom` | Diagnostic only. It is not a Meta `Lead`. |
| `Lead` | A persisted Diploma enquiry token is consumed after navigation | `ThankYouLeadTracker`, `/thank-you` | `track` | Exactly one standard conversion per server-confirmed Supabase enquiry event ID. Validation failures, API/persistence failures, repeated clicks, and direct visits do not fire it. Carries value, `EGP`, `content_ids` and `content_type` identical to the server `Lead`. |
| `LeadThankYouView` | Thank-you route loads | `ThankYouLeadTracker`, `/thank-you` | `trackCustom` | Records whether qualified submission state existed; not a conversion. |
| `FormatSelect` | Changed landing or checkout format by pointer/keyboard | `LeadCapture`, `CheckoutSection` | `trackCustom` | Only after a changed selection; includes previous/new variant and source. |
| `CapabilitySelect` | Changed skills-matrix selection | `SkillsBusinessValueSection` | `trackCustom` | Only after a changed selection. |
| `InitiateCheckout` | Matching Offline/Online Shopify button activation | `CheckoutSection`, `/thank-you` | `track` | Standard event with matching value, EGP currency, variant, `content_ids` (Shopify variant), `content_type: product`, and event ID. |
| `VideoPlay` | First play of free-guide, graduation, session, or testimonial video | Shared Stream player consumers | `trackCustom` | Deduplicated per tracked video and page context. Main autoplay overview is intentionally untracked. |
| `MediaPlaceholderClick` | Dormant placeholder helper activation | `VideoPlaceholder` (not mounted) | `trackCustom` | Dormant unless the helper is mounted later. |
| `CheckoutLinkPending` | Dormant/pending checkout helper | Not mounted | `trackCustom` | Dormant. |

`Purchase` is not implemented in this site. It belongs only to confirmed Shopify payment evidence and reaches the same dataset from Shopify's own Meta integration. The Supabase lead route and the server-side `Lead` are live in production (28 Oct 2026).

## Product fields (value and product ID)

`ViewContent`, `Lead` (browser **and** server) and `InitiateCheckout` carry the same product fields, built by `app/lib/metaProduct.ts` from `app/content.ts`:

- `value` = price of the selected format (`priceValue`), `currency: "EGP"`;
- `content_ids` = `[Shopify variant ID]` taken from the format's `checkoutUrl` (`/cart/<variant>:1`), `content_type: "product"`.

The browser `Lead` reads them from the pending-lead entry saved at submit; the server `Lead` resolves them from `diploma_slug` (and the stored `programme_price_value`). Both copies of `Lead` therefore match, whichever copy Meta keeps after deduplication — except for a page opened before a content deploy (logged as `content_drift`), where the browser copy carries the old page's values. Changing a checkout link in `app/content.ts` changes the product ID everywhere at once.

## Script loading

Meta's `fbevents.js` is injected by `MetaPixel` only when the hostname is `diploma.meska.ai`; Vercel previews and local builds never download it. The no-JavaScript `PageView` image renders only in Production builds (`VERCEL_ENV === "production"`).

## Advanced matching and privacy signals (decision 29 Oct 2026)

- The dataset has Meta's **automatic advanced matching** switched on (Events Manager → dataset settings). Meta's own pixel script hashes email, phone and name typed into forms on this site and sends only the hashes to improve matching. This is deliberate. Our own event parameters still never contain personal data.
- Do-Not-Track / Global Privacy Control browser signals do **not** suppress tracking on any meska landing page (Diploma, Claude, Copilot, HRLAB behave the same).
- Every active Meta ad set optimises for this dataset's `Lead` (directly or through a per-product custom conversion filtered by domain), so the `Lead` name, event ID and trigger must not change.

## Change rule

Do not remove, rename, disable, relocate, or alter these events or their triggers without explicit approval. Any change to CTAs, buttons, links, forms, navigation, thank-you flows, or checkout flows must test the corresponding event, PII filtering, event-ID deduplication, and `PageView` behavior.


## Server-side Lead (Meta Conversions API)

`POST /api/leads` sends a server `Lead` to Pixel `1982493002344234` after the enquiry is saved in Supabase. Its `event_id` is the enquiry `request_id`, which is the same value the browser `Lead` uses as `eventID` on `/thank-you`, so Meta deduplicates the pair and counts each enquiry once.

- `user_data`: SHA-256 hashed email, phone (digits with country code), first and last name; `fbp`/`fbc` (from the `_fbp`/`_fbc` cookies, or `fbc` derived from `fbclid`), client IP and user agent. Raw IP is removed from Supabase after 7 days.
- `custom_data`: `currency: "EGP"`, `value` = programme price, `content_name` = `offline|online`, `content_category: "professional_diploma"`, `content_ids: [Shopify variant]`, `content_type: "product"` (same as the browser `Lead`).
- First attempt runs right after the lead is saved (Production only); failures are retried by `/api/cron/lead-sync` (every 5 minutes) on a schedule by lead age — attempts 2–3 within minutes, then two each at 1 h, 6 h, 24 h and 72 h (10 in total) — and given up (`failed`, `meta_event_too_old`) once older than 7 days. Status is stored on the lead (`capi_status`, `capi_attempts`, `capi_sent_at`, `capi_error`).
- Requires `META_CONVERSIONS_TOKEN` (Production). Until it is set the server Lead is skipped and leads stay `pending`; they are sent automatically once the token exists (within Meta's 7-day window). Optional: `META_TEST_EVENT_CODE` (used outside Production only), `META_GRAPH_API_VERSION` (default `v25.0`, the current Marketing API version).
- The browser Pixel events, their names and their triggers are unchanged.
