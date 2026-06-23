# Application Review Flow

How organizers review volunteer applications. UI: `components/manage/applications-review.tsx` (used by `/manage/applicants` and `/manage/missions/[id]/applications`). Actions: `app/manage/applications/actions.ts`. Reads: `lib/data/organization-applications.ts`.

## Statuses (`application_status`)
`pending` → organizer reviews → `approved` | `waitlisted` | `declined`. Volunteers may also `withdraw` (→ `withdrawn`); `cancelled` is system-side. Organizers act on `pending`, `waitlisted`, and `approved` rows.

## Transitions (enforced server-side)
| Action | Allowed from | Result |
|---|---|---|
| Approve | pending, waitlisted | approved (**capacity-checked**) |
| Waitlist | pending, approved | waitlisted |
| Decline | pending, waitlisted, approved | declined |

Each sets `reviewed_by` (the organizer) and `reviewed_at`. Decline/waitlist may attach a private `organizer_note`.

## Capacity
Approve counts current `approved` applications for the mission directly (organizers can read their own missions' applications). At/over `volunteer_capacity` it returns `{ code: 'full' }` and the UI suggests the waitlist. `volunteer_capacity = null` means unlimited.

> Known limitation: two simultaneous approvals could both pass the read-count check and exceed capacity by one (flagged in the plan). A DB-level atomic guard is future hardening.

## Privacy
- `organizer_note` is internal — **never** returned to volunteers.
- Volunteer profile is fetched separately and is **null** when the profile is private (RLS). The UI then shows initials + "Volunteer" and "Private profile" — it never fabricates details.
- An organizer can only see applications for **their own** org's missions (RLS + the `missions!inner(organization_id)` filter; verified again in each action via `loadOwnedApplication`).

## Cross-org isolation
`getApplicationsForOrganization` / `getApplicationsForMission` filter on `missions.organization_id = orgId`; review actions reject any application whose mission isn't the caller's org with `{ code: 'forbidden' }`.
