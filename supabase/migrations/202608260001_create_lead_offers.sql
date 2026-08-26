-- Meska Diploma: durable Shopify offer and WhatsApp delivery state.

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

-- Atomically reserves one lead for one workflow execution. The reservation
-- prevents concurrent webhook deliveries from creating multiple Shopify codes.
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
