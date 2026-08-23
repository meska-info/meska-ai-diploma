# Current state — Meska AI Co-Pilot Diploma

Production-transition snapshot · 23 August 2026

## What exists now

- A mobile-first Next.js App Router website prepared for native Next.js deployment on Vercel.
- Landing page `/`, thank-you page `/thank-you`, and 390/768/1440 live preview routes.
- Approved local assets: official logo, main video/poster, graduation video/poster, nine session video/poster pairs, four instructor portraits, nine testimonial pairs, and sixteen organization logo pairs.
- One synchronized Offline/Online landing price/form state.
- Six visible required lead fields plus hidden selected `diploma` value.
- Local validation, PII-free diagnostic events, attribution, duplicate-submit guard, prototype thank-you redirect, and qualified local Lead token semantics.
- One dynamic thank-you checkout card with both approved Shopify links.
- Impact, outcomes, transparent greyscale marquee, curriculum disclosure, nine testimonials, ten thank-you videos, nine-item skills matrix, four instructors, and sixteen FAQs.
- Full landing-page PNGs at 390, 768, and 1440px in `artifacts/full-page-pngs/`.
- Production Meta Pixel `4138749493027663` is integrated once through the centralized tracking bridge; local and live technical verification are complete, while Meta Events Manager Test Events remains pending account-owner validation.
- Active production documentation lives in `DEPLOYMENT.md`, `TRACKING.md`, `README.md`, and `AGENTS.md`.
- GitHub source repository is connected at `https://github.com/meska-info/meska-ai-diploma`; local `main` tracks remote `main`, and production baseline commit `e2c0ebe` remains in history for recovery.
- Vercel project `meska-ai-diploma` is connected directly to GitHub with `main` as its production branch.
- Production is live at `https://diploma.meska.ai` with GoDaddy DNS, Vercel-managed HTTPS, and the verified initial deployment `dpl_5ikQucV9zNi6rhzVKyNmr1ChehG5`.

## What does not exist yet

- No production Offline or Online lead destination.
- No CAPI implementation or confirmed Shopify Purchase event implementation.
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

Complete Meta Events Manager Test Events validation with the account owner. Production lead routing and Purchase/CAPI remain separate future work unless explicitly authorized.
