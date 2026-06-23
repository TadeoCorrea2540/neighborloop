-- ============================================================
-- 019 · Public impact aggregates (read-only, no PII)
--
-- Anonymous visitors cannot read attendance_records / certificates (RLS = own
-- OR org-member OR admin), so they cannot compute an organization's public
-- impact. These SECURITY DEFINER aggregates expose ONLY totals — no names, no
-- per-volunteer rows, no per-record detail. Gated on organizations.is_public and
-- published/closed missions only, exactly like get_mission_spot_counts (011).
--
-- They grant NO row read on the underlying tables; RLS there is untouched.
-- ============================================================

set check_function_bodies = off;

-- ---------- per-organization public impact ----------
create or replace function public.get_public_organization_impact(p_organization_id uuid)
returns table (
  missions_hosted     integer,
  volunteer_hours     numeric,
  certificates_issued integer,
  unique_volunteers   integer,
  causes_supported    integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with org as (
    select id from public.organizations
    where id = p_organization_id and is_public = true
  ),
  pub_missions as (
    select m.id, m.category_id
    from public.missions m
    join org on org.id = m.organization_id
    where m.status in ('published', 'closed')
  ),
  done as (
    select a.volunteer_id, a.hours_credited
    from public.attendance_records a
    join pub_missions pm on pm.id = a.mission_id
    where a.status = 'completed'
  )
  select
    (select count(*)::int from pub_missions),
    coalesce((select sum(hours_credited) from done), 0)::numeric,
    coalesce((select count(*)::int
                from public.certificates c
                join pub_missions pm on pm.id = c.mission_id), 0),
    coalesce((select count(distinct volunteer_id)::int from done), 0),
    coalesce((select count(distinct category_id)::int
                from pub_missions where category_id is not null), 0)
  where exists (select 1 from org);
$$;

-- ---------- platform-wide public impact ----------
create or replace function public.get_public_platform_impact()
returns table (
  organizations_active integer,
  missions_hosted      integer,
  volunteer_hours      numeric,
  certificates_issued  integer,
  unique_volunteers    integer
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with pub_missions as (
    select m.id, m.organization_id
    from public.missions m
    join public.organizations o on o.id = m.organization_id
    where o.is_public = true and m.status in ('published', 'closed')
  ),
  done as (
    select a.volunteer_id, a.hours_credited
    from public.attendance_records a
    join pub_missions pm on pm.id = a.mission_id
    where a.status = 'completed'
  )
  select
    coalesce((select count(distinct organization_id)::int from pub_missions), 0),
    (select count(*)::int from pub_missions),
    coalesce((select sum(hours_credited) from done), 0)::numeric,
    coalesce((select count(*)::int
                from public.certificates c
                join pub_missions pm on pm.id = c.mission_id), 0),
    coalesce((select count(distinct volunteer_id)::int from done), 0);
$$;

-- Safe to expose: aggregate-only, public-org + published/closed only.
revoke all on function public.get_public_organization_impact(uuid) from public;
revoke all on function public.get_public_platform_impact() from public;
grant execute on function public.get_public_organization_impact(uuid) to anon, authenticated;
grant execute on function public.get_public_platform_impact() to anon, authenticated;
