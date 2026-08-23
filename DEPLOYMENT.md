# Production deployment

## Architecture

```text
Codex → GitHub → Vercel → https://diploma.meska.ai
```

GitHub is the source of truth. The production branch is `main`.

## Verified status

Updated: 23 August 2026

- Local production build: verified with native Next.js.
- GitHub repository: pending account authorization and repository creation/connection.
- Vercel project and Git integration: pending.
- Production domain: pending.
- DNS and SSL: pending.
- Production Meta Pixel: implemented locally; live delivery and Events Manager verification are pending deployment.

Never describe a pending item as complete without inspecting the external state.

## Normal change flow

```text
Codex task
→ focused feature/fix branch
→ commit and push
→ Vercel Preview
→ responsive, functional, and tracking review
→ pull-request merge to main
→ Vercel production deployment
→ production verification
```

Direct changes to `main` are production releases. Use them only when explicitly approved and appropriate for an urgent, reviewed correction.

## Build contract

- Runtime: Node.js `>=22.13.0`
- Package manager: pnpm with `pnpm-lock.yaml`
- Install: `pnpm install --frozen-lockfile`
- Development: `pnpm dev`
- Production build: `pnpm build`
- Start: `pnpm start`
- Quality checks: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`
- Vercel framework preset: Next.js
- Vercel root directory: repository root
- Vercel production branch: `main`

The retained vinext/Vite/Cloudflare Worker files and `build:worker` script are compatibility/history material. They are not the active Vercel production adapter.

## Domain and DNS safety

The only production hostname in scope is `diploma.meska.ai`. Do not change the hosting, DNS, or domain assignment of `meska.ai` or `www.meska.ai`.

After the Vercel project exists:

1. Add `diploma.meska.ai` to that project only after explicit approval.
2. Run Vercel domain inspection and use the exact project-specific record it returns.
3. Determine the authoritative DNS provider before proposing a change.
4. Make no DNS mutation without explicit approval.
5. Verify resolution, Vercel domain status, certificate issuance, HTTPS, and redirects.

## Production verification

Verify `/` and `/thank-you` at 320, 375, 390, 768, 1024, 1280, and 1440px. Check assets, videos, form validation/qualified transition, checkout routing, console/network errors, metadata, noindex thank-you behavior, Pixel initialization, one `PageView` per navigation, and all events in `TRACKING.md`.

## Rollback

- Code rollback: revert the production commit through Git and merge/push the revert to `main`.
- Deployment rollback: use Vercel deployment history to promote or redeploy the last known-good production deployment.
- Never delete Git history or Vercel deployment history as part of routine rollback.

## Legacy Framer status

Framer handoff files remain in the repository for historical reference. They are not part of active hosting, deployment, development, or production maintenance. Preserve them, do not execute them, and use them only if the user explicitly revives the Framer workflow.
