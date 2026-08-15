# Meska AI Diploma Journey

A local, mobile-first approval prototype for Meska AI’s AI Co-Pilot Diploma.
It contains a conversion-focused landing page and a thank-you/Shopify handoff
page. The production Meta Pixel, form destination, checkout URLs, and final
media are intentionally not connected.

## Prerequisites

- Node.js `>=22.13.0`

## Quick Start

```bash
pnpm install
pnpm dev
pnpm test
```

This starter does not use `wrangler.jsonc`.

## Project shape

- `app/content.ts`: centralized editable course, pricing, instructor, FAQ, and tracking content.
- `app/components/`: reusable page and section components.
- `app/lib/tracking.ts`: local-only event abstraction and UTM handling.
- `app/globals.css`: design tokens and responsive rules.
- `app/thank-you/`: thank-you route.
- `PROJECT_HANDOFF.md`: current implementation state, decisions, validation, and unfinished work.
- `FRAMER_HANDOFF.md`: native-Framer recreation and Meta tracking plan.
- `AGENTS.md`: permanent rules for future Codex chats.
- `.openai/hosting.json`: Sites project declaration; publishing remains unapproved.

## Useful commands

- `pnpm dev`: start the local preview.
- `pnpm build`: verify the production build.
- `pnpm test`: build and verify both rendered routes.
- `pnpm exec tsc --noEmit`: run the TypeScript check.

Live review routes are available at `/preview/mobile`, `/preview/tablet`, and
`/preview/desktop`. They render the real landing or thank-you page inside fixed
390px, 768px, and 1440px review frames.

## Important production notes

- Do not install a real Meta Pixel in this local prototype.
- Do not redirect until the production form integration confirms capture.
- Replace all visible placeholder media and missing destinations before launch.
- Do not deploy or publish until the page is approved.
