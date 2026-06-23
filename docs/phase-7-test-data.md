# Phase 7 — Test Data

## 0. Apply migrations (Supabase SQL editor)
- `014_attendance_certificates.sql` — attendance/tokens/certificates + enums + RLS.
- `015_qr_check_in.sql` — `qr_check_in()` function.
- `016_storage_policies.sql` — storage RLS + `organization_verifications.document_path` (needed for Pass 2 uploads).

Optionally `npm run db:types` to restore full typing (the app compiles without it via `lib/supabase/db.ts`).

Confirm the buckets exist (Dashboard → Storage): `mission-media`, `organization-media` (public), `verification-documents` (private). Migration 006 creates them; create manually if missing.

## 1. Full attendance → certificate loop
1. Organizer account + organization (see [phase-5-test-data.md](phase-5-test-data.md)); publish a mission.
2. A separate **volunteer** account applies to that mission.
3. Organizer approves the application (`/manage/missions/[id]/applications`).
4. Organizer opens `/manage/attendance` → the mission → **Manage attendance**.
5. **Check in** the volunteer → **Check out** (hours compute) → **Complete** (confirm hours) → **Issue certificate**.
6. As the volunteer: `/impact` shows hours + completed mission + certificate; `/my-missions` Completed/Certificates tabs; open `/certificates/[id]` and Print.

## 2. QR check-in
1. Organizer: mission → **Check-in QR** → **Generate** → copy the `/check-in/<token>` link.
2. As an **approved, not-yet-checked-in** volunteer, open the link → "You're checked in!".
3. As a non-approved user → "only for approved volunteers". As a non-volunteer (organizer) → "Volunteer accounts only". Deactivate the token, reopen → "expired".

## 3. File uploads (Pass 2)
- Organizer `/manage/settings`: upload **logo** + **cover** → appear on `/org/<slug>` and settings.
- Organizer `/manage/missions/[id]/edit`: upload a **cover image** → appears on `/explore` and the mission page (gradient fallback when none).
- Organizer `/manage/settings` → **Request verification** with an attached **document** → admin opens `/admin/verification/[id]` and views it via the signed link; it is **not** public.

## SQL spot-checks
```sql
select status, hours_credited, check_in_method, confirmed_by from public.attendance_records order by created_at desc limit 10;
select certificate_number, hours_credited, issued_by from public.certificates order by created_at desc limit 10;
select mission_id, is_active, expires_at from public.check_in_tokens order by created_at desc limit 5;
-- a non-admin / other volunteer should get 0 rows from attendance_records / certificates they don't own (RLS).
```

Keep test accounts throwaway; no destructive SQL needed.
