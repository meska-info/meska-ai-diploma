# Meska AI Diploma — Codex project handoff

Evidence-based continuation record updated 25 August 2026 (Africa/Cairo). The repository and external services are the source of truth. Never infer that a pending Preview or production check is complete.

## Architecture and release process

```text
Codex → GitHub → Vercel → https://diploma.meska.ai
```

- Next.js App Router, React, TypeScript, global CSS, pnpm.
- GitHub repository: `meska-info/meska-ai-diploma`; `main` is production.
- Vercel project: `meska-ai-diploma`.
- Normal releases require a focused branch, Vercel Preview verification, PR merge, then production verification.
- The retained vinext worker build is compatibility/test coverage, not the production adapter.

## Phase 2 implementation state

The Phase 2 implementation remains preserved in the original uncommitted working tree and is now also committed remotely on `codex/phase2-lead-video-migration` at `61725a5f185dfb87974b3cb84c9d0c85da70dd9a`. Draft PR #3 is `https://github.com/meska-info/meska-ai-diploma/pull/3`. Vercel Preview deployment `B1G1iUkCA73trbeXCWmivijoj1ec` is Ready at `https://meska-ai-diploma-git-codex-phase-ac98a2-info-21301372s-projects.vercel.app`. Phase 2 has not been merged or released to production.

Implemented locally:

- Homepage headline: `Build your first working AI App in 8 Weeks`, with `8 Weeks` using the existing accent color and relaxed responsive typography.
- Cohort facts centralized in `app/content.ts`: Offline starts 26 September 2026 and runs every Saturday, 11AM–4PM; Online starts 27 September 2026 and runs every Sunday, 7PM–11PM.
- Homepage lead magnet uses only name, email, and mobile; diploma stays as the toggle-owned hidden value. A hidden honeypot remains.
- Header and sticky CTA use `Watch Free Guide`; the sticky CTA opens the shared accessible `LeadModal` instead of scrolling.
- `POST /api/leads` validates, length-limits, allow-lists, deduplicates by `request_id`, and persists through server-only Supabase REST credentials. The browser never receives the service key and never reports success when persistence fails.
- Supabase project `meska-ai-diploma` (`dnuaeegngfnzewbqemvk`) is healthy. `supabase/schema.sql` was applied successfully. RLS is enabled on `public.leads`.
- Vercel Preview and Production contain `SUPABASE_URL` as Config and `SUPABASE_SERVICE_ROLE_KEY` as Secret. Never place the key in this repository or a `NEXT_PUBLIC_` variable.
- Meta Pixel active runtime constant is `1982493002344234`. `PageView`, `ViewContent`, `Lead`, and `InitiateCheckout` remain standard events; other useful events remain custom. Lead fires only when the qualified persisted-submission token is consumed on `/thank-you`.
- Homepage hero, free guide, graduation story, inside-diploma videos, and video testimonials use the shared `CloudflareStreamVideo` component. Only the hero autoplays, muted; below-fold players are lazy and user-controlled. The Cloudflare Player SDK pauses other embedded players when one starts.
- Thank-you order is: tracker/header, free guide, graduation story, shared curriculum, checkout, inside-diploma videos, skills matrix, instructors, shared video testimonials, FAQs, footer.
- Shared video testimonials appear before the existing image testimonial carousel on the homepage and after instructors on thank-you.
- Footer reads `Created by Meska`.
- Logo sizing/loading and carousel readiness fixes are in `sections.tsx` and `globals.css`.
- Touch rules preserve vertical page scrolling over horizontal video tracks as far as CSS/embedded-player policy allows; real-device Preview verification remains required.
- Media and database notes live in `MEDIA_BANDWIDTH_AUDIT.md`, `CLOUDFLARE_STREAM_MIGRATION.md`, and `SUPABASE_LEADS.md`.

## Cloudflare Stream

- Account customer code: `27axu7xjwelxbgon`; playback host is `customer-27axu7xjwelxbgon.cloudflarestream.com`.
- The user approved all 21 uploads: hero, graduation, nine inside-diploma videos, free guide, and nine testimonials.
- All 21 uploads have public playback IDs in `app/content.ts` and report Ready/Ready to Stream. Their players render in Preview; interactive playback/exclusivity and production playback verification remain required.
- `CLOUDFLARE_STREAM_MIGRATION.md` is the authoritative filename-to-ID/status inventory.
- Preserve local source/reference media until Preview and production playback are verified and active runtime references are clean.

## Supabase lead model

`public.leads` stores a UUID primary key, unique `request_id`, name, email, mobile, `diploma_slug`, lead source, source context, allow-listed attribution JSON, and creation timestamp. Supabase is the reliable source of truth. Future Google Sheets routing should use `diploma_slug`; the spreadsheet has not been provided and must not be invented.

## Tracking contract

- `CTAOpenForm`: ordinary header/sticky activation; never a conversion.
- `FormStart`: first interaction.
- `FormError`: validation, synchronization, or persistence failure.
- `FormSubmit`: valid submission intent; not a conversion.
- `Lead`: only after successful persistence and qualified thank-you token consumption.
- `InitiateCheckout`: only on the matching Shopify checkout click.
- `Purchase`: intentionally not implemented locally; belongs to confirmed Shopify payment.
- Never send PII in event parameters or add duplicate `PageView`/`Lead` calls.
- The Preview loaded the Meta runtime configuration for Pixel `1982493002344234`. Meta Events Manager receipt and explicit no-duplicate `PageView`/`Lead` evidence remain unverified.

## Validation evidence

Passed after the main Phase 2 code changes: ESLint, strict TypeScript, native Next.js webpack production build, retained vinext worker build, three rendered-route tests, and `git diff --check`.

The default Turbopack build fails only in this managed sandbox because Turbopack attempts to bind a local helper port and receives `Operation not permitted`; the webpack production build passes. The exact patch was also applied to a clean writable clone and all 19 implementation/documentation files matched byte-for-byte before the remote commit was created.

Preview evidence completed: all mandated widths on both routes with no horizontal overflow; successful controlled primary and sticky-modal lead submissions; both exact rows confirmed and then deleted under authorization; both cohort dates verified on homepage and thank-you; all Stream embed groups rendered; user-controlled playback and cross-player pause behavior passed; modal focus/Escape restoration passed; checkout destinations are exact; no local MP4 or old Pixel runtime reference remains; and no application console error was found. The new Pixel runtime is present, but Meta reports that Pixel `1982493002344234` is unavailable on the Preview domain because of its traffic-permission settings. Meta Events Manager receipt/no-duplicate evidence is the remaining Preview release blocker.

## Required continuation sequence

1. Continue from draft PR #3 and its existing Vercel Preview; do not recreate the implementation or make a second branch.
2. In Meta Events Manager, resolve/confirm the Preview-domain traffic permission and verify Pixel `1982493002344234`, one `PageView`, one persisted primary-form `Lead`, one persisted sticky-modal `Lead`, no duplicate events, and no old Pixel traffic.
3. Fix any issue discovered by the Meta check and rerun proportionate validation.
4. Mark the PR ready and merge only after Preview approval, then verify `https://diploma.meska.ai` and update this handoff with exact production evidence.

## Remaining non-Phase-2 items

- Google Sheets integration awaits the user-provided spreadsheet.
- `Purchase` awaits confirmed Shopify payment integration.
- Broad Safari/real-device and formal WCAG audits remain separate verification work.
- Production and Preview verification are mandatory; the local implementation alone is not a release.
