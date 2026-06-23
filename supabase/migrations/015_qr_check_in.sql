-- ============================================================
-- 015 · Phase 7 — qr_check_in() SECURITY DEFINER function
-- ------------------------------------------------------------
-- Lets an approved volunteer self-check-in via a QR token WITHOUT granting
-- them any direct write to attendance_records or read of check_in_tokens.
-- The function (running as definer) validates the token + the caller's
-- approved application, then writes a checked_in/qr attendance row for
-- auth.uid() only. The raw token lives in the QR URL; the server action
-- hashes it (SHA-256) and passes the hash here — the function only compares.
-- Returns a status string the action maps to a friendly message.
-- ============================================================
set check_function_bodies = off;

create or replace function public.qr_check_in(p_token_hash text)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_token public.check_in_tokens%rowtype;
  v_app_id uuid;
  v_existing public.attendance_records%rowtype;
begin
  if v_uid is null then return 'auth'; end if;

  select * into v_token from public.check_in_tokens where token_hash = p_token_hash;
  if not found then return 'invalid'; end if;
  if not v_token.is_active then return 'inactive'; end if;
  if v_token.expires_at is not null and v_token.expires_at < now() then return 'expired'; end if;

  -- Must have an APPROVED application for this mission.
  select id into v_app_id
  from public.applications
  where mission_id = v_token.mission_id and volunteer_id = v_uid and status = 'approved'
  limit 1;
  if v_app_id is null then return 'not_approved'; end if;

  -- Existing attendance row?
  select * into v_existing
  from public.attendance_records
  where mission_id = v_token.mission_id and volunteer_id = v_uid;

  if found then
    if v_existing.status in ('checked_in', 'checked_out', 'completed') then
      return 'already';
    end if;
    update public.attendance_records
      set status = 'checked_in',
          check_in_method = 'qr',
          checked_in_at = now(),
          application_id = coalesce(application_id, v_app_id)
      where id = v_existing.id;
    return 'ok';
  end if;

  insert into public.attendance_records
    (mission_id, application_id, volunteer_id, organization_id, status, check_in_method, checked_in_at)
  values
    (v_token.mission_id, v_app_id, v_uid, v_token.organization_id, 'checked_in', 'qr', now());
  return 'ok';
end;
$$;

revoke all on function public.qr_check_in(text) from public, anon;
grant execute on function public.qr_check_in(text) to authenticated;
