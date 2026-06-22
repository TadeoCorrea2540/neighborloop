-- ============================================================
-- 006 · Storage foundation (buckets only — no upload flows)
-- Guarded so it no-ops if the storage schema/helpers are unavailable
-- in the current environment. Storage RLS policies are intentionally
-- deferred to Phase 7 (see docs/supabase-setup.md).
--
-- Buckets:
--   mission-media        · public read  (mission cover images)
--   organization-media   · public read  (logos / covers)
--   verification-documents · PRIVATE    (never public)
-- ============================================================

do $$
begin
  -- storage.buckets exists on hosted Supabase; guard for safety.
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public)
    values
      ('mission-media',          'mission-media',          true),
      ('organization-media',     'organization-media',     true),
      ('verification-documents', 'verification-documents', false)
    on conflict (id) do nothing;
  else
    raise notice 'storage.buckets not found — create buckets in the dashboard (see docs/supabase-setup.md).';
  end if;
end $$;

-- NOTE: We deliberately do NOT add storage.objects RLS policies here.
-- Browser clients must NOT get unrestricted write access. Granular upload
-- policies (organizer-can-write-own-mission-media, admin-only verification
-- docs, etc.) are designed and applied in Phase 7 alongside the upload UI.
