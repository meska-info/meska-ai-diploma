# Current state — Meska AI Co-Pilot Diploma

Production-transition snapshot · 23 August 2026, with the dated updates below (latest 29 Oct 2026). The site is live at https://diploma.meska.ai.

## What exists now

- A mobile-first Next.js App Router website prepared for native Next.js deployment on Vercel.
- Landing page `/`, thank-you page `/thank-you`, and 390/768/1440 live preview routes.
- Approved local assets: official logo, main video/poster, graduation video/poster, nine session video/poster pairs, four instructor portraits, nine testimonial pairs, and sixteen organization logo pairs.
- One synchronized Offline/Online landing price/form state.
- Seven visible required enquiry fields plus hidden selected `diploma` value.
- Shared client/server validation, normalized contact/profile data, PII-free diagnostic events, attribution, duplicate-submit guard, server-side Supabase persistence, Google Sheets sync, and persistence-qualified Lead token semantics.
- One dynamic thank-you checkout card with both approved Shopify links.
- Impact, outcomes, transparent greyscale marquee, shared curriculum disclosure, nine image testimonials, nine shared Stream video testimonials, free guide, graduation/session videos, nine-item skills matrix, four instructors, and sixteen FAQs.
- Full landing-page PNGs at 390, 768, and 1440px in `artifacts/full-page-pngs/`.
- The runtime Pixel/Dataset is `1982493002344234` and is live on production (Events Manager receives the browser events and the server-side `Lead`). `4138749493027663` is the separate Offline dataset and is not used.
- Active production documentation lives in `DEPLOYMENT.md`, `TRACKING.md`, `README.md`, and `AGENTS.md`.
- GitHub source repository is connected at `https://github.com/meska-info/meska-ai-diploma`; local `main` tracks remote `main`, and production baseline commit `e2c0ebe` remains in history for recovery.
- Vercel project `meska-ai-diploma` is connected directly to GitHub with `main` as its production branch.
- Production is live at `https://diploma.meska.ai` with GoDaddy DNS, Vercel-managed HTTPS, and the verified initial deployment `dpl_5ikQucV9zNi6rhzVKyNmr1ChehG5`.
- The repository includes a fail-open n8n lead trigger, a versioned `lead_offers` migration with an atomic processing claim, and an inactive credential-free n8n Cloud import for real Shopify 24-hour codes followed by an approved CEQUENS WhatsApp template.

- 28 Oct 2026 lead-flow fixes: LinkedIn accepts every real profile link format (still required) with per-reason error messages; Egyptian mobiles typed without the leading 0 are accepted; repeated/sequential phone digits are flagged (`suspected_spam`) instead of blocked; `FormError` carries `error_fields`; the lead API reads price/wave/date from `app/content.ts` (no hard-coded constants, `content_drift` logging); server-side Meta Lead with retries; Sheet sync status + retry job; "LinkedIn type" Sheet column; n8n failure logging; daily pipeline-health check. Details in `SUPABASE_LEADS.md` and `TRACKING.md`.
- 29 Oct 2026 (owner decision): the mobile field uses the same rules as the Copilot form — Arabic-Indic/Persian digits, Egyptian mobiles with or without the leading 0, and 20… / 0020… / +20… (with or without the extra 0) are all stored as `+201XXXXXXXXX`. Other countries still need their `+` or `00` code.

- 29 Oct 2026 tracking alignment: `ViewContent`, `Lead` (browser and server) and `InitiateCheckout` carry the same value, EGP currency and Shopify variant ID (`content_ids`); Meta's script loads only on `diploma.meska.ai`; Conversions API on Marketing API v25.0; stale pixel/handoff docs corrected. See `TRACKING.md`.

## What does not exist yet

- No `Purchase` event in this site: Purchase reaches the same dataset from Shopify's own Meta integration after a paid checkout. (Server-side `Lead` via the Conversions API is live since 28 Oct 2026 — see `TRACKING.md`.)
- Shopify/CEQUENS lead-offer automation is not live until the Supabase migration, n8n credentials/config, CEQUENS template approval, Vercel server variables, and controlled end-to-end test are complete.
- No live Framer changes or publication from this local project.

## Most important constraints

- Preserve Git history and use GitHub `main` as production.
- Do not rebuild, redesign, restore removed hero content, or reintroduce the landing Included area.
- Keep the current header Start Application anchor and persistent sticky advisor CTA; only the old hero CTA pair is removed.
- Preserve mobile-first behavior across 320, 375, 390, 768, 1024, 1280, and 1440px.
- Reduce height through structure and redundancy removal, never by crowding, tiny type, compressed padding, or aggressive media/testimonial crops.
- Keep landing format, price, hidden value, CTA, future route, and tracking variant synchronized.
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

Keep the lead pipeline, Meta event mapping (`TRACKING.md`) and responsive behavior verified after every change. Purchase stays with Shopify's Meta integration.
