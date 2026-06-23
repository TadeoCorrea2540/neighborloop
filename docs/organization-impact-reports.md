# Organization Impact Reports

Routes: `/manage/reports` (interactive), `/reports/print` (printable). Data: `lib/data/analytics/organization.ts`. Exports: `app/api/manage/reports/export/route.ts`.

## Reports page (`/manage/reports`)
Server component; reads `?range=` from the URL. One DB load (`getOrganizationReport`) powers all sections:
- **Impact overview** — missions hosted, volunteer hours, completed attendances, unique volunteers, certificates issued, avg completion rate.
- **Monthly hours** — missions bucketed by start month (CSS bar chart).
- **Impact by cause** — hours per `mission_category` with accent bars.
- **Mission performance** — per-mission cards (approved / completed / no-shows / certs / hours / completion rate); responsive cards on mobile.
- **Volunteer engagement** — unique volunteers, returning (completed ≥2 of the org's missions), returning rate, avg hours/volunteer, no-shows.
- **Export center** — CSV download links + Print link.

## Filters
`RangeFilter` (client) updates `?range=`: All time / Last 7 / 30 / 90 days / This year. The range filters **missions by `starts_at`**; attendance & certificates are aggregated for those missions (see [analytics-definitions.md](analytics-definitions.md)). Empty state shown when no missions fall in the range.

## Exports
`GET /api/manage/reports/export?type=<t>&range=<r>` — `mission-performance`, `attendance-summary`, `volunteer-hours`, `certificates-issued`. Guarded by `requireOrganizer()`; org id pinned to `guard.orgId`. See [export-security.md](export-security.md).

## Print-friendly report
`/reports/print?range=<r>` — standalone (no sidebar), Save-as-PDF via the browser. See [printable-reports.md](printable-reports.md).

## Public-safe impact
`/org/[slug]` shows aggregate-only public impact (missions hosted, volunteer hours, certificates, causes) via the migration-019 RPC — never volunteer names or private mission details, and only for `is_public` orgs.

## Privacy
Organizers see only their own org (RLS `is_org_member` + `guard.orgId` pin). One org can never read another's analytics or exports. No emails / contact info / internal notes in any report or CSV.
