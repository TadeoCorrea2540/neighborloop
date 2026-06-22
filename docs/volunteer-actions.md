# Volunteer actions (Phase 4)

All in `app/(volunteer)/actions.ts` (`"use server"`). Each re-checks auth + role
server-side via `getCurrentUser`/`getCurrentUserRole` (never trusts client ids),
relies on RLS as the final gate, and returns a typed `ActionResult` (codes:
`auth | role | duplicate | closed | external | full | validation | unknown`).
The client routes to `/auth?next=…` on `auth`, otherwise shows a toast.

## Save / unsave — `saveMissionAction`, `unsaveMissionAction`
Insert/delete in `saved_missions` (RLS: `user_id = auth.uid()`). Idempotent
(duplicate save swallowed, empty delete fine). Unique `(user_id, mission_id)`
prevents duplicates. Toasts: "Saved for later" / "Removed from saved".

## Apply — `applyToMissionAction(missionId, message?)`
1. Volunteer-only. 2. Mission must be `published` (else "not accepting volunteers").
3. `external` mode → rejected ("applies on their own site"). 4. Status:
`request` → **pending**; `open` → **approved** if a spot is free (capacity −
approved via `get_mission_spot_counts`), else **waitlisted**. 5. Insert into
`applications` (RLS: `volunteer_id = auth.uid()` + published). Unique
`(mission_id, volunteer_id)` blocks doubles → "already applied".
**Re-apply:** a prior `withdrawn|declined|cancelled` row is reactivated (updated)
instead of re-inserted.

## Withdraw — `withdrawApplicationAction(applicationId)`
Allowed only from `pending | approved | waitlisted`. UPDATE `status='withdrawn'`
(RLS own-row). Never hard-deletes (auditability).

## Profile — `updateVolunteerProfileAction(formData)`
Updates **non-PII** columns only: `display_name, bio, city, country_code,
interests, is_profile_public`. Never email/role/id/phone/age.

## Role restrictions
- Anonymous → `{code:'auth'}` → client redirects to `/auth?next=…`.
- Organizer/Admin → `{code:'role'}` with friendly copy; save/apply/withdraw blocked.
- Volunteer → allowed for their own rows only.

## RLS dependencies (Phase 2, unchanged)
applications: insert/select/update own; saved_missions: insert/select/delete own;
missions: public read of published + public-org only. The only added object is the
read-only `get_mission_spot_counts` aggregate.
