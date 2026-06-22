-- ============================================================
-- 005 · Row Level Security policies
-- RLS is enabled on EVERY table. Default-deny: a table with RLS on
-- and no matching policy grants nothing. Public reads target anon +
-- authenticated; owner/admin writes target authenticated.
-- See docs/rls-policy-matrix.md for the table-by-table rationale.
-- ============================================================

-- ---------- enable RLS everywhere ----------
alter table public.profiles                  enable row level security;
alter table public.user_roles                enable row level security;
alter table public.mission_categories        enable row level security;
alter table public.organizations             enable row level security;
alter table public.organization_members      enable row level security;
alter table public.organization_verifications enable row level security;
alter table public.missions                  enable row level security;
alter table public.mission_private_details   enable row level security;
alter table public.applications              enable row level security;
alter table public.saved_missions           enable row level security;
alter table public.reports                   enable row level security;
alter table public.audit_events              enable row level security;

-- ============================================================
-- profiles
-- ============================================================
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to anon, authenticated
  using (is_profile_public or id = auth.uid() or public.is_admin());

drop policy if exists profiles_insert_self on public.profiles;
create policy profiles_insert_self on public.profiles
  for insert to authenticated
  with check (id = auth.uid());

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

-- ============================================================
-- user_roles  (users may READ own; only admins may write)
-- ============================================================
drop policy if exists user_roles_select on public.user_roles;
create policy user_roles_select on public.user_roles
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists user_roles_admin_insert on public.user_roles;
create policy user_roles_admin_insert on public.user_roles
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists user_roles_admin_update on public.user_roles;
create policy user_roles_admin_update on public.user_roles
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists user_roles_admin_delete on public.user_roles;
create policy user_roles_admin_delete on public.user_roles
  for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- mission_categories  (public read; admin write)
-- ============================================================
drop policy if exists categories_select on public.mission_categories;
create policy categories_select on public.mission_categories
  for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists categories_admin_write on public.mission_categories;
create policy categories_admin_write on public.mission_categories
  for all to authenticated
  using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- organizations  (public read of public orgs; managers/admin write)
-- verification_status / verification_note are guarded by a trigger so
-- organizers cannot self-verify.
-- ============================================================
drop policy if exists organizations_select on public.organizations;
create policy organizations_select on public.organizations
  for select to anon, authenticated
  using (is_public or public.is_org_member(id) or public.is_admin());

drop policy if exists organizations_insert on public.organizations;
create policy organizations_insert on public.organizations
  for insert to authenticated
  with check (owner_id = auth.uid());

drop policy if exists organizations_update on public.organizations;
create policy organizations_update on public.organizations
  for update to authenticated
  using (public.is_org_manager(id) or public.is_admin())
  with check (public.is_org_manager(id) or public.is_admin());

drop policy if exists organizations_delete on public.organizations;
create policy organizations_delete on public.organizations
  for delete to authenticated
  using (public.is_org_manager(id) or public.is_admin());

-- Trigger: block non-admins from changing verification fields.
create or replace function public.guard_org_verification_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.verification_status is distinct from old.verification_status
      or new.verification_note is distinct from old.verification_note)
     and not public.is_admin() then
    raise exception 'verification fields can only be changed by an administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_org_verification on public.organizations;
create trigger trg_guard_org_verification
  before update on public.organizations
  for each row execute function public.guard_org_verification_fields();

-- ============================================================
-- organization_members  (members read; managers/admin manage;
-- the owner may insert their own initial 'owner' row)
-- ============================================================
drop policy if exists org_members_select on public.organization_members;
create policy org_members_select on public.organization_members
  for select to authenticated
  using (public.is_org_member(organization_id) or public.is_admin());

drop policy if exists org_members_insert on public.organization_members;
create policy org_members_insert on public.organization_members
  for insert to authenticated
  with check (
    public.is_org_manager(organization_id)
    or public.is_admin()
    or (
      user_id = auth.uid()
      and member_role = 'owner'
      and exists (
        select 1 from public.organizations o
        where o.id = organization_id and o.owner_id = auth.uid()
      )
    )
  );

drop policy if exists org_members_update on public.organization_members;
create policy org_members_update on public.organization_members
  for update to authenticated
  using (public.is_org_manager(organization_id) or public.is_admin())
  with check (public.is_org_manager(organization_id) or public.is_admin());

drop policy if exists org_members_delete on public.organization_members;
create policy org_members_delete on public.organization_members
  for delete to authenticated
  using (public.is_org_manager(organization_id) or public.is_admin());

-- ============================================================
-- organization_verifications  (ADMIN-ONLY read → internal_note never
-- leaks; managers may submit. Org status is read via organizations.)
-- ============================================================
drop policy if exists org_verif_select_admin on public.organization_verifications;
create policy org_verif_select_admin on public.organization_verifications
  for select to authenticated
  using (public.is_admin());

drop policy if exists org_verif_insert on public.organization_verifications;
create policy org_verif_insert on public.organization_verifications
  for insert to authenticated
  with check (
    submitted_by = auth.uid()
    and (public.is_org_manager(organization_id) or public.is_admin())
  );

drop policy if exists org_verif_update_admin on public.organization_verifications;
create policy org_verif_update_admin on public.organization_verifications
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists org_verif_delete_admin on public.organization_verifications;
create policy org_verif_delete_admin on public.organization_verifications
  for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- missions  (public read of PUBLISHED missions from public orgs;
-- org members see all their org's missions; managers/admin write)
-- ============================================================
drop policy if exists missions_select on public.missions;
create policy missions_select on public.missions
  for select to anon, authenticated
  using (
    (
      status = 'published'
      and exists (
        select 1 from public.organizations o
        where o.id = organization_id and o.is_public
      )
    )
    or public.is_org_member(organization_id)
    or public.is_admin()
  );

drop policy if exists missions_insert on public.missions;
create policy missions_insert on public.missions
  for insert to authenticated
  with check (public.is_org_manager(organization_id) or public.is_admin());

drop policy if exists missions_update on public.missions;
create policy missions_update on public.missions
  for update to authenticated
  using (public.is_org_manager(organization_id) or public.is_admin())
  with check (public.is_org_manager(organization_id) or public.is_admin());

drop policy if exists missions_delete on public.missions;
create policy missions_delete on public.missions
  for delete to authenticated
  using (public.is_org_manager(organization_id) or public.is_admin());

-- ============================================================
-- mission_private_details  (NEVER public. Org members + admin now;
-- approved-volunteer read is PENDING Phase 4 — see matrix.)
-- ============================================================
drop policy if exists mpd_select on public.mission_private_details;
create policy mpd_select on public.mission_private_details
  for select to authenticated
  using (
    exists (
      select 1 from public.missions m
      where m.id = mission_id and public.is_org_member(m.organization_id)
    )
    or public.is_admin()
  );

drop policy if exists mpd_write on public.mission_private_details;
create policy mpd_write on public.mission_private_details
  for all to authenticated
  using (
    exists (
      select 1 from public.missions m
      where m.id = mission_id and public.is_org_manager(m.organization_id)
    )
    or public.is_admin()
  )
  with check (
    exists (
      select 1 from public.missions m
      where m.id = mission_id and public.is_org_manager(m.organization_id)
    )
    or public.is_admin()
  );

-- ============================================================
-- applications  (volunteer sees own; org members see their missions';
-- volunteers apply as themselves to published missions)
-- NOTE: organizer_note column privacy from volunteers is enforced at the
-- data-access layer in Phase 2; Phase 4 may split it into a private table.
-- ============================================================
drop policy if exists applications_select on public.applications;
create policy applications_select on public.applications
  for select to authenticated
  using (
    volunteer_id = auth.uid()
    or exists (
      select 1 from public.missions m
      where m.id = mission_id and public.is_org_member(m.organization_id)
    )
    or public.is_admin()
  );

drop policy if exists applications_insert_self on public.applications;
create policy applications_insert_self on public.applications
  for insert to authenticated
  with check (
    volunteer_id = auth.uid()
    and exists (
      select 1 from public.missions m
      where m.id = mission_id and m.status = 'published'
    )
  );

drop policy if exists applications_update on public.applications;
create policy applications_update on public.applications
  for update to authenticated
  using (
    volunteer_id = auth.uid()
    or exists (
      select 1 from public.missions m
      where m.id = mission_id and public.is_org_member(m.organization_id)
    )
    or public.is_admin()
  )
  with check (
    volunteer_id = auth.uid()
    or exists (
      select 1 from public.missions m
      where m.id = mission_id and public.is_org_member(m.organization_id)
    )
    or public.is_admin()
  );

drop policy if exists applications_delete_admin on public.applications;
create policy applications_delete_admin on public.applications
  for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- saved_missions  (owner-only)
-- ============================================================
drop policy if exists saved_select on public.saved_missions;
create policy saved_select on public.saved_missions
  for select to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists saved_insert on public.saved_missions;
create policy saved_insert on public.saved_missions
  for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists saved_delete on public.saved_missions;
create policy saved_delete on public.saved_missions
  for delete to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- reports  (admin reads all; any authenticated user files as self.
-- internal_note stays admin-only. Reporter self-read is PENDING Phase 6
-- and will be added via a private split or a safe view.)
-- ============================================================
drop policy if exists reports_select_admin on public.reports;
create policy reports_select_admin on public.reports
  for select to authenticated
  using (public.is_admin());

drop policy if exists reports_insert_self on public.reports;
create policy reports_insert_self on public.reports
  for insert to authenticated
  with check (reporter_id = auth.uid());

drop policy if exists reports_update_admin on public.reports;
create policy reports_update_admin on public.reports
  for update to authenticated
  using (public.is_admin()) with check (public.is_admin());

drop policy if exists reports_delete_admin on public.reports;
create policy reports_delete_admin on public.reports
  for delete to authenticated
  using (public.is_admin());

-- ============================================================
-- audit_events  (admin read-only; writes happen server-side only)
-- No insert/update/delete policies → denied for all client roles.
-- ============================================================
drop policy if exists audit_select_admin on public.audit_events;
create policy audit_select_admin on public.audit_events
  for select to authenticated
  using (public.is_admin());
