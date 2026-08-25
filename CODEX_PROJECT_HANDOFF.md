# Meska AI Diploma — Codex project handoff

Evidence-based continuation record updated 25 August 2026 (Africa/Cairo). The repository and external services are the source of truth. Never infer that a pending Preview or production check is complete.

## Android autofill P0 incident — resolved 25 August 2026

- A physical Android production attempt showed the generic save failure. Vercel logs proved the requests reached `POST /api/leads` and returned repeated HTTP `422` responses around 20:29–20:30 Cairo time, before Supabase was called.
- The exact failure was reproduced by populating the off-screen `companyWebsite` text honeypot: the otherwise valid Android-shaped submission returned the same error and emitted zero `Lead`.
- Root cause: Android profile/autofill or in-app browser behavior can populate visually hidden text inputs despite `autocomplete="off"`. The server treated any honeypot value as invalid lead data. The visible name, email, and leading-zero Egyptian phone were valid strings and were not the cause.
- PR #5 changed the trap to a controlled hidden field, stopped treating a legacy client honeypot value as grounds to discard an otherwise valid lead, and added structured PII-free validation/API/Supabase diagnostics.
- Physical Android verification passed both the main and sticky forms on the final Vercel Preview. Two distinct rows with distinct event IDs were confirmed in Supabase and deleted by exact controlled email.
- PR #5 merged to `main` at `e847065d1e42cab0585278b2bf6140eaa8e96b89`; Vercel production completed successfully.
- Production main and sticky submissions with `010...` and `011...` phone strings each persisted, redirected, and emitted exactly one `Lead` after matching `FormSubmit` event IDs. Their exact rows were confirmed and deleted.
- Final production regression passed 12 widths from 320 to 1600px, the short 390×320 modal, correct Pixel `1982493002344234`, absence of `4138749493027663`, and thank-you floating CTA visibility at mobile/tablet/desktop. No application console errors were found.

## Post-production mobile conversion and thank-you CTA fix — verified 25 August 2026

- PR #4 was merged to `main` at squash commit `0415f4938c16abc6981bd2f3763b50dffcda6ceb`.
- Vercel production deployment `meska-ai-diploma-6dfq8ur7o-info-21301372s-projects.vercel.app` completed successfully and is served by `https://diploma.meska.ai`.
- Root cause: direct `sessionStorage` access could throw in storage-restricted mobile/privacy or in-app browser contexts, aborting tracking before persistence or redirect after persistence. Autofilled whitespace could also fail native email validity.
- Fix: guarded session-storage helpers, a PII-free same-tab `window.name` fallback for the qualified persisted-lead token, field trimming, mobile keyboard hints, and hardened short-viewport modal scrolling with safe-area spacing.
- Production primary and sticky/modal submissions at 390px persisted to Supabase and each emitted exactly one `Lead` only after successful persistence. Browser/server event IDs matched. Opening the modal and validation failure emitted no `Lead`.
- The production sticky modal remained usable at 390×320: 312px client height, 638px scroll height, and `overflow: auto`.
- The thank-you floating `Choose Diploma` CTA uses `IntersectionObserver`: hidden at the navigation CTA, visible between useful CTA areas, hidden over the checkout card, and visible after it. This passed at 390, 820, and 1440px with no horizontal overflow; clicking it smoothly scrolls to the actionable checkout card without changing the URL.
- Production contains Pixel/Dataset `1982493002344234`, contains no `4138749493027663`, renders 10 homepage and 20 thank-you Cloudflare Stream frames, shows both approved dates, and produced no application console errors.
- The two Preview and two production smoke-test rows were verified and deleted by exact email; all unrelated Supabase records were left untouched.

## Production release — verified 25 August 2026

- PR #3 was marked ready and merged to `main` at merge commit `91e89196e96d5d5b507c125809709e18faf813ee`.
- Vercel production deployment `CYRARtL25AmQzMSb6umw3fgshKEg` completed successfully.
- Production URL `https://diploma.meska.ai` serves the Phase 2 implementation.
- Desktop (1440px) and mobile (390px) smoke tests passed with no horizontal overflow, browser console errors, or warnings.
- Homepage Offline `26 September 2026` and Online `27 September 2026` dates are correct; the production sticky CTA appears and opens the modal.
- Controlled production primary and sticky-modal submissions each persisted to Supabase and emitted exactly one local `Lead` after persistence. Their matching rows were confirmed and then deleted; Supabase returned to `0 records`.
- Production contains Pixel/Dataset `1982493002344234`, loads its Meta runtime for `diploma.meska.ai`, and does not contain old Pixel `4138749493027663`.
- Production thank-you renders 20 Cloudflare Stream players; user-controlled playback was smoke-tested successfully.
- Meta Test Events receipt remains pending due to Meta-side propagation/caching, but this has been explicitly accepted as a non-blocking issue for production release.

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

Phase 2 is merged and released to production. PR #3 merged at `91e89196e96d5d5b507c125809709e18faf813ee`; the follow-up mobile conversion/thank-you CTA fix shipped through PR #4 at `0415f4938c16abc6981bd2f3763b50dffcda6ceb`. The original dirty managed working tree remains historical evidence and must not be used to infer production state.

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

Preview evidence completed: all mandated widths on both routes with no horizontal overflow; successful controlled primary and sticky-modal lead submissions; exact rows confirmed and deleted; both cohort dates verified; all Stream groups rendered; playback exclusivity passed; modal focus/Escape restoration passed; checkout destinations are exact; no local MP4 or old Pixel runtime reference remains; and no application console error was found. Authenticated Meta Business settings confirm selected asset `26737634695875002` is `Meska's Pixel | Onnline`, dataset/Pixel `1982493002344234`, owned by `meska.ai`, and receiving Meta Pixel plus Conversions API data. Validation failure and modal open emitted zero `Lead`; persisted primary and modal submissions emitted exactly one `Lead` each with matching event IDs. The exact Preview hostname was added to the Pixel allow list on 25 August 2026, but Meta's delivery endpoint continued returning its cached traffic-permission rejection through bounded retries, so Test Events receipt remains the sole release blocker. Supabase returned to `0 records` after cleanup.

## Current continuation notes

- Phase 2 and the post-production mobile conversion fix are live; do not recreate either implementation.
- Meta Test Events visual receipt remains accepted as a non-blocking Meta-side propagation/caching item. The production runtime and local event evidence are verified as documented above.
- Any future change must use a focused branch, Vercel Preview verification, PR merge, and production smoke test.

## Remaining non-Phase-2 items

- Google Sheets integration awaits the user-provided spreadsheet.
- `Purchase` awaits confirmed Shopify payment integration.
- Broad Safari/real-device and formal WCAG audits remain separate verification work.
- Production and Preview verification are mandatory; the local implementation alone is not a release.
