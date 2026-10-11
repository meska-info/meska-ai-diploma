# Tracking inventory

Meta Pixel ID: `1982493002344234`

The Pixel is initialized once by `app/components/MetaPixel.tsx`. `PageView` is deduplicated by pathname for the current browser page lifecycle. All other events flow through `app/lib/tracking.ts`, which retains the local `window.__MESKA_EVENTS__` evidence log, filters PII-shaped parameter keys, and forwards events to Meta only after initialization.

Meta forwarding is enabled only on the production hostname `diploma.meska.ai`. Vercel Preview and localhost sessions retain the PII-free diagnostic evidence log without sending synthetic `PageView`, `Lead`, or other test events to the live dataset.

| Event | Trigger | Component/page | Meta call | Expected behavior |
| --- | --- | --- | --- | --- |
| `PageView` | Initial Pixel load and changed App Router pathname | `MetaPixel`, all routes | `track` | Once for each pathname navigation; never duplicated by rerender/script reload. |
| `ViewContent` | First landing render per session | `LandingPage`, `/` | `track` | Standard event; diploma/category only. |
| `CTAOpenForm` | Header or sticky free-guide activation | `SiteHeader`, `StickyMobileCTA`, `/` | `trackCustom` | Diagnostic interaction, never `Lead`. |
| `PricingView` | Primary price/form cluster becomes visible, or a header enrollment CTA is clicked | `EnrollmentLeadCapture`, `SiteHeader` | `trackCustom` | Deduplicated visibility event for the primary cluster. |
| `FormStart` | First focus within the interest form | `LeadCapture`, `/` | `trackCustom` | Once per mounted form; no field value. |
| `FormError` | Validation or persistence failure | `EnrollmentLeadCapture`, `/` | `trackCustom` | Error type/count/field names only; never field values. Includes type, seats, and tier-safe context. |
| `FormSubmit` | Valid local submit intent before qualified transition | `EnrollmentLeadCapture`, `/` | `trackCustom` | Keeps the existing event ID and once-key semantics; adds type, seats, server-equivalent total, tier, payment, readiness, and licence context. It is not a Meta `Lead`. |
| `Lead` | A persisted Diploma enquiry token is consumed after navigation | `ThankYouLeadTracker`, `/thank-you` | `track` | Exactly one standard conversion per server-confirmed Supabase enquiry event ID. Validation failures, API/persistence failures, repeated clicks, and direct visits do not fire it. |
| `LeadThankYouView` | Thank-you route loads | `ThankYouLeadTracker`, `/thank-you` | `trackCustom` | Records whether qualified submission state existed; not a conversion. |
| `FormatSelect` | Changed a retained legacy diploma format control by pointer/keyboard | Legacy helpers | `trackCustom` | Preserved for compatibility; the Copilot enrollment UI is online-only and does not emit this event. |
| `CapabilitySelect` | Changed skills-matrix selection | `SkillsBusinessValueSection` | `trackCustom` | Only after a changed selection. |
| `InitiateCheckout` | Copilot Pay online activation | `PaymentPathPicker`, `/thank-you` | `track` | Standard event with the displayed server-equivalent total, EGP currency, seat count, variant `42776902369326`, tier, payment path, lead ID, and event ID. Never fires for invoice/share. |
| `SeatCalculatorChange` | Seat count remains unchanged for 800 ms | `SeatCalculator`, `EnrollmentPanel` | `trackCustom` | Deduplicated by `seats-{location}-{n}` where applicable; contains seats, tier, value, and location. |
| `TierUnlocked` | First session entry into the 20% or 25% team tier | `SeatCalculator`, `EnrollmentPanel` | `trackCustom` | Once per tier per session. |
| `EnrollmentTypeSelected` | Just me/My team selection changes | `EnrollmentTypeToggle` | `trackCustom` | Includes enrollment type, effective seats, and form location. |
| `EnrollmentPageView` | Enrollment panel hydrates | `EnrollmentPanel`, `/thank-you` | `trackCustom` | Once per page load; reports personal/generic mode and non-PII enrollment context. |
| `ParticipantsSaved` | Valid participant roster PATCH succeeds | `ParticipantRoster` | `trackCustom` | Includes seat and participant counts only. |
| `PaymentPathSelected` | Payment radio changes | `PaymentPathPicker` | `trackCustom` | Includes path, seats, and current total. |
| `InvoiceRequested` | Invoice PATCH succeeds | `PaymentPathPicker` | `trackCustom` | Once per lead; includes seats, total, and currency. |
| `PaymentLinkShared` | Native share or copy succeeds | `PaymentPathPicker` | `trackCustom` | Includes seats, total, and share method; no payer address. |
| `CohortSwitched` | Later-cohort lead switches to Cohort 01 | `EnrollmentPanel` | `trackCustom` | Once per lead; includes seats and enrollment type. |
| `VideoPlay` | First play of free-guide, graduation, session, or testimonial video | Shared Stream player consumers | `trackCustom` | Deduplicated per tracked video and page context. Main autoplay overview is intentionally untracked. |
| `MediaPlaceholderClick` | Dormant placeholder helper activation | `VideoPlaceholder` (not mounted) | `trackCustom` | Dormant unless the helper is mounted later. |
| `CheckoutLinkPending` | Dormant/pending checkout helper | Not mounted | `trackCustom` | Dormant. |

`Purchase` is not implemented. It belongs only to confirmed Shopify payment evidence. There is no local Conversions API mirror; Shopify's Meta channel owns confirmed purchase reporting.

## Change rule

Do not remove, rename, disable, relocate, or alter these events or their triggers without explicit approval. Any change to CTAs, buttons, links, forms, navigation, thank-you flows, or checkout flows must test the corresponding event, PII filtering, event-ID deduplication, and `PageView` behavior.
