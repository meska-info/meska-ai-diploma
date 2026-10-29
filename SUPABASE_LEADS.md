# Supabase lead persistence

The Phase 2 form posts only to `POST /api/leads`. The route validates and length-limits the payload, logs (never rejects) an autofilled honeypot field as `honeypot_autofill_ignored`, allow-lists diploma/source/attribution values, and writes to Supabase using server-only credentials.

Required server environment variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Never expose the service-role key through a `NEXT_PUBLIC_` variable. Apply `supabase/schema.sql` to the selected Supabase project, then configure both variables in Vercel Preview and Production. The browser receives only an accepted/error response and never receives Supabase credentials.

`request_id` is unique and supports safe retry/deduplication. `diploma_slug` routes to the configured Offline/Online Google Sheet. The backward-compatible enquiry migration adds LinkedIn profile, experience, payment readiness, displayed price, wave context, and start timing while preserving all existing rows and the original A:N sheet mapping; new sheet columns are appended at O:V.


## Lead pipeline status (migration `20261028_lead_pipeline_status.sql`)

- LinkedIn: `linkedin_url` (normalised), `linkedin_url_raw` (as typed), `linkedin_kind` (`profile | pub | short`). LinkedIn stays required; every real profile link format is accepted (www., m., country subdomains, lnkd.in, legacy /pub/).
- `suspected_spam`: repeated or sequential phone digits are flagged for review instead of blocked.
- `mobile` is always stored as `+<country><number>`: Arabic digits and Egyptian numbers typed as 01…, 1…, 20…, 0020… or +20… become `+201XXXXXXXXX` (29 Oct 2026, same rules as Copilot).
- Delivery status: `sheet_sync_status` / `sheet_sync_attempts` / `sheet_synced_at` / `sheet_sync_error`, `capi_status` / `capi_attempts` / `capi_sent_at` / `capi_error` / `capi_context`, `n8n_status` / `n8n_error`. Rows that existed before the migration are `legacy` and never re-sent.
- `lead_pipeline_events`: non-PII events — rejected requests, `content_drift`, daily `health_check` reports.
- `purge_lead_capi_ip()`: removes raw IP addresses older than 7 days (run by the lead-sync job).

The lead API tolerates a database without this migration (the lead is saved without the new columns), but the migration must be applied for status tracking and retries.

Programme facts (price, wave, start date, lead magnet) are read from `app/content.ts` by both the form and the API. A mismatch never rejects a lead: the current content values are stored and the mismatch is logged as `content_drift`.

## Google Sheets layout

`Sheet1` columns A:O are unchanged. Column P is `linkedin_url`, column Q is `linkedin_kind` (LinkedIn type), and R:X hold `years_experience`, `payment_preference`, `programme_price`, `programme_price_value`, `current_wave`, `current_wave_start_date`, `start_timing`. The first lead-sync job run inserts column Q into existing sheets (a whole-column insert, so existing rows and any sales-team columns shift together). Until then, rows keep the previous A:W layout.

## Scheduled jobs (`vercel.json`)

- `/api/cron/lead-sync` every 5 minutes: retries Sheet syncs (max 12 attempts, 14 days) and server Leads, keeps the Sheet layout current, purges old IPs.
- `/api/cron/pipeline-health` daily 06:00 UTC: counts saved leads, failed/stuck Sheet syncs, failed/stuck server Leads, n8n failures, rejected requests and content drift over 24 h; logs problems as errors, stores the report in `lead_pipeline_events`, and posts it to `PIPELINE_ALERT_WEBHOOK_URL` (an n8n webhook, optional `PIPELINE_ALERT_WEBHOOK_SECRET`) when set.
- Both accept `Authorization: Bearer $CRON_SECRET` when `CRON_SECRET` is set; otherwise only Vercel's cron user agent. Both are idempotent.
