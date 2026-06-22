# Phase 4 — test checklist

Prereq: `npm run db:push` (migration 011) + `npm run db:types`, and the test data
(`docs/phase-4-test-data.md`). Use a single fresh dev server.

```
[ ] Anonymous user can view Explore (real missions)
[ ] Anonymous user can view a mission detail page
[ ] Anonymous user tapping Save → redirected to /auth (with ?next)
[ ] Anonymous user CTA shows "Sign in to join"
[ ] Volunteer can save a mission (heart fills, "Saved for later")
[ ] Volunteer can unsave a mission
[ ] Volunteer can apply to a request mission → status Pending
[ ] Volunteer applying to the `open` mission → status Approved ("You're in")
[ ] Volunteer cannot apply twice (second attempt → "already applied")
[ ] Volunteer can withdraw an application → status Withdrawn
[ ] Volunteer can re-apply after withdrawing
[ ] Saved missions appear in My Missions → Saved
[ ] Pending applications appear in My Missions → Applications
[ ] Approved upcoming mission appears in My Missions → Upcoming
[ ] Dashboard counts (saved / pending / approved / applied) are real
[ ] Settings: editing display name / bio / city / interests persists after reload
[ ] Organizer account: volunteer actions show "available from a volunteer account"
[ ] Volunteer cannot access /manage or /admin (redirected)
[ ] Bad mission slug → notFound (404)
[ ] Private mission details never appear on public pages
[ ] Empty Explore (filters with no matches) shows the no-results state
[ ] Explore filters update the URL and are shareable
[ ] Mobile Explore works at 320 / 375 / 414px (no horizontal overflow)
[ ] npx tsc --noEmit passes
[ ] npm run build passes
```
