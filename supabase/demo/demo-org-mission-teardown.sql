-- ============================================================
-- demo-org-mission-teardown.sql · Remove the demo org + mission
--
-- Deletes ONLY the rows created by demo-org-mission.sql. It does NOT delete the
-- auth user or its profile — remove the auth user yourself in
-- Dashboard → Authentication → Users if you want it gone (its profile cascades).
--
-- Run in: Supabase Dashboard → SQL Editor. Idempotent.
-- ============================================================

do $$
declare
  v_org uuid;
begin
  select id into v_org from public.organizations where slug = 'greenroots-demo';
  if v_org is null then
    raise notice 'No demo org found (slug greenroots-demo) — nothing to remove.';
    return;
  end if;

  -- Mission first (FK to org), then members, then the org.
  delete from public.missions where slug = 'community-garden-planting-demo';
  delete from public.organization_members where organization_id = v_org;
  delete from public.organizations where id = v_org;

  raise notice 'Demo org % and its mission removed. Profile/auth user left intact.', v_org;
end $$;
