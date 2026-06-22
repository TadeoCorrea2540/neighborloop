-- ============================================================
-- 008 · Profile fields for the volunteer onboarding form
--
-- Adds NON-PII columns the signup form collects. Causes map to the existing
-- `interests` column. Deliberately NOT stored (PII per project privacy rule):
-- phone number, exact age, email (email lives in Supabase Auth only).
-- Idempotent via IF NOT EXISTS.
-- ============================================================

alter table public.profiles
  add column if not exists region               text,
  add column if not exists skills               text[] not null default '{}',
  add column if not exists availability         text[] not null default '{}',
  add column if not exists education_level      text,
  add column if not exists volunteer_experience text,
  add column if not exists transport            text,
  add column if not exists referral_source      text;

comment on column public.profiles.skills is 'Self-reported volunteer skills (non-PII).';
comment on column public.profiles.availability is 'Self-reported availability windows (non-PII).';
