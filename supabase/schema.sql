create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  request_id text not null unique,
  name text not null,
  email text not null,
  mobile text not null,
  diploma_slug text not null check (diploma_slug in ('offline', 'online')),
  lead_source text not null,
  source_context text not null check (source_context in ('primary', 'modal')),
  attribution jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.leads enable row level security;

comment on table public.leads is
  'Server-written source of truth for Meska diploma lead magnets. Future Google Sheets sync should read from this table.';
