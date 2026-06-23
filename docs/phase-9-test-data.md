# Phase 9 — Test Data

How to exercise the full analytics flow end to end.

## 0. Migrations
Apply `001`–`019`. `019_public_impact.sql` adds the public-safe SECURITY DEFINER aggregates used by `/org/[slug]`. Optionally run `npm run db:types` afterward (the analytics RPC wrappers compile before regeneration via a typing shim).

## 1. Build the data
1. Create an **organizer** account → create an **organization** (verify it as admin for the verified badge).
2. Create and publish **several missions in different categories** (e.g. Cleanups, Food Support, Tutoring), some with `volunteer_capacity` set.
3. Create multiple **volunteer** accounts.
4. Volunteers **apply** to missions.
5. Organizer **approves** some, **declines/waitlists** others.
6. Volunteers **check in** (manual or QR); organizer marks **completed** and confirms **hours**.
7. Organizer **issues certificates** for completed attendances.

## 2. Verify volunteer analytics
- `/dashboard` — real hours / completed / certificates / next mission.
- `/impact` — timeline, cause breakdown, milestones, certificate cards.
- `/badges` — "N of 7 unlocked", next-milestone progress.

## 3. Verify organization analytics
- `/manage/dashboard` — impact snapshot band.
- `/manage/reports` — overview, monthly hours, cause breakdown, mission performance, engagement. Switch the date range.
- `/manage/missions/[id]/reports` — application funnel + attendance summary.

## 4. Exports + print
- Export center on `/manage/reports`: download `mission-performance`, `attendance-summary`, `volunteer-hours`, `certificates-issued` CSVs.
- `/reports/print` → Print / Save as PDF.

## 5. Admin
- Sign in as **admin** → `/admin`: platform impact, leaderboards (top orgs/missions), participation by cause, moderation summary.
- Confirm a non-admin is redirected away from `/admin`.

## 6. Public impact
- `/org/[slug]` for a public org → aggregate impact (volunteer hours / missions hosted / certificates / causes). A non-public org or one with no confirmed impact shows no public numbers (never fake ones).

## Verified during development (org + volunteer accounts)
- Volunteer `/impact` + `/badges`: 13 real hours, 3 milestones unlocked.
- Org `/manage/reports`: 13 hours, all sections, working range filter; dashboard snapshot.
- Mission report: Parque Fundidora funnel + attendance.
- CSV export: real escaped rows; admin export 403 for the organizer.
- Print report: sidebar-free, all sections.

## SQL spot-checks (optional)
```sql
select status, count(*) from public.attendance_records group by status;
select sum(hours_credited) from public.attendance_records where status = 'completed';
select count(*) from public.certificates;
-- public aggregates (run as anon to confirm no error + no PII):
select * from public.get_public_organization_impact('<org-uuid>');
select * from public.get_public_platform_impact();
```
Keep test accounts throwaway; no destructive SQL needed.
