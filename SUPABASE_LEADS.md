# Supabase lead persistence

The Phase 2 form posts only to `POST /api/leads`. The route validates and length-limits the payload, rejects the honeypot, allow-lists diploma/source/attribution values, and writes to Supabase using server-only credentials.

Required server environment variables:

```text
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
```

Never expose the service-role key through a `NEXT_PUBLIC_` variable. Apply `supabase/schema.sql` to the selected Supabase project, then configure both variables in Vercel Preview and Production. The browser receives only an accepted/error response and never receives Supabase credentials.

`request_id` is unique and supports safe retry/deduplication. `diploma_slug` supports Offline/Online today and is the routing field for future per-diploma Google Sheets. Supabase remains the source of truth; the spreadsheet destination must not be invented and is intentionally pending.
