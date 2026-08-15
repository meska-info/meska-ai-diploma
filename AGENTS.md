# Permanent project rules

- Read `NEXT_CHAT_HANDOFF.md`, `PROJECT_HANDOFF.md`, and `FRAMER_HANDOFF.md` before making changes. Treat the current checkpoint as the accepted baseline; do not repeat or undo completed layout amendments without a new explicit instruction.
- Preserve the single landing conversion goal: **Start Application**. A `Lead` requires confirmed form capture and the thank-you success state; Shopify click is `InitiateCheckout`, and confirmed Shopify payment is `Purchase`.
- Do not invent or silently change prices, dates, statistics, testimonials, partners, instructors, outcomes, claims, policies, or program details. Mark missing approved content as pending.
- Keep editable course content in `app/content.ts`, design tokens/responsive rules in `app/globals.css`, and tracking logic/names centralized.
- Preserve the approved section order, required seven form fields, immediate prototype redirect, FAQ on the thank-you page, and mobile-first behavior.
- Do not add landing eligibility content, WhatsApp, checkout gating, eligibility/payment explanation, or a thank-you confirmation summary unless the user reverses those decisions.
- Do not install or fire a production Meta Pixel locally, hard-code a Pixel ID, send PII in events, or fire conversions from ordinary CTA clicks.
- Do not publish or deploy, connect production form/checkout destinations, or modify the approved design without explicit approval.
- Use reusable semantic components and Framer-Stack-compatible layouts; avoid fragile absolute positioning and unnecessary dependencies.
- Validate live routes at 360, 390, 768, 1024, and 1440px after implementation changes, including interactions, overflow, accessibility, and event deduplication.
