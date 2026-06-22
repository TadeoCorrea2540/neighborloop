-- ============================================================
-- 009 · Auth provisioning — profile + role for every new auth user
--
-- SECURITY MODEL:
--   * Roles are assigned ONLY here, via SECURITY DEFINER, because user_roles
--     INSERT RLS requires is_admin() (a signing-up user can never self-assign).
--   * The selected_role from signup metadata is WHITELISTED to volunteer|organizer.
--     Anything else — including 'admin' — collapses to 'volunteer'. This is the
--     entire admin-escalation defense; raw metadata is attacker-controlled.
--   * search_path is pinned on every definer function (no escalation surface).
--
-- Functions reference columns added in 008; check_function_bodies is disabled
-- so creation order never matters.
-- ============================================================

set check_function_bodies = off;

-- Safely convert a jsonb array field to text[] ('{}' when missing/not an array).
create or replace function public.jsonb_text_array(data jsonb, key text)
returns text[]
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when data is null or jsonb_typeof(data -> key) is distinct from 'array'
      then '{}'::text[]
    else array(select jsonb_array_elements_text(data -> key))
  end;
$$;

-- Shared provisioning: upsert the profile, then assign ONE whitelisted role.
-- Idempotent; safe to run from both the signup trigger and the self-heal RPC.
create or replace function public.provision_user(p_user uuid, p_meta jsonb)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_role text;
begin
  insert into public.profiles (
    id, display_name, full_name, bio, city, region, country_code,
    interests, skills, availability, education_level, volunteer_experience,
    transport, referral_source, is_profile_public
  )
  values (
    p_user,
    coalesce(nullif(p_meta->>'display_name', ''), 'New neighbor'),
    nullif(p_meta->>'full_name', ''),
    nullif(p_meta->>'bio', ''),
    nullif(p_meta->>'city', ''),
    nullif(p_meta->>'region', ''),
    nullif(p_meta->>'country_code', ''),
    public.jsonb_text_array(p_meta, 'interests'),
    public.jsonb_text_array(p_meta, 'skills'),
    public.jsonb_text_array(p_meta, 'availability'),
    nullif(p_meta->>'education_level', ''),
    nullif(p_meta->>'volunteer_experience', ''),
    nullif(p_meta->>'transport', ''),
    nullif(p_meta->>'referral_source', ''),
    coalesce((p_meta->>'is_profile_public')::boolean, true)
  )
  on conflict (id) do nothing;

  -- WHITELIST: only volunteer|organizer survive; everything else → volunteer.
  v_role := lower(coalesce(p_meta->>'selected_role', ''));
  if v_role not in ('volunteer', 'organizer') then
    v_role := 'volunteer';
  end if;

  insert into public.user_roles (user_id, role)
  values (p_user, v_role::app_role)
  on conflict (user_id, role) do nothing;
end;
$$;

revoke all on function public.provision_user(uuid, jsonb) from public;

-- Trigger: provision at signup (auth.users insert), before email confirmation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  perform public.provision_user(new.id, coalesce(new.raw_user_meta_data, '{}'::jsonb));
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Self-heal fallback for the current authenticated user. Called by /auth/confirm
-- after a successful email verification. Keys on auth.uid() + JWT metadata, with
-- the same whitelist, so it can never escalate.
create or replace function public.ensure_user_provisioned()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.uid() is null then
    return;
  end if;
  perform public.provision_user(auth.uid(), coalesce(auth.jwt() -> 'user_metadata', '{}'::jsonb));
end;
$$;

revoke all on function public.ensure_user_provisioned() from public;
grant execute on function public.ensure_user_provisioned() to authenticated;
