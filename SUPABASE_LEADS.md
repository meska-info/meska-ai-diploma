# Supabase lead persistence

The Phase 2 form posts only to `POST /api/leads`. The route validates and length-limits the payload, rejects the honeypot, allow-lists diploma/source/attribution values, and writes to Supabase using server-only credentials.

Required server environment variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Never expose the service-role key through a `NEXT_PUBLIC_` variable. Apply `supabase/schema.sql` to the selected Supabase project, then configure both variables in Vercel Preview and Production. The browser receives only an accepted/error response and never receives Supabase credentials.

`request_id` is unique and supports safe retry/deduplication. `diploma_slug` routes to the configured Offline/Online Google Sheet. The backward-compatible enquiry migration adds LinkedIn profile, experience, payment readiness, displayed price, wave context, and start timing while preserving all existing rows and the original A:N sheet mapping; new sheet columns are appended at O:V.
