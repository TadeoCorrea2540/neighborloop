# Phase 9 — Test Checklist

Setup: apply migrations 001–019; have an organizer + org + published missions, an approved+completed volunteer with hours, an issued certificate, and an admin account. See [phase-9-test-data.md](phase-9-test-data.md).

## Volunteer analytics
- [x] Volunteer dashboard shows real hours.
- [x] Volunteer impact profile shows completed missions + timeline + cause breakdown + milestones.
- [x] `/badges` shows real milestone unlocks (no fake claim / challenge).
- [ ] A volunteer cannot see another volunteer's impact data (RLS; SQL: anon/other = own rows only).

## Organization analytics
- [x] Organization dashboard shows real mission/application/attendance metrics + impact snapshot.
- [x] Organization reports page loads real data (overview, mission performance, engagement, categories).
- [x] Date filters work (All time / 7 / 30 / 90 / This year).
- [ ] Organizer cannot access another organization's reports (org id pinned to guard.orgId; RLS).

## Mission-level analytics
- [x] Mission analytics show the application funnel.
- [x] Mission analytics show the attendance summary + capacity + rates.
- [x] A mission outside the org → not-found, no data leak.

## Admin
- [x] Admin analytics blocked for non-admins (organizer redirected away from /admin).
- [ ] Admin dashboard shows platform metrics + leaderboards + moderation summary (needs admin login).

## Exports
- [x] Organization CSV export works (mission-performance verified).
- [x] Organization CSV export excludes sensitive unauthorized data (no PII).
- [x] Admin CSV export blocked for non-admins (403).
- [x] CSV escaping correct (quotes/commas/newlines).

## Print + public
- [x] Print-friendly organization report works (sidebar-free, Save as PDF).
- [ ] Public organization page shows only public-safe aggregate impact (after migration 019; private org leaks nothing).

## Accuracy / states
- [x] No fake metrics shown as real (mock SUMMARY/CAUSES/STATS/BADGES removed).
- [x] Empty states work (report empty range, no completed hours).
- [x] Zero denominators render "—".

## Build
- [x] `npx tsc --noEmit` clean.
- [ ] `npm run build` passes (stop the dev server first).
- [ ] Mobile analytics pages work at 320px (cards stack, no overflow).

(Boxes marked [x] were verified live during implementation with the org + volunteer accounts; [ ] need an admin login, migration 019, or the final build/mobile sweep.)
