# Production deployment

## Architecture

```text
Codex → GitHub → Vercel → https://diploma.meska.ai
```

GitHub is the source of truth. The production branch is `main`.

## Verified status

Updated: 23 August 2026

- Local production build: verified with native Next.js.
- GitHub repository: verified at `https://github.com/meska-info/meska-ai-diploma`; `main` is production, local `main` tracks remote `main`, and baseline commit `e2c0ebe` remains in history.
- Vercel project: `meska-ai-diploma` (`prj_pngAONEjTfCOV8PqAk1hMl089eb1`), connected directly to the GitHub repository with `main` as `productionBranch` and Git deployments enabled.
- Initial production deployment: `dpl_5ikQucV9zNi6rhzVKyNmr1ChehG5`, status `READY`.
- Git automation proof: pull request #1 produced Vercel Preview `dpl_rCrNZoZy9Gm2kAifJa13E1ybx8KC`; merge commit `38d9d08` then produced and promoted Git-sourced production deployment `dpl_Ao1SYQSvUYAdkGpWd1XiXRoA5NRL`.
- Production domain: `https://diploma.meska.ai`, attached and ownership-verified.
- DNS: GoDaddy authoritative nameservers; scoped `_vercel` TXT verification and `diploma` CNAME only. Root and `www` records were not changed.
- SSL/HTTPS: verified; HTTP redirects to HTTPS and HTTPS returns `200` with Vercel HSTS.
- Production Meta Pixel: Pixel ID and one loader instance verified live; CTA, form, qualified `Lead`, thank-you, and checkout event sequences verified through the production diagnostic log. Meta Events Manager Test Events remains pending account-owner validation.

Never describe a pending item as complete without inspecting the external state.

The repository also contains an inactive-by-default Shopify/CEQUENS lead-offer integration. Its code can deploy without blocking lead acceptance, but the automation must remain described as inactive until the migration, n8n workflow, credentials, Vercel variables, and controlled live test in `docs/shopify-whatsapp-automation.md` are complete.

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

For future domain work:

1. Change or replace the current `diploma.meska.ai` assignment only after explicit approval.
2. Run Vercel domain inspection and use the exact project-specific record it returns.
3. Determine the authoritative DNS provider before proposing a change.
4. Make no DNS mutation without explicit approval.
5. Verify resolution, Vercel domain status, certificate issuance, HTTPS, and redirects.

Current production DNS records are intentionally limited to:

```text
TXT   _vercel   vc-domain-verify=diploma.meska.ai,<VERCEL_VERIFICATION_TOKEN>
CNAME diploma   c939ed6df8b99cba.vercel-dns-017.com
```

## Production verification

Verify `/` and `/thank-you` at 320, 375, 390, 768, 1024, 1280, and 1440px. Check assets, videos, form validation/qualified transition, checkout routing, console/network errors, metadata, noindex thank-you behavior, Pixel initialization, one `PageView` per navigation, and all events in `TRACKING.md`.

## Rollback

- Code rollback: revert the production commit through Git and merge/push the revert to `main`.
- Deployment rollback: use Vercel deployment history to promote or redeploy the last known-good production deployment.
- Never delete Git history or Vercel deployment history as part of routine rollback.

## Legacy Framer status

Framer handoff files remain in the repository for historical reference. They are not part of active hosting, deployment, development, or production maintenance. Preserve them, do not execute them, and use them only if the user explicitly revives the Framer workflow.
