-- ============================================================
-- 016 · Phase 7 Pass 2 — Storage RLS + verification document column
-- ------------------------------------------------------------
-- Upload paths always begin with the organization id:
--   organization-media/{org_id}/logo|cover/{file}
--   mission-media/{org_id}/{mission_id}/cover/{file}
--   verification-documents/{org_id}/{verification_id}/{file}
-- So (storage.foldername(name))[1] = org_id, and we gate writes on
-- is_org_manager(that). Public buckets (mission/organization-media) serve reads
-- via public URLs; verification-documents is PRIVATE and needs an explicit
-- select policy (admin or the owning org's managers) for signed-URL access.
-- ============================================================

-- Organizer can write their own organization's public media.
drop policy if exists org_media_insert on storage.objects;
create policy org_media_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'organization-media'
    and public.is_org_manager(((storage.foldername(name))[1])::uuid));

drop policy if exists org_media_update on storage.objects;
create policy org_media_update on storage.objects
  for update to authenticated
  using (bucket_id = 'organization-media'
    and public.is_org_manager(((storage.foldername(name))[1])::uuid))
  with check (bucket_id = 'organization-media'
    and public.is_org_manager(((storage.foldername(name))[1])::uuid));

drop policy if exists org_media_delete on storage.objects;
create policy org_media_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'organization-media'
    and public.is_org_manager(((storage.foldername(name))[1])::uuid));

-- Organizer can write their own organization's mission media.
drop policy if exists mission_media_insert on storage.objects;
create policy mission_media_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'mission-media'
    and public.is_org_manager(((storage.foldername(name))[1])::uuid));

drop policy if exists mission_media_update on storage.objects;
create policy mission_media_update on storage.objects
  for update to authenticated
  using (bucket_id = 'mission-media'
    and public.is_org_manager(((storage.foldername(name))[1])::uuid))
  with check (bucket_id = 'mission-media'
    and public.is_org_manager(((storage.foldername(name))[1])::uuid));

drop policy if exists mission_media_delete on storage.objects;
create policy mission_media_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'mission-media'
    and public.is_org_manager(((storage.foldername(name))[1])::uuid));

-- Verification documents: PRIVATE. Admins or the owning org's managers only.
drop policy if exists verif_docs_select on storage.objects;
create policy verif_docs_select on storage.objects
  for select to authenticated
  using (bucket_id = 'verification-documents'
    and (public.is_admin() or public.is_org_manager(((storage.foldername(name))[1])::uuid)));

drop policy if exists verif_docs_insert on storage.objects;
create policy verif_docs_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'verification-documents'
    and (public.is_admin() or public.is_org_manager(((storage.foldername(name))[1])::uuid)));

drop policy if exists verif_docs_update on storage.objects;
create policy verif_docs_update on storage.objects
  for update to authenticated
  using (bucket_id = 'verification-documents'
    and (public.is_admin() or public.is_org_manager(((storage.foldername(name))[1])::uuid)))
  with check (bucket_id = 'verification-documents'
    and (public.is_admin() or public.is_org_manager(((storage.foldername(name))[1])::uuid)));

drop policy if exists verif_docs_delete on storage.objects;
create policy verif_docs_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'verification-documents'
    and (public.is_admin() or public.is_org_manager(((storage.foldername(name))[1])::uuid)));

-- Verification document path (admin-readable; set at request time by the organizer).
alter table public.organization_verifications add column if not exists document_path text;
