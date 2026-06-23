# Volunteer Impact Analytics

Routes: `/dashboard`, `/impact`, `/badges`. Data: `lib/data/volunteer-impact.ts` (core) + `lib/data/analytics/volunteer.ts` (additions). All reads are RLS-scoped to the volunteer's own records (`volunteer_id = auth.uid()`).

## Dashboard (`/dashboard`)
Already real: saved / pending / approved / total-applied counts, "Your impact" (hours, completed missions, certificates), next approved mission, recent completed missions, recommended missions.

## Impact profile (`/impact`)
- **Stats** — volunteer hours, completed, approved, applied.
- **Impact over time** — monthly confirmed-hours bar chart (`getVolunteerTimeline`, last 12 months).
- **Hours & mission history** — recent completed missions with hours + certificate links.
- **Causes supported** — per-category hours + mission count with accent bars (`getVolunteerCauseBreakdown`).
- **Certificates** — real certificate cards.
- **Milestones** — derived from real data (`milestonesFromSummary`): first mission, 5 missions, 10/50/100 hours, 3 causes, certificate earned.

## Badges (`/badges`)
Server component driven by real milestones (`deriveVolunteerMilestones`): "N of 7 unlocked", a next-milestone progress banner, and per-milestone unlocked/locked state. No fake "claim" flow or fake challenge — unimplemented badges are never shown as earned.

## Timeline events available
Completed-mission + certificate data is reliable, so the timeline is monthly **completed hours**. Per-event traces (applied → approved → checked-in) are intentionally not invented; only confirmed outcomes are shown.

## Privacy rules
- A volunteer sees only their own impact.
- Organizers cannot see a volunteer's cross-platform impact; they only see attendance for their own missions.
- Public org pages and admin analytics never expose an individual volunteer's name with their personal totals.
