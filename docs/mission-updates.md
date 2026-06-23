# Mission Updates

Organizer one-to-many announcements to approved volunteers. Table: `mission_updates` (018). Action: `app/manage/missions/[id]/updates/actions.ts`. Data: `lib/data/mission-updates.ts`. UI: `/manage/missions/[id]/updates`.

## Types (`mission_update_type`)
`general`, `schedule_change`, `location_change`, `reminder`, `attendance`, `cancellation`, `thank_you`.

## Flow
On the mission's Updates page (linked from the mission edit header), an org manager writes a title + body + type. `createMissionUpdateAction`:
1. `requireOrganizer()` + ownership (mission belongs to the org).
2. Inserts the `mission_updates` row (audience `approved_volunteers`).
3. Notifies all **approved** volunteers (`mission_update`, preference-gated, best-effort).
4. Revalidates the page; shows "Mission update sent to approved volunteers."

The composer shows the live recipient count (approved applicants).

## Audience / visibility (RLS)
`mission_updates` are readable by: org members, admins, and **approved** volunteers for that mission. **Pending applicants do not see approved-only updates** (the policy checks `applications.status = 'approved'`). Public users can't read them.

Volunteers see updates as in-app notifications (and the update row is readable on relevant pages). System-message insertion into each conversation is intentionally not done this phase (notifications are the channel) — a documented future enhancement.
