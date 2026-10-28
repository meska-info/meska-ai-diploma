# Tracking inventory

Meta Pixel ID: `1982493002344234`

The Pixel is initialized once by `app/components/MetaPixel.tsx`. `PageView` is deduplicated by pathname for the current browser page lifecycle. All other events flow through `app/lib/tracking.ts`, which retains the local `window.__MESKA_EVENTS__` evidence log, filters PII-shaped parameter keys, and forwards events to Meta only after initialization.

Meta forwarding is enabled only on the production hostname `diploma.meska.ai`. Vercel Preview and localhost sessions retain the PII-free diagnostic evidence log without sending synthetic `PageView`, `Lead`, or other test events to the live dataset.

| Event | Trigger | Component/page | Meta call | Expected behavior |
| --- | --- | --- | --- | --- |
| `PageView` | Initial Pixel load and changed App Router pathname | `MetaPixel`, all routes | `track` | Once for each pathname navigation; never duplicated by rerender/script reload. |
| `ViewContent` | First landing render per session | `LandingPage`, `/` | `track` | Standard event; diploma/category only. |
| `CTAOpenForm` | Header or sticky free-guide activation | `SiteHeader`, `StickyMobileCTA`, `/` | `trackCustom` | Diagnostic interaction, never `Lead`. |
| `PricingView` | Primary price/form cluster becomes visible, or thank-you header Choose Diploma is clicked | `LeadCapture`, `SiteHeader` | `trackCustom` | Deduplicated visibility event for the primary cluster. |
| `FormStart` | First focus within the interest form | `LeadCapture`, `/` | `trackCustom` | Once per mounted form; no field value. |
| `FormError` | Validation or format synchronization failure | `LeadCapture`, `/` | `trackCustom` | Error type/count plus `error_fields` (comma-separated field names, e.g. `mobile,linkedin`); never a field value. |
| `FormSubmit` | Valid local submit intent before qualified transition | `LeadCapture`, `/` | `trackCustom` | Diagnostic only. It is not a Meta `Lead`. |
| `Lead` | A persisted Diploma enquiry token is consumed after navigation | `ThankYouLeadTracker`, `/thank-you` | `track` | Exactly one standard conversion per server-confirmed Supabase enquiry event ID. Validation failures, API/persistence failures, repeated clicks, and direct visits do not fire it. |
| `LeadThankYouView` | Thank-you route loads | `ThankYouLeadTracker`, `/thank-you` | `trackCustom` | Records whether qualified submission state existed; not a conversion. |
| `FormatSelect` | Changed landing or checkout format by pointer/keyboard | `LeadCapture`, `CheckoutSection` | `trackCustom` | Only after a changed selection; includes previous/new variant and source. |
| `CapabilitySelect` | Changed skills-matrix selection | `SkillsBusinessValueSection` | `trackCustom` | Only after a changed selection. |
| `InitiateCheckout` | Matching Offline/Online Shopify button activation | `CheckoutSection`, `/thank-you` | `track` | Standard event with matching value, EGP currency, variant, and event ID. |
| `VideoPlay` | First play of free-guide, graduation, session, or testimonial video | Shared Stream player consumers | `trackCustom` | Deduplicated per tracked video and page context. Main autoplay overview is intentionally untracked. |
| `MediaPlaceholderClick` | Dormant placeholder helper activation | `VideoPlaceholder` (not mounted) | `trackCustom` | Dormant unless the helper is mounted later. |
| `CheckoutLinkPending` | Dormant/pending checkout helper | Not mounted | `trackCustom` | Dormant. |

`Purchase` is not implemented. It belongs only to confirmed Shopify payment evidence. The Supabase route is configured but its deployed end-to-end persistence and Meta receipt must remain marked unverified until Phase 2 Preview testing succeeds.

## Change rule

Do not remove, rename, disable, relocate, or alter these events or their triggers without explicit approval. Any change to CTAs, buttons, links, forms, navigation, thank-you flows, or checkout flows must test the corresponding event, PII filtering, event-ID deduplication, and `PageView` behavior.


## Server-side Lead (Meta Conversions API)

`POST /api/leads` sends a server `Lead` to Pixel `1982493002344234` after the enquiry is saved in Supabase. Its `event_id` is the enquiry `request_id`, which is the same value the browser `Lead` uses as `eventID` on `/thank-you`, so Meta deduplicates the pair and counts each enquiry once.

- `user_data`: SHA-256 hashed email, phone (digits with country code), first and last name; `fbp`/`fbc` (from the `_fbp`/`_fbc` cookies, or `fbc` derived from `fbclid`), client IP and user agent. Raw IP is removed from Supabase after 7 days.
- `custom_data`: `currency: "EGP"`, `value` = programme price, `content_name` = `offline|online`, `content_category: "professional_diploma"`.
- First attempt runs right after the lead is saved; failures are retried every 5 minutes by `/api/cron/lead-sync` (max 10 attempts, never for events older than 7 days). Status is stored on the lead (`capi_status`, `capi_attempts`, `capi_sent_at`, `capi_error`).
- Requires `META_CONVERSIONS_TOKEN` (Production). Until it is set the server Lead is skipped and leads stay `pending`; they are sent automatically once the token exists (within Meta's 7-day window). Optional: `META_TEST_EVENT_CODE` (used outside Production only), `META_GRAPH_API_VERSION`.
- The browser Pixel events, their names and their triggers are unchanged.
