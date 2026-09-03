alter table public.leads
  add column if not exists linkedin_url text,
  add column if not exists years_experience text,
  add column if not exists payment_preference text,
  add column if not exists programme_price text,
  add column if not exists programme_price_value integer,
  add column if not exists current_wave text,
  add column if not exists current_wave_start_date text,
  add column if not exists start_timing text;

alter table public.leads
  add constraint leads_years_experience_check
    check (years_experience is null or years_experience in ('0–2 years', '3–6 years', '7–10 years', '10+ years')) not valid,
  add constraint leads_payment_preference_check
    check (payment_preference is null or payment_preference in ('full', 'installments')) not valid,
  add constraint leads_start_timing_check
    check (start_timing is null or start_timing in ('current_wave', 'later_wave')) not valid;

comment on column public.leads.linkedin_url is 'Normalized structural LinkedIn personal-profile URL.';
comment on column public.leads.programme_price is 'Price context displayed when the enquiry was submitted.';
