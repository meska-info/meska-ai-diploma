-- Microsoft Copilot Course: additive individual/team enrollment lifecycle.

alter table public.leads
  add column if not exists enrollment_type text not null default 'individual',
  add column if not exists seats integer not null default 1,
  add column if not exists tier_rate numeric(4,2) not null default 0,
  add column if not exists price_per_seat integer not null default 30000,
  add column if not exists quoted_total integer not null default 30000,
  add column if not exists company_name text,
  add column if not exists job_title text,
  add column if not exists copilot_licence text,
  add column if not exists joining_readiness text,
  add column if not exists licence_acknowledged boolean not null default false,
  add column if not exists submitter_is_participant boolean not null default true,
  add column if not exists participants jsonb not null default '[]'::jsonb,
  add column if not exists participants_count integer not null default 0,
  add column if not exists seats_history jsonb not null default '[]'::jsonb,
  add column if not exists payment_path text,
  add column if not exists payer_email text,
  add column if not exists checkout_url text,
  add column if not exists status text not null default 'lead',
  add column if not exists checkout_started_at timestamptz,
  add column if not exists invoice_requested_at timestamptz,
  add column if not exists repeat_submission boolean not null default false,
  add column if not exists edit_token_hash text,
  add column if not exists updated_at timestamptz not null default now();

do $$ begin
  alter table public.leads add constraint leads_enrollment_type_check
    check (enrollment_type in ('individual', 'team')) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.leads add constraint leads_seats_check
    check (seats between 1 and 20) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.leads add constraint leads_copilot_licence_check
    check (copilot_licence is null or copilot_licence in ('yes', 'no', 'unsure', 'all', 'some', 'none')) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.leads add constraint leads_joining_readiness_check
    check (joining_readiness is null or joining_readiness in ('upcoming', 'later', 'discuss_upcoming')) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.leads add constraint leads_payment_path_check
    check (payment_path is null or payment_path in ('now', 'invoice', 'send')) not valid;
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.leads add constraint leads_enrollment_status_check
    check (status in ('lead', 'checkout_started', 'invoice_requested', 'payment_link_shared')) not valid;
exception when duplicate_object then null; end $$;

-- The prior qualification migration constrained this column to full/installments.
alter table public.leads drop constraint if exists leads_payment_preference_check;
alter table public.leads add constraint leads_payment_preference_check
  check (payment_preference is null or payment_preference in ('full', 'installments', 'enterprise')) not valid;

create index if not exists leads_status_idx on public.leads(status);
create index if not exists leads_email_created_at_idx on public.leads(email, created_at desc);

create or replace function public.set_leads_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_leads_updated_at on public.leads;
create trigger set_leads_updated_at
before update on public.leads
for each row execute function public.set_leads_updated_at();

comment on column public.leads.edit_token_hash is
  'SHA-256 hash of the session-only edit token used by the enrollment PATCH and receipt APIs.';
comment on column public.leads.checkout_url is
  'Current Shopify cart permalink recomputed server-side from the persisted seat count.';
