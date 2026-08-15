# Meska AI Diploma Journey

A local, mobile-first approval prototype for Meska AI’s AI Co-Pilot Diploma.
It contains a conversion-focused landing page and a thank-you/Shopify handoff
page. The approved landing video, testimonial images, and organization logos
are stored locally. The production Meta Pixel, form destination, checkout URLs,
and still-pending thank-you media are intentionally not connected.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
pnpm install --frozen-lockfile
pnpm dev
pnpm lint
pnpm test
```

This starter does not use `wrangler.jsonc`.

## Project shape

- `app/content.ts`: centralized editable course, pricing, instructor, FAQ, and tracking content.
- `app/components/`: reusable page and section components.
- `app/lib/tracking.ts`: local-only event abstraction and UTM handling.
- `app/globals.css`: design tokens and responsive rules.
- `public/media/`: approved local originals and presentation assets; the live landing page does not hotlink essential media.
- `MEDIA_ASSET_MANIFEST.md`: asset provenance, dimensions, local paths, placement, and Framer upload status.
- `MEDIA_PLACEMENT_PLAN.md`: approved media order and responsive behavior.
- `app/thank-you/`: thank-you route.
- `PROJECT_HANDOFF.md`: current implementation state, decisions, validation, and unfinished work.
- `FRAMER_HANDOFF.md`: native-Framer recreation and Meta tracking plan.
- `NEXT_CHAT_HANDOFF.md`: standalone cross-chat source of truth for the accepted checkpoint.
- `AGENTS.md`: permanent rules for future Codex chats.
- `.openai/hosting.json`: Sites project declaration; publishing remains unapproved.

## Useful commands

- `pnpm dev`: start the local preview.
- `pnpm build`: verify the production build.
- `pnpm test`: build and verify both rendered routes.
- `pnpm lint`: run the existing lint configuration.
- `pnpm exec tsc --noEmit`: run the TypeScript check.

Live review routes are available at `/preview/mobile`, `/preview/tablet`, and
`/preview/desktop`. They render the real landing or thank-you page inside fixed
390px, 768px, and 1440px review frames.

The landing implementation is mobile-first. It uses 16px mobile gutters and
one-column mobile form fields, an intentional stacked conversion cluster at
768px, and a top-aligned video/pricing + form row from 1024px. The testimonial
screenshots retain their full aspect ratios. The organization logos use manual
2×2 swipe pages below desktop and a static 8×2 desktop grid.

## Important production notes

- Do not install a real Meta Pixel in this local prototype.
- Do not redirect until the production form integration confirms capture.
- Replace all remaining thank-you placeholders and missing destinations before launch.
- Upload every essential landing asset into Framer before production; external URLs in the manifest are provenance only.
- Do not deploy or publish until the page is approved.
