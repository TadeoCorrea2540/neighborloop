-- ============================================================
-- 002 · Security helpers & shared functions
-- These are referenced by triggers (003) and RLS policies (005).
-- All SECURITY DEFINER functions pin search_path to avoid hijacking.
--
-- NOTE: some helpers reference tables created later (003). Postgres validates
-- SQL-function bodies at creation time, so we disable that check here; the
-- table references resolve correctly at runtime (after 003 has run).
-- ============================================================

set check_function_bodies = off;

-- ---------- updated_at trigger helper ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Role checks ----------
-- has_role(): true when the current authenticated user holds the given role.
-- SECURITY DEFINER so it can read user_roles regardless of that table's RLS,
-- while only ever answering about auth.uid() (no parameter for "other user").
create or replace function public.has_role(required_role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = required_role
  );
$$;

-- is_admin(): convenience wrapper used widely in admin-only RLS policies.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role = 'admin'
  );
$$;

-- ---------- Organization membership check ----------
-- is_org_member(): does the current user belong to the org (any member_role)?
-- Used by organizer-scoped RLS (missions, applications, private details).
create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
  );
$$;

-- is_org_manager(): owner/admin only (not coordinator) — for sensitive edits.
create or replace function public.is_org_manager(org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_members m
    where m.organization_id = org_id
      and m.user_id = auth.uid()
      and m.member_role in ('owner', 'admin')
  );
$$;

-- Lock down execution to app roles (defense in depth).
revoke all on function public.has_role(app_role) from public;
revoke all on function public.is_admin() from public;
revoke all on function public.is_org_member(uuid) from public;
revoke all on function public.is_org_manager(uuid) from public;
grant execute on function public.has_role(app_role) to anon, authenticated;
grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.is_org_member(uuid) to anon, authenticated;
grant execute on function public.is_org_manager(uuid) to anon, authenticated;
