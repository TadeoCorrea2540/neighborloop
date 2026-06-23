# NeighborLoop — Impact Case Study Template

Use this to turn real NeighborLoop usage into evidence for a portfolio, internship / graduate / scholarship application, or a school/community pilot report. Fill each section with concrete numbers exported from the platform (CSV / print report) and screenshots.

## Problem
What community-coordination problem does NeighborLoop address? (Volunteer effort is fragmented across WhatsApp/spreadsheets; organizers can't prove impact; volunteers can't show verified hours.)

## Context
Where/who: the school, club, nonprofit, or neighborhood. Timeframe of the pilot. Why this matters locally.

## Users served
- Volunteers (count, demographics if known and consented).
- Organizations / organizers onboarded.
- Schools / community groups involved.

## Technical architecture
- Next.js 14 App Router (server components, server actions, route handlers).
- Supabase (Postgres + RLS + Auth + Storage + Realtime).
- Security model: role system (`user_roles`), RLS as the boundary, SECURITY DEFINER helpers for narrow public/aggregate reads. No service-role key in the browser.
- Analytics: server-side aggregation in `lib/data/analytics/`, CSV/print exports, public-safe RPCs.

## Product features
Missions, applications, attendance + QR check-in, hours, certificates, messaging, notifications, and the Phase 9 analytics/impact-reporting layer (volunteer/org/mission/admin dashboards, exports, public impact).

## Security & privacy decisions
- Volunteers see only their own data; organizers only their org; admins platform-wide; public only aggregate-safe numbers.
- No PII in exports; moderation = counts only; public impact gated on `is_public` + published/closed missions.

## Pilot setup
How you onboarded orgs/volunteers, created missions, ran events, confirmed attendance, issued certificates. (See [pilot-metrics-checklist.md](pilot-metrics-checklist.md).)

## Metrics collected
Pull from the org report / CSV exports / admin dashboard. See "Impact results" below.

## Before / after workflow
- **Before**: spreadsheets, no verified hours, no impact proof, manual reminders.
- **After**: one platform — apply → approve → check-in → hours → certificate → exportable impact report.

## Impact results (fill with real numbers)
- Organizations onboarded: ___
- Missions posted / completed: ___ / ___
- Volunteers registered / approved: ___ / ___
- Completed attendances: ___
- Total volunteer hours tracked: ___
- Certificates issued: ___
- Avg attendance completion rate: ___%
- Causes supported: ___
- Returning volunteers / returning rate: ___ / ___%

## Lessons learned
What worked, what was hard, what surprised you.

## Future improvements
AI impact summaries, automated reminders/cron, full server-side PDF, SQL materialized views for scale, donor/sponsor views.

## Screenshots to include
- Volunteer `/impact` (hours, causes, milestones).
- Organizer `/manage/reports` (overview + mission performance + cause breakdown).
- A mission report `/manage/missions/[id]/reports` (funnel).
- `/admin` platform impact + leaderboards.
- A printed PDF impact report.
- A public `/org/[slug]` impact section.

## Demo video script (~2 min)
1. (0:00) The problem in one sentence + who it serves.
2. (0:15) Volunteer applies to a mission, gets approved.
3. (0:35) Organizer checks the volunteer in, confirms hours, issues a certificate.
4. (0:55) Volunteer's `/impact` updates — real hours, cause breakdown, milestone unlocked.
5. (1:15) Organizer `/manage/reports` — completion rate, mission performance; export CSV + print PDF.
6. (1:35) Admin `/admin` — platform health + leaderboards.
7. (1:50) Public `/org/[slug]` impact + closing line on privacy ("no personal data exposed").
