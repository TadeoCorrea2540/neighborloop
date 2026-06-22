-- ============================================================
-- 011 · Mission spot counts (read-only aggregate)
--
-- Volunteers can't read other volunteers' applications (RLS), so they can't
-- count approved applicants to compute "spots left". This SECURITY DEFINER
-- aggregate exposes ONLY a count per PUBLISHED mission — no PII, no per-person
-- rows, no statuses other than the approved tally. Capacity is already public,
-- so revealing "how full" a public mission is discloses nothing new.
--
-- It does NOT grant any read on the applications table; RLS there is untouched.
-- ============================================================

set check_function_bodies = off;

create or replace function public.get_mission_spot_counts(p_mission_ids uuid[])
returns table (mission_id uuid, approved_count integer)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select a.mission_id, count(*)::int as approved_count
  from public.applications a
  join public.missions m on m.id = a.mission_id
  where a.mission_id = any(p_mission_ids)
    and a.status = 'approved'
    and m.status = 'published'   -- never disclose counts for non-public missions
  group by a.mission_id;
$$;

-- Safe to expose: published-only, aggregate-only. Make the grant explicit.
revoke all on function public.get_mission_spot_counts(uuid[]) from public;
grant execute on function public.get_mission_spot_counts(uuid[]) to anon, authenticated;
