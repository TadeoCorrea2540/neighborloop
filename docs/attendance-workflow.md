# Attendance Workflow

Data: `lib/data/attendance.ts`. Actions: `app/manage/attendance/actions.ts`. UI: `/manage/attendance`, `/manage/missions/[id]/attendance` + `components/manage/attendance-roster.tsx`. Table: `attendance_records` (migration 014).

## Statuses (`attendance_status`)
`registered` (approved, no row / not yet present) · `checked_in` · `checked_out` · `completed` (hours confirmed) · `no_show` · `excused` · `cancelled`.

One row per `(mission_id, volunteer_id)` (unique constraint). Only **approved** applicants can be marked attended (every action verifies an approved application).

## Organizer actions (own org only)
| Action | Effect |
|---|---|
| `markCheckedInAction(missionId, volunteerId)` | upsert → `checked_in`, method `organizer`, `checked_in_at = now()` |
| `markCheckedOutAction(missionId, volunteerId)` | `checked_out`, `checked_out_at = now()`, **hours = (out−in)/3600000** rounded to 0.25 |
| `markCompletedAction(attendanceId, hours)` | `completed`, `confirmed_by`/`confirmed_at` set, `hours_credited = hours` (≥0) |
| `markNoShowAction` / `markExcusedAction(missionId, volunteerId)` | `no_show` / `excused` |
| `updateHoursAction(attendanceId, hours)` | adjust credited hours (≥0) |
| `updateNoteAction(attendanceId, note)` | private organizer note |

Every action: `requireOrganizer()` → UUID check → **ownership** (`mission.organization_id === orgId`) → mutate → revalidate. RLS (`is_org_manager`) is the final gate.

## Permissions / privacy
- **Volunteers can't write attendance or credit their own hours** — RLS insert/update is org-manager/admin only; the only volunteer-initiated write is QR check-in via the `qr_check_in()` definer fn, which forces `checked_in`/`qr`.
- Organizers can manage attendance **only** for their own org's missions.
- Volunteers can **read their own** attendance; organizers read their org's; admins read all.
- `organizer_note` is private to the org/admin.

## Completion → certificate
A volunteer must be `completed` with `hours_credited` set before a certificate can be issued (see [certificates.md](certificates.md)). Checking in does **not** auto-complete — the organizer confirms.

## Volunteer visibility
Completed attendance surfaces on `/impact`, `/my-missions` (Completed tab), and `/dashboard` (real hours + completed counts). See [volunteer-hours.md](volunteer-hours.md).
