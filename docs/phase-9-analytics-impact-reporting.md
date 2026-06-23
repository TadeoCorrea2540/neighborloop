# Phase 9 — Analytics, Impact Reporting, Exports & Public Impact

Turns NeighborLoop's real data (`attendance_records.hours_credited`, `certificates`, `applications`, `missions`) into trustworthy analytics for volunteers, organizers, and admins, plus CSV/print exports and public-safe impact numbers.

## What it implements
- **Volunteer analytics** — `/impact` (timeline, cause breakdown, milestones), `/badges` (real milestone unlocks). `/dashboard` was already real.
- **Organization analytics** — `/manage/reports` (impact overview, monthly hours, mission performance, engagement, category breakdown) with a date-range filter; `/manage/dashboard` impact snapshot.
- **Mission analytics** — `/manage/missions/[id]/reports` (application funnel, attendance summary, capacity, rates).
- **Admin/platform analytics** — `/admin` (platform impact, leaderboards, category participation, moderation summary).
- **Exports** — CSV route handlers for org + admin reports.
- **Print** — `/reports/print` (clean, sidebar-free, Save-as-PDF).
- **Public-safe impact** — aggregate-only numbers on `/org/[slug]` via SECURITY DEFINER RPCs (migration 019).

## What it does NOT implement
AI recommendations/summaries, predictive analytics, payments, complex BI dashboards, a data warehouse, external analytics tools, automatic PDF generation (browser print → PDF instead), automated reminder scheduling.

## Main reporting workflows
1. Volunteers join missions → organizers confirm attendance + hours → certificates issued.
2. `/impact` + `/badges` reflect the volunteer's real hours, causes, milestones.
3. `/manage/reports` + `/manage/dashboard` show the org's real outcomes; `/manage/missions/[id]/reports` drills into one mission.
4. CSV export (`/api/manage/reports/export`) and print (`/reports/print`) produce shareable artifacts.
5. `/admin` shows platform health + leaderboards.
6. `/org/[slug]` shows public-safe aggregate impact.

## Routes connected
- Volunteer: `/dashboard`, `/impact`, `/badges`.
- Organizer: `/manage/dashboard`, `/manage/reports`, `/manage/missions/[id]/reports`, `/reports/print`.
- Admin: `/admin`.
- Public: `/org/[slug]`.
- API: `/api/manage/reports/export`, `/api/admin/reports/export`.

## Tables / functions used
- Tables: `missions`, `applications`, `attendance_records`, `certificates`, `organizations`, `mission_categories`, `reports`, `audit_events`, `profiles`, `user_roles`.
- Functions (migration 019, SECURITY DEFINER): `get_public_organization_impact(uuid)`, `get_public_platform_impact()`.
- No SQL analytics views — TS aggregation in `lib/data/analytics/`. Views/aggregate RPCs are a documented future optimization for scale.

## Architecture notes
- `attendance_records` / `certificates` read via `getServerDb()` (loose-typed); everything else via `getServerSupabase()` (typed).
- All aggregation is server-side; the only client components are the range filter and print button.
- Accurate-or-omit: zero denominators render `—`; nothing is faked. See [analytics-definitions.md](analytics-definitions.md).
