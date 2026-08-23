# Meska AI Diploma — production operating rules

## Active production architecture

The active architecture is:

```text
Codex → GitHub → Vercel → https://diploma.meska.ai
```

- GitHub is the source of truth. `main` is the production branch.
- Ordinary changes use a focused branch, commit, push, Vercel Preview review, and pull-request merge to `main`.
- A merge or direct push to `main` is a production release and requires appropriate approval.
- Verify the Vercel Preview before production and verify the production deployment after merge.

## Read first

Before changing anything, read these files completely in this order:

1. `CURRENT_STATE.md`
2. `DEPLOYMENT.md`
3. `TRACKING.md`
4. `README.md`
5. actual source and current Git state

`PROJECT_HANDOFF.md`, `PROJECT_STATE.json`, `NEXT_CHAT_HANDOFF.md`, `FRAMER_HANDOFF.md`, `MEDIA_ASSET_MANIFEST.md`, and `MEDIA_PLACEMENT_PLAN.md` are retained pre-production/historical handoff records. Consult them only for relevant history or asset provenance; they do not override the active production files above.

Then inspect the actual source and Git status. The current uncommitted working tree is the accepted local baseline; commit `77cf2e01faa8716ccd83ad066702bbc3c1b6c5ef` is the pre-amendment checkpoint, not a state to restore.

## Current infrastructure status

- Local development and Git: yes.
- GitHub, Vercel, and the production domain must match the verified status in `DEPLOYMENT.md`; never infer that a pending item is complete.
- Production Meta Pixel ID: `4138749493027663`. Its implementation and event mapping are production requirements.
- Production Offline and Online lead destinations: both missing/pending. Never invent endpoints or claim two-destination routing works.

## Commands

Use Node.js `>=22.13.0` and the existing pnpm lockfile.

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm exec tsc --noEmit
pnpm test
```

`pnpm test` runs the native Next.js production build, the retained worker compatibility build, and rendered-route tests. Do not upgrade dependencies or change the framework during ordinary corrections.

## Architectural rules

- Keep editable program facts, approved copy, asset records, checkout URLs, and stable tracking names in `app/content.ts`.
- Keep page composition in `app/components/LandingPage.tsx` and `app/components/ThankYouPage.tsx`; reusable behavior lives in `app/components/sections.tsx`.
- Keep tracking behavior centralized in `app/lib/tracking.ts` and design/responsive rules in `app/globals.css`.
- Preserve the Next.js App Router + React + TypeScript structure and pnpm package manager. The active production build is native Next.js on Vercel.
- Use reusable semantic components; avoid fragile absolute positioning and unnecessary dependencies.
- Preserve local assets under `public/media/`; do not hotlink essential production media or delete source/reference assets because they appear unused.

## Locked experience

- Mobile-first is mandatory. Verify landing and thank-you routes at 320, 375, 390, 768, 1024, 1280, and 1440px after implementation changes.
- Never fix one breakpoint by breaking another. Reduce height by removing redundancy, not by crushing typography, padding, media, or hierarchy.
- Preserve the current section order and accepted copy unless the user explicitly changes them.
- The old hero CTA pair (`Start Application` / `Explore Curriculum`), orbit image, and course-detail bar remain removed. The current header Start Application anchor and sticky “Speak with a Meska Advisor” CTA are intentional and must remain.
- The landing price card has no Included area, replacement disclosure, or reserved empty space. The inclusion arrays in `app/content.ts` remain because the thank-you checkout card still uses them.
- Preserve the one-line `5 interest-free payments via Sympl.` text and the compact content-sized curriculum-session pill.
- Preserve the six visible required form controls plus toggle-owned hidden `diploma` value, atomic Offline/Online state, validation, duplicate-submit guard, attribution, and qualified thank-you flow.
- Preserve the compact thank-you confirmation, one dynamic checkout card, ten user-controlled/exclusive thank-you videos, nine-item skills matrix, four instructor cards, sixteen FAQs, nine testimonials, and transparent greyscale sixteen-logo marquee.
- WhatsApp may appear only in the verified thank-you FAQ support answer. Do not add a landing WhatsApp CTA, eligibility section, checkout gate, or payment-before-eligibility copy.

## Conversion and tracking rules

- Landing goal: submit the interest form. Ordinary header/sticky clicks emit `CTAOpenForm`; they are not conversions.
- `Lead` requires a valid form submission and the qualified thank-you token. `InitiateCheckout` belongs only to the matching Shopify click. `Purchase` belongs to confirmed Shopify payment and is not implemented locally.
- Meta Pixel and analytics are production requirements. Do not remove, rename, disable, relocate, or alter existing analytics or Pixel tracking unless explicitly requested.
- Whenever changing CTAs, buttons, links, forms, navigation, application flows, thank-you flows, or conversion components, verify their associated tracking. Check for missing events, duplicate events, broken handlers, duplicate `PageView` calls, incorrect conversion triggers, and PII leakage.
- A UI task is incomplete if it works visually but breaks tracking. Preserve the event inventory and Meta mapping in `TRACKING.md`.
- Never send PII in tracking parameters, fire duplicate events, or hard-code tracking into visual indexes.
- Preserve both complete checkout URLs and their query strings in `app/content.ts`; append attribution only when a key is absent.

## Legacy Framer handoff

- Existing Framer handoff files are retained as historical reference only. Preserve them; do not delete or materially modify them without explicit instruction.
- Do not use them as deployment, hosting, development, or production-maintenance instructions.
- Do not maintain Framer compatibility or update Framer handoff documentation during ordinary website work unless the user explicitly revives the Framer workflow.
- Historical Framer instructions never override the active GitHub/Vercel architecture.

## Prohibited regressions

Do not rebuild from scratch, restore removed content, over-compress sections, crop testimonial/media content aggressively, replace approved assets, invent facts, commit secrets, or perform unapproved production/domain changes.
