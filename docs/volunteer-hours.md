# Volunteer Hours

Data: `lib/data/volunteer-impact.ts`. Surfaced on `/impact`, `/my-missions` (Completed tab), `/dashboard`.

## How hours are calculated
- On **check-out**, `hours_credited = (checked_out_at − checked_in_at) / 3,600,000`, rounded to the nearest **0.25**.
- The organizer can **adjust** hours (`updateHoursAction`) and must confirm a value when marking **completed** (`markCompletedAction`). `estimated_hours` on the mission is offered as the default.
- Constraint: `hours_credited >= 0` (DB check). Negative values are rejected.

## When hours become official
Hours count toward a volunteer's totals **only when attendance status is `completed`** (organizer-confirmed). Checked-in/checked-out time alone does not count until completion. This prevents unconfirmed or accidental check-ins from inflating totals.

## How the volunteer profile uses hours
`getVolunteerImpactSummary(userId)` aggregates `attendance_records` where `status = 'completed'`:
- **total hours** (sum of `hours_credited`),
- **completed missions** (count),
- **certificates** (count),
- **causes supported** (distinct categories of completed missions),
- **recent completed** (latest 5).

`/impact` shows totals + recent history + certificates; `/dashboard` shows total hours, completed count, and the next upcoming mission; `/my-missions` lists completed missions with per-mission hours and certificate links. Empty states are shown when there are no confirmed hours yet — hours are never faked.

## What remains for later
Per-week/aggregate charts, exportable hour reports, school-administrator transcripts, and verified-hours analytics are out of scope for Phase 7.
