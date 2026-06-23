-- ============================================================
-- 013 · At most one PENDING verification request per organization
-- ------------------------------------------------------------
-- Organizers can INSERT a verification request but CANNOT SELECT
-- organization_verifications (admin-only read), so the app can't dedupe by
-- reading first. Enforce "one open request per org" at the DB instead: a
-- partial unique index. A duplicate insert then fails with 23505, which the
-- server action maps to a friendly "already pending" message.
--
-- Clean up any pre-existing duplicate pending rows first (keep the earliest)
-- so the index can be created.
-- ============================================================

delete from public.organization_verifications a
using public.organization_verifications b
where a.status = 'pending'
  and b.status = 'pending'
  and a.organization_id = b.organization_id
  and a.submitted_at > b.submitted_at;

create unique index if not exists uq_org_verif_one_pending
  on public.organization_verifications (organization_id)
  where status = 'pending';
