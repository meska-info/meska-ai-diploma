# Microsoft Copilot Course: Individual and Team Enrollment

**End-to-end build specification and integration guide for Codex** · v3 · 11 Oct 2026

| | |
|---|---|
| Site | `copilot.meska.ai` (Next.js App Router, Turbopack build) |
| Pages | `/` (landing, `#apply` form, advisor modal) and `/thank-you` (becomes the enrollment page) |
| Data | Supabase lead table, mirrored to a Google Sheet |
| Checkout | Shopify "Meska AI" store, `aionline.meska.ai` (already configured; do not modify) |
| Visual reference | `copilot-enrollment-prototype.html` (shipped with this spec; open it in a browser) |
| Owner | Ahmed Zaki, meska.ai |

---

## Contents

0. Rules for Codex
1. What we're building
2. Shopify (already configured)
3. Current implementation and existing validation rules
4. Pricing module
5. Form specification: "Just me" and "My team"
6. Validation rules (existing and new)
7. Page 1 experience: seat calculator and form
8. Page 2 experience: the enrollment page
9. User stories and scenarios (end to end)
10. Backend and API
11. Data: Supabase and Google Sheet
12. Meta tracking
13. Responsive design
14. Integration guide (file-by-file)
15. Testing plan
16. Acceptance criteria
17. Out of scope and blockers

---

## 0. Rules for Codex

1. **The owner will not touch code, dashboards, environment variables or the Google Sheet.** You build, migrate, test and ship everything from the repository. Never end with "please run…" or "please add…". If something truly can't be done from the repo, report it as a blocker (Section 17) with the fix ready to apply.
2. **Discover before you change.** Section 3 comes from the deployed bundle. Confirm each point in the source. Where the repo differs, follow the repo's conventions, keep this spec's behaviour, and explain the difference in the PR.
3. **Don't break what works:** existing validation, the honeypot, Meta events, the Supabase insert, the `/api/copilot-leads/receipt` route, existing Google Sheet columns, and the attribution capture.
4. **No new services or secrets.** Reuse the existing Supabase client, the Sheet sync, `trackEvent`, `createEventId` and `captureAttribution`. Shopify needs no token; checkout uses cart links.
5. **One source of truth for prices and validation.** Every price comes from the pricing module (Section 4). Every rule comes from one shared validator, used by both the client and the API (Section 6).
6. Follow the build order in Section 14.3. Every item in Section 16 must pass before you open the PR.

---

## 1. What we're building

Two enrollment types on the same form, each with its own fields, and incremental per-seat pricing:

| Seats | Per seat | Discount on every seat |
|---|---|---|
| 1 ("Just me") | EGP 30,000 | none |
| 2–4 | EGP 24,000 | 20% |
| 5–20 | EGP 22,500 | 25% |
| 21+ | handled by an advisor (not sold online) | n/a |

`total = seats × pricePerSeat(seats)`. Each added seat adds the per-seat price of its tier, and the tier discount applies to every seat.

Canonical totals. These were verified in the live Shopify cart on 11 Oct 2026, and tests must assert every row:

| Seats | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 10 | 15 | 20 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Per seat | 30,000 | 24,000 | 24,000 | 24,000 | 22,500 | 22,500 | 22,500 | 22,500 | 22,500 | 22,500 | 22,500 |
| Total | 30,000 | 48,000 | 72,000 | 96,000 | 112,500 | 135,000 | 157,500 | 180,000 | 225,000 | 337,500 | 450,000 |
| Saved | 0 | 12,000 | 18,000 | 24,000 | 37,500 | 45,000 | 52,500 | 60,000 | 75,000 | 112,500 | 150,000 |

---

## 2. Shopify (already configured; do not change)

| Item | Value |
|---|---|
| Product | **Microsoft Copilot Course**, handle `microsoft-copilot-course`, ID `7669585674286` |
| **Variant ID** | **`42776902369326`** |
| Price | EGP 30,000. No tax, no shipping, inventory not tracked |
| Discount A | Automatic, "Team pricing · 20% off (2+ seats)". This product only, min quantity 2, doesn't combine |
| Discount B | Automatic, "Team pricing · 25% off (5+ seats)". This product only, min quantity 5, doesn't combine |
| Payment methods at checkout | Sympl (0% interest installments), Geidea Pay, Instapay |

Shopify applies the better of A and B. **The site sends only a seat count, never a price or a discount code.**

Checkout link:

```
https://aionline.meska.ai/cart/42776902369326:{seats}?attributes[lead_id]={leadId}&ref=copilot-lp&{attribution}
```

Verified: `:3` opens checkout at ~~90,000~~ **72,000** with the line "TEAM PRICING · 20% OFF (2+ SEATS)".

**Fix:** the current hard-coded `checkoutUrl` (`/checkouts/cn/hWNGKVDX0QCr7Ylog2NEfgXb/…`) is an expired session that redirects to the store homepage. Remove every reference to it.

Per-lead 10% codes from the "Meska Lead Discount" app may be entered at checkout. Shopify keeps the larger discount, so no handling is needed.

---

## 3. Current implementation (from the deployed bundle; confirm in source)

### 3.1 Form and submit flow
- The form renders at `#apply` (`location: "primary"`) and in the advisor modal (`location: "modal"`). Tracking names come from `trackingNames.primaryForm` / `trackingNames.modalForm`.
- Fields today: `diploma` (hidden `online`), `companyWebsite` (**honeypot, hidden; never rename or reuse**), `fullName`, `email`, `mobile`, `linkedinUrl`, `yearsExperience`, `paymentPreference` (`full`, `installments`), `joiningReadiness` (`upcoming`, `discuss_upcoming`, `later`).
- Submit flow:
  1. Run the validator, which returns `{ errors, normalized, valid }`.
  2. On errors: scroll to and focus the first invalid field, and fire `FormError` with `error_type: "validation"`.
  3. Otherwise fire `FormSubmit`, then `POST /api/copilot-leads`.
  4. A non-OK response shows "We couldn't save your details. Please try again." and fires `FormError` with `error_type: "persistence"`.
  5. On success, redirect to `/thank-you?diploma=online&<attribution>`.
  6. A ref (`y.current`) blocks double submits.
- Field wrapper: label + `*` + control + `<p class="error-message" id=…>`, with class `field-error` on error. Reuse it.

### 3.2 Existing validation rules (reproduce exactly; extend, don't loosen)

**`fullName`**
- Normalize: trim and collapse internal spaces.
- Empty → **"Full name is required."**
- Invalid → **"Please enter your real full name."** when any of these is true:
  - fewer than 3 letters, or more than 120 characters
  - no letter at all, or digits only
  - any character outside Unicode letters, marks, spaces and `. ' ’ – -`
  - any word is a placeholder (`demo, dummy, example, fake, placeholder, sample, synthetic, test, testing`)
  - any Latin word scores ≥ 4 on the gibberish heuristic: repeated characters or patterns, keyboard runs like `qwerty`, `asdfgh`, `zxcvbn`, `qazwsx`, `poiuyt`, `lkjhg`, `mnbvc`, `asdf…`, `abc…` / `xyz…`, or a low vowel ratio

**`email`**
- Normalize: trim and lower-case.
- Empty → **"Email address is required."**
- Invalid → **"Please enter a valid email address you actively use."** when any of these is true:
  - it fails the RFC-like pattern `local@label(.label)+` with a valid TLD
  - the local part is a repeated digit (`11111`), a placeholder word, `noreply` / `no-reply`, or a keyboard run (`asdf`, `qwerty`, `12345`…)
  - it is a repeated character, or scores high on the gibberish heuristic
  - it is a 4–6-letter local part with no vowels on a free provider
  - the domain is disposable (`mailinator.com`, `guerrillamail.com`, `10minutemail.com`, `tempmail.com`, `yopmail.com`, `sharklasers.com`, `throwawaymail.com`, `trashmail.com`)

**`mobile`**
- Normalize: strip spaces, `( ) . -`. `01[0125]XXXXXXXX` becomes `+201…`, and a leading `0020` becomes `+20…`.
- Valid if it matches `^\+201[0125]\d{8}$` (Egypt) or `^\+[1-9]\d{7,14}$` (E.164).
- Rejected if it contains 7 or more repeated digits, is a sequential run (`0123456789` and similar), or has fewer than 8 or more than 15 digits.
- Empty → **"Mobile number is required."** Invalid → **"Enter a valid mobile number, including country code if outside Egypt."**

**`linkedinUrl`**
- Normalize: add `https://` if missing, force `https:`, drop the query and hash, make `linkedin.com` into `www.linkedin.com`, and remove a trailing `/`.
- Valid only if the host is `www.linkedin.com` and the path matches `^/in/[a-z\d%_-]{2,}/?$`.
- Empty → **"LinkedIn profile is required."** Invalid → **"Enter your LinkedIn profile URL, e.g. linkedin.com/in/your-name."**

**Selects**
- Each value must be one of the allowed values.
- Messages: **"Select your years of experience."** / **"Select your preferred payment option."** / **"Select when you would like to join."**
- `diplomaSlug` must be `online` (**"Select a course format."**).

### 3.3 Thank-you page
- Price card with "Continue to enrollment ↗". It has `data-checkout-destination` and `data-track-id="copilot_enrollment"`, fires `InitiateCheckout` (value 30000, EGP), appends attribution, then calls `location.assign`.
- Below it: projects, curriculum, schedule, instructors, learner stories, FAQ.

### 3.4 Helpers and design tokens
- Helpers: `trackEvent(name, params, { onceKey })`, `createEventId(prefix)`, `captureAttribution()`.
- Tokens: `--ink #151130`, `--muted #626477`, `--blue #021f94`, `--blue-bright #f54f1b`, `--blue-pale #ebeefa`, `--paper #f5f2f3`, `--line #d6d1d6`, `--success #087d52`, `--error #bd1e37`, radii 10/18/26, `--page-gutter 16px`, `--shell 1280px`, Inter. The form also has a dark variant: reuse the existing styles.

### 3.5 Data pipeline (discover)
The lead API writes to **Supabase**, and a **Google Sheet** mirrors it. Before coding, document in the PR:
- the table name, the migration workflow and the client used
- how the Sheet is fed: (a) code in this repo, (b) a Supabase trigger, Edge Function or webhook, or (c) an Apps Script pulling from Supabase
- whether the Sheet sync appends or upserts, and the current column order

---

## 4. Pricing module

`lib/pricing/teamPricing.ts` (adapt to repo conventions):

```ts
export const COPILOT_VARIANT_ID = "42776902369326";
export const BASE_PRICE = 30000;
export const MIN_TEAM_SEATS = 2;
export const MAX_ONLINE_SEATS = 20;
export const TIERS = [
  { minSeats: 5, rate: 0.25, key: "team25" },
  { minSeats: 2, rate: 0.20, key: "team20" },
  { minSeats: 1, rate: 0,    key: "individual" },
] as const;

clampSeats(n: unknown): number        // NaN/≤0 → 1, floor, >20 → 20
tierFor(seats): Tier
pricePerSeat(seats): number
totalFor(seats): number
savingsFor(seats): number
nextTier(seats): { seatsNeeded: number; newPricePerSeat: number; extraSavingOnCurrentSeats: number } | null
formatEGP(n): string                  // "EGP 72,000"
cartPermalink(seats, { leadId?, attribution? }): string
```

`cartPermalink` builds `https://aionline.meska.ai/cart/42776902369326:{clampSeats(seats)}` and adds, URL-encoded:
- `attributes[lead_id]`, when a lead ID exists
- `ref=copilot-lp`
- the attribution params, skipping any key that is already present

Required tests:
- every row of Section 1
- `nextTier(1) = {1, 24000, 6000}`, `nextTier(3) = {2, 22500, 4500}`, `nextTier(4) = {1, 22500, 6000}`, `nextTier(5) = null`
- `clampSeats("x") = 1`, `clampSeats(0) = 1`, `clampSeats(3.9) = 3`, `clampSeats(99) = 20`
- the permalink format

Derive the existing config `price` / `priceValue` from this module, and remove the broken `checkoutUrl`.

---

## 5. Form specification

The form keeps its existing header ("INTERESTED IN JOINING?" / "Talk to a Meska Advisor") and gains:

1. a **"Who's enrolling?"** selector with two cards: **Just me** (`EGP 30,000`) and **My team** (`{n} seats · EGP {total}`, or `From EGP 24,000 / seat` when n = 1)
2. a short **intro**: what the form is for and what happens next. It changes with the selection.
3. the field set for the selected type, in the order below
4. an **accuracy note** above the submit button
5. a **next-step line** under the submit button

### 5.1 Copy

| Key | Just me | My team |
|---|---|---|
| intro | Tell us about yourself so an advisor can confirm your Copilot access and hold your seat in the cohort. It takes about a minute. | Tell us about your company and team. We use this to confirm Copilot access, apply team pricing and prepare onboarding for everyone. |
| accuracy note | Please use your real details. We use them for your enrollment, certificate and onboarding messages. | Please use your real work details. The company name appears on your invoice and certificates. |
| submit | Submit my interest ↗ | Continue with {n} seats → |
| next step | **Next:** you'll see your enrollment summary and can pay online or talk to an advisor first. Nothing is charged yet. | **Next:** confirm seats, add participants (optional) and choose how to pay. Nothing is charged yet. |

### 5.2 "Just me" fields (in this order)

| # | name | Label | Control | Required | Values / placeholder |
|---|---|---|---|---|---|
| 1 | `fullName` | Full name | text, `autocomplete="name"` | yes | placeholder "Your full name" |
| 2 | `mobile` | Mobile number | tel, `autocomplete="tel"` | yes | "+20 1XX XXX XXXX" |
| 3 | `email` | Work email | email, `autocomplete="email"` | yes | "you@yourcompany.com". Helper: "Use your company email address." |
| 4 | `companyName` | Company | text, `autocomplete="organization"` | yes | "Company you work for" |
| 5 | `jobTitle` | Job title | text, `autocomplete="organization-title"` | yes | "e.g. Operations Manager" |
| 6 | `linkedinUrl` | LinkedIn profile | url | yes | "linkedin.com/in/your-name" |
| 7 | `yearsExperience` | Years of experience | select | yes | `0–2 years` · `3–6 years` · `7–10 years` · `10+ years` (keep the existing values) |
| 8 | `paymentPreference` | How would you like to pay? | select | yes | `full` = "Pay in full" · `installments` = "0% interest installments via Sympl" |
| 9 | `copilotLicence` | Do you have a Microsoft 365 Copilot licence? | select | yes | `yes` = "Yes, through my company" · `no` = "No, not yet" · `unsure` = "I'm not sure" |
| 10 | `joiningReadiness` | When would you like to join? | select | yes | `upcoming` = "Upcoming cohort · Cohort 01, starts Wed 4 Nov 2026" · `later` = "The next cohort" |

The hidden `diploma` and the honeypot `companyWebsite` stay exactly as they are.

### 5.3 "My team" fields (in this order)

| # | name | Label | Control | Required | Values / placeholder |
|---|---|---|---|---|---|
| 1 | `companyName` | Company | text | yes | "Company name" |
| 2 | `jobTitle` | Your job title | text | yes | "e.g. L&D Manager" |
| 3 | `fullName` | Your full name | text | yes | |
| 4 | `email` | Work email | email | yes | "you@yourcompany.com" |
| 5 | `mobile` | Mobile number | tel | yes | |
| 6 | `linkedinUrl` | LinkedIn profile | url | yes | |
| 7 | `seats` | Number of seats | stepper (−, number, +), synced with the calculator | yes | 2–20. Live line underneath: `{n} × EGP {perSeat} = EGP {total}` plus the upsell line |
| 8 | `paymentPreference` | How would your company like to pay? | select | yes | `full` = "Pay in full" · `installments` = "0% interest installments via Sympl" · `enterprise` = "Enterprise arrangement (invoice, purchase order or custom payment terms)" |
| 9 | `joiningReadiness` | When would your team like to join? | select | yes | `upcoming` = "Upcoming cohort · Cohort 01, starts Wed 4 Nov 2026" · `later` = "The next cohort" |
| 10 | `copilotLicence` | Does your company have Microsoft 365 Copilot licences? | select | yes | `all` = "Yes, for everyone joining" · `some` = "Yes, for some of the team" · `none` = "No, not yet" · `unsure` = "We're not sure" |
| 11 | `submitterIsParticipant` | I'm one of the participants | checkbox, default checked | n/a | Helper: "Untick if you're enrolling your team but not attending yourself." |

`yearsExperience` is **not** asked in team mode. Send it as `null`.

### 5.4 Switching between types
- Shared values (`fullName`, `email`, `mobile`, `linkedinUrl`, `companyName`, `jobTitle`, `paymentPreference`, `joiningReadiness`) **persist** when switching.
- `copilotLicence` maps across: `yes` → `all`, `no` → `none`, `unsure` → `unsure`, and back again (`some` → `yes`).
- A `paymentPreference` of `enterprise` resets to empty when switching to Just me, because that option doesn't exist there.
- Errors for fields that are no longer shown are cleared.
- Selecting **My team** at n = 1 sets n = 2. Selecting **Just me** sets n = 1. The calculator moving to ≥ 2 selects My team, and moving to 1 selects Just me.

### 5.5 Backward compatibility
- `joiningReadiness: "discuss_upcoming"` is no longer offered but **must still be accepted by the API** (old cached pages).
- Old clients that send no `enrollmentType` are treated as `individual` and are **not** required to send `companyName`, `jobTitle` or `copilotLicence`. The new client always sends them.

---

## 6. Validation rules

Put every rule in **one shared module**, e.g. `lib/validation/copilotLead.ts`, exporting `validateCopilotLead(input, { mode }) → { errors, normalized, valid }`. **Import it in both the client form and the API route.** Move the existing inline validator into this module unchanged, then extend it.

| Field | Mode | Rule | Error message |
|---|---|---|---|
| fullName | both | **existing** (3.2) | existing |
| mobile | both | **existing** (3.2) | existing |
| linkedinUrl | both | **existing** (3.2) | existing |
| email | both | **existing** (3.2), **plus the work-domain rule below** | existing / new |
| email (work domain) | both | Reject if the domain is in `PERSONAL_EMAIL_DOMAINS` or matches `PERSONAL_EMAIL_PATTERNS` | **"Please use your work email (e.g. name@yourcompany.com). Personal addresses like Gmail, Outlook or Yahoo aren't accepted."** |
| companyName | both | Trim and collapse spaces. 2–120 characters. Must contain a letter. Not digits only. Allowed characters: letters, marks, digits, spaces and `& . , ' ’ ( ) - / +`. Reject placeholder words and gibberish (same heuristic as fullName) | empty: **"Company name is required."** / invalid: **"Please enter your real company name."** |
| jobTitle | both | Trim and collapse spaces. 2–80 characters. Must contain a letter. Same allowed characters as companyName. Reject placeholder words and gibberish | **"Job title is required."** / **"Please enter your real job title."** |
| yearsExperience | individual | in `["0–2 years","3–6 years","7–10 years","10+ years"]` | existing |
| paymentPreference | individual | in `["full","installments"]` | existing |
| paymentPreference | team | in `["full","installments","enterprise"]` | existing |
| copilotLicence | individual | in `["yes","no","unsure"]` | **"Tell us whether you have a Copilot licence."** |
| copilotLicence | team | in `["all","some","none","unsure"]` | **"Tell us about your company's Copilot licences."** |
| joiningReadiness | both (UI) | in `["upcoming","later"]`. The API also accepts `discuss_upcoming` | existing |
| seats | team | integer, 2–20 | **"Teams are 2 to 20 seats. For more, talk to an advisor."** |
| submitterIsParticipant | team | boolean | n/a |
| enrollmentType | both | `individual` or `team` | n/a |
| honeypot `companyWebsite` | both | **existing behaviour, unchanged** | n/a |

**`PERSONAL_EMAIL_DOMAINS`** (exact match, lower-case): `gmail.com, googlemail.com, hotmail.com, outlook.com, live.com, msn.com, yahoo.com, ymail.com, rocketmail.com, icloud.com, me.com, mac.com, aol.com, proton.me, protonmail.com, pm.me, gmx.com, gmx.net, mail.com, yandex.com, yandex.ru, zoho.com, zohomail.com, hey.com, fastmail.com, tutanota.com, inbox.com, mail.ru, qq.com, 163.com, 126.com`.

**`PERSONAL_EMAIL_PATTERNS`** (regex on the domain): `^(gmail|googlemail|hotmail|outlook|live|yahoo|ymail|aol|gmx|yandex|icloud)\.[a-z.]{2,6}$`. This catches `hotmail.co.uk`, `yahoo.com.eg`, `outlook.sa` and similar.

Keep the existing disposable-domain list. The existing free-provider rule (no-vowel local parts) becomes redundant but must stay harmless.

**Validation UX**
- Validate on submit, as today. After a field's first error, re-validate it on `blur` and `input` so the error clears as soon as the value is fixed.
- Show the normalized value back on blur for `mobile` (e.g. `01012345678` → `+201012345678`) and `linkedinUrl` (`https://www.linkedin.com/in/x`). Other fields are not rewritten while the user types.
- On submit failure: scroll to and focus the first invalid field, as today, and fire `FormError`.
- The server re-runs the same validator. It returns `400 { errors }`, and the client maps them onto the fields.

---

## 7. Page 1 experience

### 7.1 Seat calculator (`SeatCalculator`)

**Placement:** inside the cohort price card (replacing the static headline price) and in the closing CTA block. Both instances share state.

**Contents:**
- Eyebrow: `COHORT 01 · PRICE YOUR ENROLLMENT`
- Live total.
- Subline: `1 seat · individual price`, or `{n} seats × {perSeat} · you save {savings}`.
- Seat controls: −/+ (44 px targets) and a 1–20 slider, kept in sync.
- Tier chips: `1 seat · EGP 30,000` | `2–4 seats · EGP 24,000 / seat` | `5+ seats · EGP 22,500 / seat`. The active one is highlighted.
- Upsell line:
  - n = 1: "Bringing a colleague? 2 seats drop to EGP 24,000 each."
  - n = 2–4: "Add {k} more seat{s} and every seat drops to EGP 22,500 (saves another {extra} on your current seats)."
  - n = 5–19: "Best rate unlocked: 25% off every seat."
  - n = 20: "Larger group? Talk to an advisor for a custom quote." This opens the advisor modal in team mode with seats = 20.
- CTA: `Enroll ↘`, or `Enroll my team of {n} ↘`. It scrolls to `#apply`, selects the matching type and focuses the first empty required field.

**State:** a page-level React context holds `{ seats, enrollmentType }`. It is mirrored to `?seats=` with `history.replaceState`, and `?seats=` is read on load through `clampSeats`. The calculator, both form instances and Page 2 all use it.

**Accessibility:** the number has `aria-live="polite"` ("{n} seats, total EGP {x}"). The buttons have `aria-label`s and are disabled at the limits.

### 7.2 Form behaviour
- Section 5 defines the structure. Changing the type animates the height (disabled under `prefers-reduced-motion`) and moves focus to the first field of the new set.
- While submitting, the button shows `Saving…`, is disabled and has `aria-busy`. The double-submit guard stays.
- On success the API returns `{ leadId, editToken, seats, quotedTotal }`. Then:
  1. Save to `sessionStorage['copilot_enrollment']` (in try/catch): `{ leadId, editToken, enrollmentType, seats, firstName, companyName, email, paymentPreference, joiningReadiness, copilotLicence, submitterIsParticipant, fullName }`.
  2. Redirect to `/thank-you?diploma=online&seats={n}&lead={leadId}&{attribution}`. No other personal data goes in the URL.
- On a network error or 5xx, show the existing persistence error and keep every value in place.

---

## 8. Page 2 experience (`/thank-you`)

### 8.1 Modes

| Condition | Mode |
|---|---|
| `lead` in the URL **and** the sessionStorage `leadId` matches | **Personal**: greeting, saved changes, all payment paths |
| Otherwise (other device, cleared storage, shared link) | **Generic**: no personal data, seats from `?seats=` (default 1), only "Pay online now" |

### 8.2 Enrollment block (above the existing content)

1. **Eyebrow:** `YOUR ENROLLMENT · COHORT 01 STARTS WED 4 NOV`
2. **Title:**
   - Team: "{FirstName}, here's the plan for {Company}'s team of {n}"
   - Individual: "{FirstName}, your seat is ready"
   - Generic: "Your enrollment"
3. **Context line, chosen by the answers given on the form:**

| Condition | Callout (style) |
|---|---|
| `joiningReadiness = later` | **Info:** "You chose the next cohort. We've saved your details and an advisor will contact you when dates are confirmed. Want to join Cohort 01 instead?" plus a `Switch to Cohort 01` button (PATCH joiningReadiness → `upcoming`). **While this is `later`, the payment block is hidden** and replaced by `Talk to an advisor`. |
| `copilotLicence ∈ {no, none}` | **Warning:** "The course builds run inside Microsoft 365 Copilot, so a licence is needed by the first session (Mon 9 Nov). An advisor will contact you to help. You can still reserve now." The Pay CTA needs an acknowledgment checkbox: "I understand a Microsoft 365 Copilot licence is required." |
| `copilotLicence = some` | **Info:** "Participants without a licence will need one by Mon 9 Nov. An advisor will help you plan this." |
| `copilotLicence = unsure` | **Info:** "Not sure about licences? An advisor will check with you before the cohort starts." |
| `paymentPreference = installments` | **Info**, in the payment block: "Choose **Sympl** at checkout to split the payment with 0% interest." |
| `paymentPreference = enterprise` | The payment path defaults to **Company invoice**, with the copy "Enterprise arrangement: we'll prepare an invoice or work with your purchase order and terms." |

4. **Seat stepper** (1–20) with the upsell hint. Changes update the UI instantly. In personal mode they are also saved with a 600 ms debounce through `PATCH`, and the status shows `Saved`, or `Couldn't save. Retrying…` (3 retries with backoff).
   - Going **down to 1** in team mode shows a confirmation: "Switch to an individual enrollment? Team pricing no longer applies." If confirmed, `enrollmentType` becomes `individual` and participants beyond the submitter are kept but excluded.
   - Going **up from 1** in individual mode switches to `team`. If no company is on file, it asks inline for the company (required) before saving.
5. **Order summary:**
   - Team:
     - `{n} × EGP 30,000`, struck through
     - `Team pricing · {20|25}% off every seat −EGP {savings}`
     - `Per seat EGP {perSeat}`
     - **Total**
   - Individual: `1 × Microsoft Copilot Course EGP 30,000`, then **Total**
6. **Participants** (personal mode, team only):
   - seat dots and "{filled} of {n} participants added"
   - an `Add participants` / `Edit participants` button that opens an inline roster with Full name and Work email per row
   - when the submitter is attending, row 1 is pre-filled, read-only and labelled `You`
   - each row is validated with the fullName and email rules, **including the work-domain rule**; duplicates get "This email is already on the list."
   - `Save participants` sends a PATCH
   - helper: "Optional now. You can send the list after payment too."
   - extra rows above the seat count are marked "Over seat limit" and aren't saved
7. **Payment path** (radio cards):

| value | Shown when | Title | Description | CTA | Action |
|---|---|---|---|---|---|
| `now` | always (unless readiness = later) | Pay online now | Card, Sympl 0% interest installments, Geidea or Instapay. Your seat{s} are confirmed right away. | Pay EGP {total} securely ↗ | PATCH `{paymentPath:"now", checkoutStartedAt}` with `keepalive`, then `InitiateCheckout`, then `location.assign(cartPermalink(n,{leadId,attribution}))` |
| `invoice` | personal mode | Company invoice | Our team sends an invoice in your company's name with the rate locked in, usually within 1 working day. Purchase orders and custom terms welcome. | Request invoice for EGP {total} | PATCH `{paymentPath:"invoice", invoiceRequestedAt}`, then the success panel: "Request received. We'll email {email} within 1 working day." |
| `send` | personal mode | Send to my manager to pay | Share this exact order and payment link with whoever approves it. | Share payment link | Optional field "Manager or finance email". PATCH `{paymentPath:"send", payerEmail}`. `navigator.share({ title: "Microsoft Copilot Course · {n} seat{s} · EGP {total}", url: permalink })`, falling back to clipboard: "Link copied. Paste it in an email or WhatsApp to your manager." A read-only link field and `Copy` button are always shown. |

   Default selection: `invoice` if `paymentPreference = enterprise`, otherwise `now`.

8. Keep the existing note: "You will be able to review your order before completing payment through Meska's secure checkout."
9. The existing thank-you content follows, unchanged.

### 8.3 Robustness
- Clamp out-of-range `seats` silently.
- A PATCH that returns 401 switches to generic mode quietly. Pay still works.
- The Pay CTA is a real `<a href>`, so it works without JavaScript.
- A blocked Pixel (ad blocker) must never block any action. Wrap every `trackEvent` call in a try/catch.

---

## 9. User stories and scenarios (end to end)

Format: **ID · Persona · Path → Expected result**. Each ID needs at least one automated test (unit, API or Playwright) unless it's marked *(manual)*.

### 9.1 Individual, happy paths
- **I-01** · Professional, pays in full · Calculator stays at 1 → Just me → fills all 10 fields with a company email → submits → Page 2 "Mona, your seat is ready", total 30,000 → Pay → Shopify checkout with 1 seat at 30,000. Supabase row: `individual`, status `checkout_started`. Sheet row updated.
- **I-02** · Wants installments · Chooses "0% interest installments via Sympl" → Page 2 shows the Sympl hint → Pay → checkout (they choose Sympl there). Stored `paymentPreference = installments`.
- **I-03** · Next cohort · Chooses "The next cohort" → Page 2 shows the next-cohort callout and no payment block → status stays `lead`. Sales see `later` in the Sheet.
- **I-04** · Next cohort, then changes their mind · I-03 → clicks `Switch to Cohort 01` → the payment block appears → pays.
- **I-05** · No licence · Licence `no` → Page 2 warning → the Pay button stays disabled until the acknowledgment is ticked → pays. Sheet shows the licence `No` for advisor follow-up.
- **I-06** · Unsure about licence · Info callout. Pay works normally.
- **I-07** · Converts to a team on Page 2 · Individual raises seats to 3 → total 72,000, type becomes `team`, the roster appears (company already on file) → pays 72,000.
- **I-08** · Opens the advisor modal instead of `#apply` · Same form and rules. `form_location = modal`.

### 9.2 Team, happy paths
- **T-01** · L&D manager, 3 seats, pays now · Calculator to 3 → "Enroll my team of 3" → My team selected, seats = 3 → fills 10 fields → "Continue with 3 seats" → Page 2 "Mona, here's the plan for Orascom's team of 3" → total 72,000 → Pay → checkout ~~90,000~~ 72,000.
- **T-02** · Crosses into 25% on Page 2 · T-01 with seats raised to 5 on Page 2 → summary shows 25% and 112,500 → `TierUnlocked` fires → PATCH saved → checkout shows 112,500.
- **T-03** · Large team, 8 seats · total 180,000. Checkout matches.
- **T-04** · Enterprise arrangement · Payment preference `enterprise` → Page 2 defaults to Company invoice → request invoice → success panel → status `invoice_requested`. The Sheet row shows `Invoice requested` for sales.
- **T-05** · Needs manager approval · Picks "Send to my manager to pay", enters the finance email → share sheet or link copied → status `payment_link_shared`, `payer_email` stored. The manager opens the link → checkout shows the same total.
- **T-06** · Team lead not attending · Unticks "I'm one of the participants" → the roster has no locked "You" row. Seats count attendees only.
- **T-07** · Adds the participant list before paying · Fills 3 of 6 rows → "3 of 6 participants added" → saved → Sheet "Participants Added = 3" and the participant list filled.
- **T-08** · Sympl installments for a team · `installments` → Sympl hint → pays at checkout with Sympl.
- **T-09** · Team, next cohort · Same as I-03, with team copy.
- **T-10** · Team with partial or no licences · `some` → info callout. `none` → warning and acknowledgment, as in I-05.

### 9.3 Seat-count edge cases
- **S-01** · Team reduces to 1 on Page 2 → confirmation dialog → becomes individual, 30,000.
- **S-02** · Tries to go above 20 → the + button is disabled and the "Talk to an advisor" link shows.
- **S-03** · URL `?seats=0`, `-3`, `abc` or `99` → clamped to 1, 1, 1 and 20.
- **S-04** · Selects "My team" when the calculator is at 1 → seats become 2.
- **S-05** · Reduces seats below the number of roster rows → extra rows are flagged "Over seat limit" and aren't saved.

### 9.4 Validation scenarios
- **V-01** · Gmail, Outlook, Yahoo, iCloud, Hotmail (including country variants like `yahoo.com.eg`) → work-email error. The form doesn't submit.
- **V-02** · Disposable domain (`mailinator.com`) → the existing invalid-email error.
- **V-03** · Placeholder or fake name ("Test User", "asdf qwer") → "Please enter your real full name."
- **V-04** · Mobile `01012345678` → accepted and normalized to `+201012345678`. `0000000000` → rejected. A Saudi number `+966534378723` → accepted.
- **V-05** · LinkedIn `linkedin.com/in/mona-adel` → accepted and normalized. A company page `linkedin.com/company/x` → rejected.
- **V-06** · Company "123" or "test" → "Please enter your real company name."
- **V-07** · Missing selects → the existing select messages. The team licence message differs from the individual one.
- **V-08** · Switching type with errors showing → errors for hidden fields are cleared.
- **V-09** · Client validation bypassed (direct API call) → the API returns 400 with the same field errors.
- **V-10** · Participant row with a Gmail address → the work-email error in that row.
- **V-11** · Duplicate participant emails → inline duplicate error.

### 9.5 Failure and abuse scenarios
- **F-01** · Honeypot filled (bot) → behaviour exactly as today (rejected or silently dropped).
- **F-02** · Double-click submit → only one request and one lead row.
- **F-03** · Network failure on submit → persistence error, values kept, `FormError` with `persistence`.
- **F-04** · Supabase down → the API returns 503 → same as F-03. No partial Sheet row.
- **F-05** · Sheet sync failure → the API still returns 200. The error is logged and retried. The Sheet catches up later.
- **F-06** · Page 2 opened on another device or in incognito → generic mode, only Pay. No personal data shown.
- **F-07** · Edit token tampered → PATCH returns 401 → generic mode.
- **F-08** · Page 2 refreshed → personal mode restored from sessionStorage. Seat count from the URL, which is kept current with `replaceState`.
- **F-09** · Back button from Shopify checkout → Page 2 restores with the same seats. The Pay link still works.
- **F-10** · Abandons at checkout → the row stays `checkout_started` with a timestamp, so sales can follow up from the Sheet.
- **F-11** · Same email submits again → a new lead row is created as today. `repeat_submission = true` if the same email exists in the last 30 days (Section 11).
- **F-12** · Enters a Meska 10% lead code at checkout → Shopify keeps the larger discount. No site handling.
- **F-13** · Ad blocker blocks the Pixel → every action still works.
- **F-14** · JavaScript disabled on Page 2 → the Pay link still opens checkout for the seat count in the URL.
- **F-15** · Seats changed after an invoice was requested → PATCH updates seats and total, and status stays `invoice_requested`. The Sheet shows the new total so the invoice is issued correctly.
- **F-16** · Old cached page sends `joiningReadiness = discuss_upcoming` with no new fields → accepted as an individual lead (backward compatibility).

### 9.6 Analytics scenarios
- **A-01** · The individual flow fires the same existing events as production, plus only the added params.
- **A-02** · Each new event fires according to its de-dup rule (Section 12).
- **A-03** · `InitiateCheckout.value` equals the displayed total for 1, 3, 5 and 8 seats.

---

## 10. Backend and API

### 10.1 `POST /api/copilot-leads` (extend)

New fields in the request body:

```ts
enrollmentType: "individual" | "team"            // default "individual" if absent (old clients)
seats: number                                     // individual → 1; team → 2..20
companyName: string                               // required for new clients (both modes)
jobTitle: string                                  // required for new clients (both modes)
copilotLicence: "yes"|"no"|"unsure"|"all"|"some"|"none"
submitterIsParticipant?: boolean                  // team only; default true
// existing fields unchanged; paymentPreference may now be "enterprise" (team only);
// yearsExperience null for team
```

Server steps:
1. Run the honeypot check exactly as today.
2. `validateCopilotLead(body, { mode: body.enrollmentType ?? "individual", legacy: !("enrollmentType" in body) })`. On failure return `400 { errors }`.
3. Recompute `tierRate`, `pricePerSeat` and `quotedTotal` on the server. Ignore any client-sent price.
4. Generate `editToken = crypto.randomUUID()` and store `sha256(editToken)`.
5. Set `repeat_submission` if a lead with the same email exists from the last 30 days.
6. Insert the row (Section 11). Keep `requestId` idempotency, so a retried request doesn't create a duplicate.
7. Trigger the Sheet sync without blocking the response.
8. Return `200 { leadId: requestId, editToken, seats, quotedTotal }`.

### 10.2 `PATCH /api/copilot-leads/[leadId]` (new)

Body: `{ editToken, seats?, enrollmentType?, companyName?, joiningReadiness?, participants?, paymentPath?, payerEmail?, checkoutStartedAt?, invoiceRequestedAt?, licenceAcknowledged? }`.

1. Compare tokens in constant time. Mismatch → 401, missing lead → 404. Rate limit: 30 requests per minute per lead.
2. Validate every field with the shared validator: participants use the name and work-email rules, `payerEmail` uses the email rules **without** the work-domain rule (finance may use a shared mailbox), and seats use 1–20.
3. If `seats` changes:
   - recompute the pricing columns
   - set `enrollment_type = seats > 1 ? "team" : "individual"`
   - append `{ seats, at }` to `seats_history`, keeping at most 50 entries
4. If participants change: lower-case, de-duplicate by email, cap at the seat count, and set `participants_count`.
5. Map the payment path to a status:
   - `now` → `checkout_started`
   - `invoice` → `invoice_requested`
   - `send` → `payment_link_shared`

   The status never moves backwards from `invoice_requested` or `payment_link_shared` to `lead`.
6. Always set `checkout_url = cartPermalink(seats, { leadId })` and `updated_at = now()`.
7. Trigger the Sheet upsert for this lead.
8. Return `200 { seats, quotedTotal, enrollmentType, participantsCount, status }`.

### 10.3 Security
- The service key stays on the server. Keep RLS as it is.
- Only `lead` (a UUID) goes in URLs. The `editToken` lives only in sessionStorage.
- Log validation failures without personal data: field names only.

---

## 11. Data: Supabase and Google Sheet

### 11.1 Migration (additive only)

Replace `<leads>` with the real table name. Map onto existing columns where they exist (e.g. `email`, `payment_preference`, `joining_readiness`, `years_experience`). If an existing column has a CHECK constraint or enum that blocks `enterprise` or `later`, extend it; never narrow it.

```sql
alter table <leads>
  add column if not exists enrollment_type text not null default 'individual' check (enrollment_type in ('individual','team')),
  add column if not exists seats int not null default 1 check (seats between 1 and 20),
  add column if not exists tier_rate numeric(4,2) not null default 0,
  add column if not exists price_per_seat int not null default 30000,
  add column if not exists quoted_total int not null default 30000,
  add column if not exists company_name text,
  add column if not exists job_title text,
  add column if not exists copilot_licence text check (copilot_licence in ('yes','no','unsure','all','some','none')),
  add column if not exists licence_acknowledged boolean not null default false,
  add column if not exists submitter_is_participant boolean not null default true,
  add column if not exists participants jsonb not null default '[]'::jsonb,
  add column if not exists participants_count int not null default 0,
  add column if not exists seats_history jsonb not null default '[]'::jsonb,
  add column if not exists payment_path text check (payment_path in ('now','invoice','send')),
  add column if not exists payer_email text,
  add column if not exists checkout_url text,
  add column if not exists status text not null default 'lead'
    check (status in ('lead','checkout_started','invoice_requested','payment_link_shared')),
  add column if not exists checkout_started_at timestamptz,
  add column if not exists invoice_requested_at timestamptz,
  add column if not exists repeat_submission boolean not null default false,
  add column if not exists edit_token_hash text,
  add column if not exists updated_at timestamptz not null default now();
-- extend existing payment_preference allowed values with 'enterprise' if constrained
-- updated_at trigger if missing; index on (status), (email, created_at)
```

Apply it with the repo's migration workflow. If the repo can't apply migrations, report a blocker (Section 17) with this SQL.

### 11.2 Field → column → Sheet mapping

**Rule: one Sheet row per lead, keyed by the lead ID, updated in place.** Changes appear within 1 minute. Existing columns keep their positions. New columns are **appended on the right** in this order, with these exact headers:

| # | Sheet header | Column | Format |
|---|---|---|---|
| 1 | Enrollment Type | enrollment_type | Individual / Team |
| 2 | Seats | seats | integer |
| 3 | Discount % | tier_rate×100 | 0 / 20 / 25 |
| 4 | Price per Seat (EGP) | price_per_seat | integer |
| 5 | Total (EGP) | quoted_total | integer |
| 6 | Company | company_name | text |
| 7 | Job Title | job_title | text |
| 8 | Copilot Licence | copilot_licence | Yes / No / Not sure / All / Some / None |
| 9 | Licence Acknowledged | licence_acknowledged | Yes / No |
| 10 | Submitter Attending | submitter_is_participant | Yes / No (team only; empty for individual) |
| 11 | Participants Added | participants_count | integer |
| 12 | Participants | participants | `Name <email>; Name <email>` |
| 13 | Payment Path | payment_path | Pay now / Invoice / Sent to manager / empty |
| 14 | Payer Email | payer_email | text |
| 15 | Status | status | Lead / Checkout started / Invoice requested / Payment link shared |
| 16 | Checkout Link | checkout_url | URL |
| 17 | Checkout Started At | checkout_started_at | `YYYY-MM-DD HH:mm` Africa/Cairo |
| 18 | Invoice Requested At | invoice_requested_at | same |
| 19 | Repeat Submission | repeat_submission | Yes / No |
| 20 | Last Updated | updated_at | same |

Existing columns such as Payment Preference and Joining Readiness keep their place. Their new values are written as human labels:
- `enterprise` → "Enterprise arrangement"
- `installments` → "0% installments (Sympl)"
- `later` → "Next cohort"

Years of Experience is empty for teams.

### 11.3 Sync mechanics
- **(a) Sync in this repo:** extend the row mapper, switch it to **upsert by lead ID**, and retry with backoff. It must never fail the API response.
- **(b) Supabase trigger, Edge Function or webhook:** same changes. Make sure it fires on `UPDATE` as well as `INSERT`.
- **(c) Apps Script pulling from Supabase, outside the repo:**
  1. Create a view `<leads>_sheet_v` with the existing columns in their current order followed by the 20 new formatted columns.
  2. If the script can read the view without being edited, done.
  3. If it can't, report a blocker with the exact Apps Script diff ready to paste.
- Write any missing headers for new columns. Never rewrite existing headers.

### 11.4 Lead lifecycle

```
lead ─ Pay ─► checkout_started
  ├── Invoice ─► invoice_requested
  └── Share ───► payment_link_shared
```

Seats and participants stay editable in every state. Payment confirmation from Shopify is out of scope: sales reconcile through the `lead_id` attribute on Shopify orders.

---

## 12. Meta tracking

### 12.1 Preserve (hard requirement)

List in the PR every `trackEvent(` call and any Conversions API call. Known ones: `FormSubmit`, `FormError`, `PricingView`, `InitiateCheckout`, `VideoPlay`.

- Keep each event's **name, `tracking_id`, `event_id`/`createEventId`, `onceKey`, firing moment and existing params** exactly.
- Only add params. The single intended value change: `InitiateCheckout.value` becomes the real total.
- If a Conversions API mirror exists, send the same added params with the same `event_id`.
- Attribution must still reach `/thank-you` and the Shopify link.
- Keep the existing `data-track-id` values.

### 12.2 Params added to existing events

| Event | Added params |
|---|---|
| FormSubmit | `enrollment_type`, `seats`, `value`, `currency:"EGP"`, `tier`, `payment_preference`, `joining_readiness`, `copilot_licence` |
| FormError | `enrollment_type`, `seats`, `error_fields` (comma-separated field names, no values) |
| InitiateCheckout | `value` = total, `num_items` = seats, `content_ids:["42776902369326"]`, `content_type:"product"`, `enrollment_type`, `tier`, `payment_path:"now"`, `lead_id` |

### 12.3 New events (custom; through `trackEvent`)

| Event | When | Params | De-dup |
|---|---|---|---|
| SeatCalculatorChange | seats unchanged for 800 ms after a change | seats, tier, value, location | onceKey `seats-{location}-{n}` |
| TierUnlocked | first entry into team20 or team25 per session | tier, seats, location | once per tier per session |
| EnrollmentTypeSelected | type card clicked | enrollment_type, seats, form_location | none |
| EnrollmentPageView | Page 2 renders | mode, seats, value, enrollment_type, joining_readiness | once per load |
| ParticipantsSaved | roster saved | seats, participants_count | none |
| PaymentPathSelected | radio change | payment_path, seats, value | none |
| InvoiceRequested | invoice PATCH succeeds | seats, value, currency | onceKey `invoice-{leadId}` |
| PaymentLinkShared | share or copy succeeds | seats, value, method | none |
| CohortSwitched | "Switch to Cohort 01" clicked | seats, enrollment_type | once per lead |

New CTA `data-track-id`s:
- `copilot_seat_calculator_cta`
- `copilot_form_team_continue`
- `copilot_pay_now` (keep `copilot_enrollment` on the Page 2 Pay button as well)
- `copilot_invoice_request`
- `copilot_share_payment_link`

**No Purchase event.** Shopify's Meta channel already sends it.

---

## 13. Responsive design

Build mobile-first. No horizontal page scroll from 320 px up. Side gutter `--page-gutter` (16 px).

| Width | Calculator | Form | Page 2 |
|---|---|---|---|
| 320–479 | full width, total 32 px, tier chips stacked, 44 px buttons | Type cards stacked. **All fields one column.** Selects full width | One column. **Sticky bottom bar** (safe-area aware) with total and primary CTA, shown once the summary scrolls away. Payment cards stacked. Roster rows stack name above email |
| 480–767 | Chips in a row (wrap allowed) | Type cards side by side, fields one column | As above, roster rows side by side |
| 768–1023 | Inside the price card, max width 560 px | Two-column grid for paired fields: name+mobile, email+company, job title+LinkedIn, the select pairs. Seats and the checkbox span both columns | Single column, max width 640 px, centred. No sticky bar |
| ≥1024 | In the price card beside the video, as the layout allows | Same as 768+ inside the existing form card | Two columns: left has the greeting, callouts, stepper, summary and roster; right has the payment block, sticky with `top: 24px` |

Rules:
- Touch targets at least 44×44 px, slider thumb at least 24 px.
- Input font size at least 16 px on mobile (prevents iOS zoom).
- `tabular-nums` on all money values.
- Long company names wrap. Headings use `text-wrap: balance`.
- Visible focus rings everywhere.
- `prefers-reduced-motion` respected.
- Text contrast at least 4.5:1.
- Error messages sit directly under their field and are linked with `aria-describedby`.

**Playwright screenshots (attach to the PR):** at 360×780, 390×844, 768×1024, 1280×800 and 1440×900, capture:
- the calculator at 1, 3 and 6 seats
- the Just me form, empty and with errors
- the My team form, filled
- Page 2 personal team with 6 seats and the roster open
- Page 2 with readiness "later"
- Page 2 with licence "none"
- Page 2 generic

---

## 14. Integration guide (file-by-file)

> Paths are suggestions. Match the repo's structure.

### 14.1 New files
| File | Purpose |
|---|---|
| `lib/pricing/teamPricing.ts` + `.test.ts` | Pricing module (Section 4) |
| `lib/validation/copilotLead.ts` + `.test.ts` | Shared validator. Move the existing rules here unchanged, then add Section 6 |
| `lib/validation/emailDomains.ts` | `PERSONAL_EMAIL_DOMAINS`, `PERSONAL_EMAIL_PATTERNS`, the existing disposable list |
| `components/enrollment/EnrollmentProvider.tsx` | Context `{ seats, setSeats, enrollmentType, setEnrollmentType }`, synced to `?seats=` |
| `components/enrollment/SeatCalculator.tsx` | Section 7.1 |
| `components/enrollment/SeatStepper.tsx` | Shared −/+ control |
| `components/enrollment/EnrollmentTypeToggle.tsx` | The "Who's enrolling?" cards |
| `components/enrollment/EnrollmentPanel.tsx` | Page 2 block (Section 8) |
| `components/enrollment/ParticipantRoster.tsx` | Roster |
| `components/enrollment/PaymentPathPicker.tsx` | Three payment cards and CTA |
| `components/enrollment/StickyCheckoutBar.tsx` | Mobile sticky bar |
| `lib/enrollment/session.ts` | Safe `sessionStorage` read and write |
| `lib/enrollment/api.ts` | Client wrappers for POST and PATCH, with debounce and retry |
| `app/api/copilot-leads/[leadId]/route.ts` | PATCH handler (Section 10.2) |
| `supabase/migrations/<timestamp>_team_enrollment.sql` | Section 11.1 |
| `e2e/enrollment.spec.ts` | Playwright scenarios from Section 9 |

### 14.2 Modified files
| File (find in repo) | Change |
|---|---|
| Course config | Remove the broken `checkoutUrl`. Derive the price fields from the pricing module. Add copy strings |
| Lead form component (rendered at `#apply` and in the modal) | Wrap in the provider. Add the type toggle, the two field sets, the intro, accuracy and next-step copy. Use the shared validator. Send the new fields. Handle the new response, sessionStorage and redirect |
| Price card / closing CTA | Mount `SeatCalculator` |
| `app/api/copilot-leads/route.ts` | Use the shared validator. Accept the new fields. Recompute price. Store the token hash and repeat flag. Return `{ leadId, editToken, … }`. Trigger the Sheet upsert |
| Sheet sync module / trigger / view | Upsert, plus the new columns (Section 11) |
| `/thank-you` page | Mount `EnrollmentPanel` in place of the old price-card CTA. Keep everything below it |
| Tracking helper usage | Add params and new events. Wrap calls in try/catch |
| Global CSS / module CSS | New component styles using the existing tokens |

### 14.3 Build order
1. Discovery report in the PR description (Sections 3.5 and 12.1).
2. Validator extraction with tests proving the existing behaviour is unchanged, then the new rules.
3. Pricing module and tests.
4. Migration, then API POST and PATCH, with tests.
5. Sheet sync (upsert and new columns).
6. Page 1: provider, calculator, form.
7. Page 2: panel, roster, payment paths, callouts.
8. Tracking.
9. Responsive pass, Playwright scenarios and screenshots.
10. One PR with a changelog and evidence.

---

## 15. Testing plan

- **Unit:**
  - pricing (Section 4)
  - validator: every Section 3.2 rule with positive and negative cases, every Section 6 rule, work-domain cases including `yahoo.com.eg` and `hotmail.co.uk`, and the company/job-title placeholders
  - mapping helpers for the Sheet labels
- **API:**
  - POST: individual, team, legacy payload, 400 cases, honeypot, idempotent retry, repeat-submission flag
  - PATCH: 401, 404, seats recompute, team↔individual switch, participants cap and de-dup, status transitions
- **E2E (Playwright):** every story in Section 9 not marked manual, with `fbq` stubbed to capture events and the Shopify navigation intercepted to assert the URL.
- **Visual:** the Section 13 screenshot set.
- **Data:** create a 6-seat team lead in a test run, then show the Supabase row and the matching Sheet row in the PR. Use a clearly marked test company name, and delete or flag the row afterwards if the repo has a test-data convention.

---

## 16. Acceptance criteria

**Forms and validation**
- [ ] Just me shows exactly the 10 fields in Section 5.2, in order, with the exact labels and options.
- [ ] My team shows exactly the 11 items in Section 5.3, in order.
- [ ] Intro, accuracy note and next-step copy appear and change with the type.
- [ ] Personal email domains are rejected in both modes and in the roster, with the exact message.
- [ ] All existing validation rules behave exactly as before (tests prove it).
- [ ] The server rejects invalid payloads with the same messages.

**Pricing and checkout**
- [ ] Every total in Section 1 is correct everywhere it shows. Checkout opens at `/cart/42776902369326:{n}`.
- [ ] No reference to `/checkouts/cn/hWNG…` remains.

**Experience**
- [ ] All Section 9 stories pass.
- [ ] The readiness, licence and payment-preference callouts behave as specified in Section 8.2.

**Data**
- [ ] The Supabase row has every new column correctly filled for individual and team leads.
- [ ] The Google Sheet has one row per lead, new columns appended with the exact headers, updates within 1 minute, and existing columns unchanged.

**Tracking**
- [ ] Existing events are unchanged apart from the added params. New events fire per their rules. `InitiateCheckout.value` equals the total.

**Responsive and accessibility**
- [ ] No horizontal scroll from 320 px. Screenshots are attached. The team flow can be completed with the keyboard only.

**Regression**
- [ ] `/api/copilot-leads/receipt` is unchanged. Lighthouse mobile performance and accessibility don't drop more than 3 points.

---

## 17. Out of scope and blockers

**Out of scope:**
- Shopify changes
- payment webhooks
- automated emails (sales act from the Sheet)
- other products and pages

**Report as a blocker** (state what you found, what's needed, and provide the ready-to-apply SQL or script):
1. The repo can't apply Supabase migrations.
2. The Sheet sync lives outside the repo and can't read the new columns through a view.
3. The lead API doesn't write to Supabase.
