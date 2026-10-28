create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique,
  name text not null,
  email text not null,
  mobile text not null,
  linkedin_url text,
  years_experience text,
  payment_preference text,
  programme_price text,
  programme_price_value integer,
  current_wave text,
  current_wave_start_date text,
  start_timing text,
  diploma_slug text not null check (diploma_slug in ('offline', 'online')),
  lead_source text not null,
  source_context text not null check (source_context in ('primary', 'modal')),
  attribution jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

comment on table public.leads is
  'Server-written source of truth for Meska diploma enquiries synchronized to Google Sheets.';

create table if not exists public.lead_offers (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads(id) on delete cascade,
  shopify_discount_id text,
  discount_code text,
  discount_percent numeric(5,2) not null default 15.00,
  starts_at timestamptz,
  expires_at timestamptz,
  status text not null default 'pending'
    check (
      status in (
        'pending',
        'shopify_created',
        'whatsapp_sent',
        'failed',
        'redeemed',
        'expired'
      )
    ),
  cequens_message_id text,
  whatsapp_sent_at timestamptz,
  redeemed_at timestamptz,
  last_error text,
  processing_token text,
  processing_started_at timestamptz,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lead_offers_lead_id_key unique (lead_id),
  constraint lead_offers_discount_code_key unique (discount_code)
);

alter table public.lead_offers
  add column if not exists processing_token text,
  add column if not exists processing_started_at timestamptz,
  add column if not exists attempt_count integer not null default 0;

create index if not exists lead_offers_status_idx
  on public.lead_offers(status);

create index if not exists lead_offers_expires_at_idx
  on public.lead_offers(expires_at);

alter table public.lead_offers enable row level security;

revoke all on table public.lead_offers from anon, authenticated;
grant select, insert, update, delete on table public.lead_offers to service_role;

comment on table public.lead_offers is
  'Server-only Shopify discount and WhatsApp delivery state for Meska diploma leads.';

create or replace function public.claim_lead_offer(
  p_lead_id uuid,
  p_discount_code text,
  p_discount_percent numeric,
  p_starts_at timestamptz,
  p_expires_at timestamptz,
  p_claim_token text
) returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_offer public.lead_offers%rowtype;
  v_action text;
  v_claimed boolean := false;
begin
  insert into public.lead_offers (
    lead_id,
    discount_code,
    discount_percent,
    starts_at,
    expires_at,
    status
  ) values (
    p_lead_id,
    p_discount_code,
    p_discount_percent,
    p_starts_at,
    p_expires_at,
    'pending'
  )
  on conflict (lead_id) do nothing;

  select *
    into v_offer
    from public.lead_offers
   where lead_id = p_lead_id
   for update;

  if v_offer.status = 'whatsapp_sent' then
    v_action := 'already_sent';
  elsif v_offer.shopify_discount_id is not null
    and v_offer.expires_at is not null
    and v_offer.expires_at <= now() then
    update public.lead_offers
       set status = 'expired',
           processing_token = null,
           processing_started_at = null,
           updated_at = now()
     where lead_id = p_lead_id
     returning * into v_offer;
    v_action := 'expired';
  elsif v_offer.processing_token is not null
    and v_offer.processing_token <> p_claim_token
    and v_offer.processing_started_at > now() - interval '5 minutes' then
    v_action := 'processing';
  else
    if v_offer.shopify_discount_id is null
      and (v_offer.expires_at is null or v_offer.expires_at <= now()) then
      update public.lead_offers
         set starts_at = p_starts_at,
             expires_at = p_expires_at,
             discount_percent = p_discount_percent,
             status = 'pending',
             last_error = null,
             updated_at = now()
       where lead_id = p_lead_id;
    end if;

    update public.lead_offers
       set processing_token = p_claim_token,
           processing_started_at = now(),
           attempt_count = attempt_count + 1,
           updated_at = now()
     where lead_id = p_lead_id
     returning * into v_offer;

    v_claimed := true;
    if v_offer.shopify_discount_id is not null
      and v_offer.discount_code is not null then
      v_action := 'resume_whatsapp';
    else
      v_action := 'create_or_recover_shopify';
    end if;
  end if;

  return jsonb_build_object(
    'claimed', v_claimed,
    'action', v_action,
    'offer', to_jsonb(v_offer)
  );
end;
$$;

create or replace function public.fail_lead_offer_claim(
  p_lead_id uuid,
  p_claim_token text,
  p_error text
) returns void
language sql
security definer
set search_path = public
as $$
  update public.lead_offers
     set status = case
           when shopify_discount_id is null then 'failed'
           else status
         end,
         last_error = left(p_error, 2000),
         processing_token = null,
         processing_started_at = null,
         updated_at = now()
   where lead_id = p_lead_id
     and processing_token = p_claim_token
     and status <> 'whatsapp_sent';
$$;

revoke all on function public.claim_lead_offer(uuid, text, numeric, timestamptz, timestamptz, text)
  from public, anon, authenticated;
revoke all on function public.fail_lead_offer_claim(uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.claim_lead_offer(uuid, text, numeric, timestamptz, timestamptz, text)
  to service_role;
grant execute on function public.fail_lead_offer_claim(uuid, text, text)
  to service_role;

-- Lead pipeline status (see migrations/20261028_lead_pipeline_status.sql)

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

