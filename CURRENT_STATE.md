# Current state — Meska AI Co-Pilot Diploma

Copilot enrollment implementation snapshot · 11 October 2026

## What exists now

- A mobile-first Next.js App Router website prepared for native Next.js deployment on Vercel.
- Landing page `/`, thank-you page `/thank-you`, and 390/768/1440 live preview routes.
- Approved local assets: official logo, main video/poster, graduation video/poster, nine session video/poster pairs, four instructor portraits, nine testimonial pairs, and sixteen organization logo pairs.
- One shared 1–20 seat calculator with EGP 30,000 individual, 20% 2–4 seat, and 25% 5+ seat pricing.
- Separate Just me/My team form states with shared client/server validation, work-email enforcement, the existing honeypot, attribution, duplicate-submit protection, and persistence-qualified Lead semantics.
- A personalized/session-token or generic `/thank-you` enrollment panel with editable seats, team roster, licence/cohort callouts, Pay, invoice, and manager-sharing paths.
- Shopify cart permalinks use variant `42776902369326` and the current quantity; prices are always recomputed server-side.
- Additive Supabase enrollment migration applied successfully on 11 October 2026; the versioned SQL remains in `supabase/migrations/`.
- Google Sheets sync preserves A:W, appends the specified 20 columns, and upserts by lead UUID with retry/backoff.
- Impact, outcomes, transparent greyscale marquee, shared curriculum disclosure, nine image testimonials, nine shared Stream video testimonials, free guide, graduation/session videos, nine-item skills matrix, four instructors, and sixteen FAQs.
- Fifty enrollment state screenshots at 360, 390, 768, 1280, and 1440px in `artifacts/enrollment-screenshots/`.
- Phase 2 changes replace the active runtime Pixel constant with `1982493002344234`; production receipt remains unverified until the Phase 2 Preview is approved and deployed.
- Active production documentation lives in `DEPLOYMENT.md`, `TRACKING.md`, `README.md`, and `AGENTS.md`.
- GitHub source repository is connected at `https://github.com/meska-info/meska-ai-diploma`; local `main` tracks remote `main`, and production baseline commit `e2c0ebe` remains in history for recovery.
- Vercel project `meska-ai-diploma` is connected directly to GitHub with `main` as its production branch.
- Production is live at `https://diploma.meska.ai` with GoDaddy DNS, Vercel-managed HTTPS, and the verified initial deployment `dpl_5ikQucV9zNi6rhzVKyNmr1ChehG5`.
- The repository includes a fail-open n8n lead trigger, a versioned `lead_offers` migration with an atomic processing claim, and an inactive credential-free n8n Cloud import for real Shopify 24-hour codes followed by an approved CEQUENS WhatsApp template.

## What does not exist yet

- The Copilot feature branch still requires its Vercel Preview deployment, controlled live lead/Sheet verification, and PR review before merge.
- No CAPI implementation or confirmed Shopify Purchase event implementation.
- Shopify/CEQUENS lead-offer automation is not live until the Supabase migration, n8n credentials/config, CEQUENS template approval, Vercel server variables, and controlled end-to-end test are complete.
- No live Framer changes or publication from this local project.

## Most important constraints

- Preserve Git history and use GitHub `main` as production.
- Do not rebuild, redesign, restore removed hero content, or reintroduce the landing Included area.
- Keep the current header Start Application anchor and persistent sticky advisor CTA; only the old hero CTA pair is removed.
- Preserve mobile-first behavior across 320, 375, 390, 768, 1024, 1280, and 1440px.
- Reduce height through structure and redundancy removal, never by crowding, tiny type, compressed padding, or aggressive media/testimonial crops.
- Keep seat count, enrollment type, server price, Shopify quantity, URL, and tracking context synchronized.
- Do not invent facts, endpoints, events, infrastructure, or production verification.
- Production deployment, domain assignment, and DNS changes require the approvals described in `DEPLOYMENT.md`.
- Framer handoff files are historical reference only: preserve them, never use them for deployment, and do not maintain Framer compatibility unless explicitly requested.

## Read first

1. `AGENTS.md`
2. `DEPLOYMENT.md`
3. `TRACKING.md`
4. `README.md`
5. actual source and current Git diff

## Next phase

Push the Copilot enrollment branch, verify the Vercel Preview with controlled individual/team leads and the Sheet upsert, then review and merge the PR. Purchase/CAPI remain separate future work.
