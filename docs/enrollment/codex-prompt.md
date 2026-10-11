You're implementing **Individual and Team Enrollment** for the Microsoft Copilot Course site (copilot.meska.ai) in this repository. Two files are attached:

1. `copilot-team-enrollment-spec.md`: the full specification and integration guide. It is the **source of truth**.
2. `copilot-enrollment-prototype.html`: a clickable visual and behaviour reference. Open it in a browser and use its scenario buttons. Where it simplifies, the spec wins.

**Step 0:** save both files into the repo under `docs/enrollment/` and commit them with your changes.

**Ground rules**
- I won't touch code, dashboards, environment variables or the Google Sheet. You own everything end to end: code, Supabase migration, Sheet sync, tests, screenshots and the PR. Never finish with "please run…" or "please add…". If something can't be done from the repo, it's a blocker (spec Section 17). Stop and report it with the ready-to-apply fix.
- Don't break what works today:
  - the existing validation rules (spec Section 3.2)
  - the honeypot `companyWebsite`
  - every existing Meta Pixel event (names, tracking_id, event_id, onceKey, params)
  - the Supabase lead insert and the `/api/copilot-leads/receipt` route
  - existing Google Sheet columns and attribution capture
- No new third-party services or secrets. Reuse the existing Supabase client, the Sheet sync, and the `trackEvent` / `createEventId` / `captureAttribution` helpers. Shopify needs no token: checkout is `https://aionline.meska.ai/cart/42776902369326:{seats}`.
- One source of truth each: prices come from the pricing module (Section 4), and validation from one shared validator used by both the form and the API (Section 6).

**What to build** (details in the spec)
- **Two form modes:** "Just me" (10 fields, Section 5.2) and "My team" (11 items, Section 5.3), with the exact labels, options, order, intro, accuracy note and next-step copy.
- **Work-email rule:** reject personal domains (Gmail, Outlook, Yahoo, iCloud and their country variants) in both modes and in the participant roster, on top of all existing email rules.
- **Incremental per-seat pricing:** 30,000 for 1 seat, 24,000 per seat for 2–4, and 22,500 per seat for 5–20. A seat calculator on Page 1 shares state with the form and Page 2.
- **Page 2 (`/thank-you`) as the enrollment page:**
  - personal and generic modes
  - editable seats
  - context callouts: next cohort, no or partial Copilot licence, Sympl installments, enterprise arrangement
  - participant roster
  - three payment paths: pay now, company invoice, send to manager
- **Supabase:** additive migration and the new PATCH endpoint.
- **Google Sheet:** one row per lead, upserted, with the 20 new columns appended on the right using the exact headers.
- **Meta tracking:** existing events preserved with added params, plus the new events in Section 12.
- **Responsive behaviour** per Section 13, including the mobile sticky pay bar.

**Order of work** (Section 14.3)
1. A discovery report as the first section of the PR description. Include:
   - the files for the form, the thank-you page, the course config, tracking and the lead API
   - the Supabase table and how migrations are applied
   - how the Google Sheet gets rows (case a, b or c) and whether it appends or upserts
   - every existing `trackEvent` call and any Conversions API calls
2. Extract the existing validator into the shared module, with tests proving the behaviour is unchanged. Then add the new rules.
3. Pricing module and tests.
4. Migration, then API POST (extended) and PATCH (new), with tests.
5. Google Sheet sync.
6. Page 1: calculator and form modes.
7. Page 2: enrollment page.
8. Tracking.
9. Responsive pass, then Playwright tests for every user story in Section 9, plus the screenshot set in Section 13.

**Definition of done:** every checkbox in Section 16 passes. The PR includes:
- test output
- the screenshots
- a test 6-seat team lead shown as its Supabase row and the matching Google Sheet row
- a log of the Pixel events fired in the individual and team flows

Remove every reference to the broken checkout URL (`/checkouts/cn/hWNG…`).

If the spec conflicts with the repo, follow the repo's conventions, keep the spec's behaviour, and explain the difference in the PR.
