# Analytics Definitions

Single source of truth for how every Phase 9 metric is computed. The rule is **accurate or omit**: a metric with a zero denominator returns `null` and renders as `—`; nothing is ever faked or estimated without a label.

## Core metrics

| Metric | Definition | Source |
|---|---|---|
| **Total volunteer hours** | Σ `hours_credited` over `attendance_records` where `status = 'completed'` | `attendance_records` |
| **Completed mission (volunteer)** | A mission for which the volunteer has a `completed` attendance record | `attendance_records` |
| **Completed attendances (org/admin)** | Count of `attendance_records` with `status = 'completed'` | `attendance_records` |
| **Certificates issued** | Count of `certificates` rows (status defaults to `issued`) | `certificates` |
| **Unique volunteers** | Distinct `volunteer_id` with a `completed` attendance record (within scope/range) | `attendance_records` |
| **Returning volunteers (org)** | Volunteers with `completed` attendance for **≥2 distinct missions** of the org | `attendance_records` |
| **Approved volunteers** | Count of `applications` with `status = 'approved'` | `applications` |
| **Application approval rate** | approved ÷ total applications | `applications` |
| **Attendance completion rate** | 1 − no-show rate, i.e. completed ÷ (completed + no_show) | `attendance_records` |
| **No-show rate** | no_show ÷ (completed + no_show) | `attendance_records` |
| **Capacity fill rate** | completed ÷ `volunteer_capacity` (null when no capacity set; capped at 1) | `missions` + `attendance_records` |
| **Causes supported** | Distinct `mission_categories` of missions with completed attendance | `missions.category_id` |

## Application funnel (mission level)

`Applied → Approved → Checked in → Completed → Certificate issued`

- **Applied** = all `applications` for the mission (any status).
- **Approved / Waitlisted / Declined / Withdrawn** = `applications` by `status`.
- **Checked in** = attendance with `status ∈ {checked_in, checked_out, completed}` ("showed up").
- **Completed** = attendance `status = 'completed'`.
- **Certificate issued** = `certificates` for the mission.
- **Saved** is intentionally omitted — `saved_missions` is private to the volunteer and not org-readable.

## Date ranges & which timestamp each metric uses

Ranges resolve to **UTC** ISO boundaries (`from` inclusive, `to` exclusive). `this_year` = Jan 1 UTC. This can differ by a few hours from an organizer's local midnight; reporting buckets are UTC and never mixed with local time.

| Metric family | Timestamp column |
|---|---|
| Missions / mission performance | `missions.starts_at` |
| Application funnel | `applications.applied_at` |
| Attendance / hours (standalone, e.g. admin) | `attendance_records.confirmed_at` (completed records always have it) |
| Certificates | `certificates.issued_at` |
| Reports / audit | `created_at` |

**Org & mission performance scoping:** the date range filters the **missions** (`starts_at`); attendance and certificates for those missions are then aggregated by mission membership (not re-filtered on their own timestamps). This makes "missions in this period and how they did" intuitive and avoids double-filtering. Admin standalone hours/leaderboards filter attendance directly on `confirmed_at`.

## Privacy boundaries

- Volunteers see only their own records (RLS `volunteer_id = auth.uid()`).
- Organizers see only their org's missions/applications/attendance/certificates (RLS `is_org_member`); analytics functions also pin the org id to `guard.orgId`.
- Admins see platform aggregates (RLS `is_admin`).
- Public/anonymous see **only** SECURITY DEFINER aggregate impact (migration 019) — totals, no names, no per-volunteer rows, gated on `is_public` + published/closed missions.

## Implementation

- Data layer: `lib/data/analytics/{date-range,volunteer,organization,mission,admin,public-impact,csv}.ts`.
- `attendance_records` / `certificates` are read through `getServerDb()` (loose-typed); everything else through `getServerSupabase()` (typed).
- No SQL analytics views yet — TS aggregation functions are the source of truth. SQL views / SECURITY DEFINER aggregates are a documented future optimization for scale (e.g. returning-volunteers, leaderboards).
