# Prompt for the fresh Codex chat

Paste everything below into a fresh Codex chat opened on this same local project.

---

You are continuing an existing local website project from a previous Codex conversation. Do not rebuild it and do not assume remote infrastructure exists.

Work only in:

`/Users/ahmedzaki/Documents/Codex/2026-08-14/create-a-high-conversion-journey-of-2`

First verify that this exact path is both the working directory and Git repository root. Then, before making any change, read these files completely in order:

1. `AGENTS.md`
2. `CURRENT_STATE.md`
3. `PROJECT_HANDOFF.md`
4. `PROJECT_STATE.json`
5. `CHANGELOG_PROJECT.md`
6. `FRAMER_HANDOFF.md`
7. `MEDIA_ASSET_MANIFEST.md`
8. `MEDIA_PLACEMENT_PLAN.md`
9. `README.md`
10. `NEXT_CHAT_HANDOFF.md`

After reading them:

1. inspect the actual source, especially `app/content.ts`, `app/components/LandingPage.tsx`, `app/components/ThankYouPage.tsx`, `app/components/sections.tsx`, `app/lib/tracking.ts`, `app/globals.css`, the route files, tests, configuration, and `public/media/`;
2. inspect local Git status, branch, recent log, diff, and remotes without resetting or deleting anything;
3. verify checkpoint `77cf2e01faa8716ccd83ad066702bbc3c1b6c5ef` with subject `Checkpoint final layout amendments and cross-chat handoff`;
4. compare the documentation against the implementation and treat the current uncommitted implementation as the accepted baseline;
5. run appropriate non-destructive verification supported by the project;
6. preserve mobile/tablet/desktop behavior and the approved design/conversion decisions;
7. wait for my next implementation instruction after confirming your understanding.

Do not make speculative changes before understanding the repository.

Do not rebuild this website from scratch.

Do not restore the removed hero CTA pair, orbit image, course-detail bar, landing price-card Included area, secondary pricing controls, or duplicate modal form. The current header Start Application anchor and persistent `Speak with a Meska Advisor` sticky CTA are intentional and must remain.

Do not over-compress the layout. Page height matters, but hierarchy, readability, professional spacing, media integrity, and touch usability matter more. Never fix one breakpoint by breaking another. Future implementation changes must be checked at 320, 375, 390, 768, 1024, 1280, and 1440px on both the landing and thank-you routes.

Understand the infrastructure state:

- local development exists;
- local Git exists on `main`, but no remote is configured;
- GitHub setup is pending;
- Vercel setup and deployment are pending;
- production deployment and custom-domain configuration are pending;
- production Offline and Online lead destinations are both pending;
- Meta Pixel is not implemented; future approved Pixel ID is `4138749493027663`;
- Framer files are retained reference material unless I explicitly resume Framer work;
- nothing in the handoff authorizes publishing, deploying, pushing, connecting production services, or editing the live Framer project.

Preserve the current conversion semantics: ordinary CTA click is not Lead; a valid form submission plus qualified thank-you state is Lead; matching Shopify click is InitiateCheckout; Purchase belongs to confirmed payment and is not implemented locally. Never send PII in event parameters and never invent endpoints or production verification.

When a future task genuinely requires GitHub, Vercel, Meta, Framer, or another external account, perform every technical step you can and involve me only for unavoidable login/OAuth/account-selection/permission actions. Tell me exactly what to do and never ask me to paste passwords or sensitive credentials into chat.

Make no changes now. Confirm the repository/current accepted state and wait for my next instruction.

---
