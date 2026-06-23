-- ============================================================
-- 012 · audit_events INSERT policy (admin-only)
-- ------------------------------------------------------------
-- Phase 6 (admin moderation) needs admin server actions to WRITE the
-- audit log. 005 gave audit_events an admin SELECT policy but no INSERT
-- policy, so default-deny RLS blocked every insert (even for admins).
--
-- This is the NARROW fix: admins may insert audit rows; reads stay
-- admin-only; no other table or policy is touched. Server actions stamp
-- actor_id = auth.uid() themselves — this policy is the gate, not the
-- source of the actor.
-- ============================================================

drop policy if exists audit_insert_admin on public.audit_events;
create policy audit_insert_admin on public.audit_events
  for insert to authenticated
  with check (public.is_admin());
