-- Diploma lead pipeline: LinkedIn formats, spam flag, delivery status for
-- Google Sheets / Meta Conversions API / n8n, and non-PII pipeline events.
-- Additive and idempotent. Existing leads are marked 'legacy' so the retry
-- job never re-sends historical rows.

alter table public.leads
  add column if not exists linkedin_url_raw text,
  add column if not exists linkedin_kind text,
  add column if not exists suspected_spam boolean not null default false,
  add column if not exists capi_context jsonb,
  add column if not exists sheet_sync_status text not null default 'legacy',
  add column if not exists sheet_sync_attempts integer not null default 0,
  add column if not exists sheet_synced_at timestamptz,
  add column if not exists sheet_sync_error text,
  add column if not exists capi_status text not null default 'legacy',
  add column if not exists capi_attempts integer not null default 0,
  add column if not exists capi_sent_at timestamptz,
  add column if not exists capi_error text,
  add column if not exists n8n_status text,
  add column if not exists n8n_error text;

-- New leads start as pending (existing rows keep 'legacy').
alter table public.leads alter column sheet_sync_status set default 'pending';
alter table public.leads alter column capi_status set default 'pending';

do $$ begin
  alter table public.leads add constraint leads_linkedin_kind_check
    check (linkedin_kind is null or linkedin_kind in ('profile', 'pub', 'short'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.leads add constraint leads_sheet_sync_status_check
    check (sheet_sync_status in ('legacy', 'pending', 'retrying', 'synced', 'failed'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.leads add constraint leads_capi_status_check
    check (capi_status in ('legacy', 'pending', 'retrying', 'sent', 'failed'));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.leads add constraint leads_n8n_status_check
    check (n8n_status is null or n8n_status in ('sent', 'failed'));
exception when duplicate_object then null; end $$;

create index if not exists leads_sheet_sync_pending_idx
  on public.leads (created_at)
  where sheet_sync_status in ('pending', 'retrying');

create index if not exists leads_capi_pending_idx
  on public.leads (created_at)
  where capi_status in ('pending', 'retrying');

comment on column public.leads.linkedin_url is 'Normalised LinkedIn profile link (profile, legacy /pub/ or lnkd.in short link).';
comment on column public.leads.linkedin_url_raw is 'LinkedIn link exactly as typed.';
comment on column public.leads.linkedin_kind is 'profile | pub | short (lnkd.in links can point anywhere; sales checks them).';
comment on column public.leads.suspected_spam is 'Repeated or sequential phone digits — flagged for review, never blocked.';
comment on column public.leads.capi_context is 'Browser context for the server-side Meta Lead (fbp, fbc, user agent, page URL; IP removed after 7 days).';

create table if not exists public.lead_pipeline_events (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  kind text not null,
  code text not null,
  detail jsonb not null default '{}'::jsonb
);

create index if not exists lead_pipeline_events_kind_created_idx
  on public.lead_pipeline_events (kind, created_at);

alter table public.lead_pipeline_events enable row level security;
revoke all on table public.lead_pipeline_events from anon, authenticated;
grant select, insert on table public.lead_pipeline_events to service_role;

comment on table public.lead_pipeline_events is
  'Non-PII lead pipeline events: rejected requests, content drift, daily health checks.';

create or replace function public.purge_lead_capi_ip()
returns integer
language sql
security definer
set search_path = public
as $$
  with purged as (
    update public.leads
       set capi_context = capi_context - 'client_ip_address'
     where created_at < now() - interval '7 days'
       and capi_context ? 'client_ip_address'
    returning 1
  )
  select count(*)::integer from purged;
$$;

revoke all on function public.purge_lead_capi_ip() from public, anon, authenticated;
grant execute on function public.purge_lead_capi_ip() to service_role;

notify pgrst, 'reload schema';
