# Admin / Platform Analytics

Route: `/admin`. Data: `lib/data/admin-dashboard.ts` (core) + `lib/data/analytics/admin.ts` (additions). Exports: `app/api/admin/reports/export/route.ts`. Admin-only (`requireRole(["admin"])` + RLS `is_admin`).

## Metrics
- **Core** (unchanged) — total users (by role), organizations, pending verifications, published/draft missions, applications submitted, open/resolved reports.
- **Platform impact** — volunteer hours, completed attendances, certificates issued, active volunteers (`getAdminImpactAdditions`).
- **Leaderboards** — organizations with most impact, missions with most hours (`getTopOrganizationsByHours`, `getTopMissionsByHours`).
- **Participation by cause** — `getCategoryParticipation` (hours/missions per category).
- **Moderation summary** — open / reviewing / resolved / dismissed reports + audit events (`getAdminModerationSummary`).
- **Operational lists** (unchanged) — verification queue, recent reports, recent admin actions.

## Privacy boundaries
- Admin analytics are platform aggregates; the role gate redirects non-admins (verified: an organizer is redirected away from `/admin`).
- Moderation metrics are counts/status only — no report bodies, no reporter identities.
- Leaderboards/impact use organization + mission names + totals; no individual volunteer PII.
- CSV exports (`/api/admin/reports/export`) require `requireAdmin()` and exclude the same sensitive fields.

## Scale note
Leaderboards and platform hours are computed with in-JS tallies over completed attendance. Fine at pilot scale; promote to SECURITY DEFINER SQL aggregates (or materialized views) if data grows large. Suggested index: `attendance_records(organization_id, status, volunteer_id)`.
