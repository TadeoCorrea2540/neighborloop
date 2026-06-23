# Phase 6 — Test Checklist

Setup: apply migration 012, create an admin account + an organizer/org ([phase-6-test-data.md](phase-6-test-data.md)).

## Route protection
- [ ] Anonymous user → `/admin/dashboard` (i.e. `/admin`) redirects to `/auth`.
- [ ] Volunteer cannot access admin routes (redirected to `/dashboard`).
- [ ] Organizer cannot access admin routes (redirected to `/manage/dashboard`).
- [ ] Admin can access all `/admin/*` routes.

## Dashboard
- [ ] `/admin` loads real metrics (users, orgs, missions, reports, applications) — cross-check a count against SQL.
- [ ] Verification queue, recent reports, and recent admin actions show real data (or correct empty states).

## Verification
- [ ] Organizer `/manage/settings` → **Request verification** creates a pending request (dedupes on repeat).
- [ ] Admin sees it under `/admin/verification` (Pending).
- [ ] **Approve** → org `verification_status = verified`; ✓ badge shows on `/org/[slug]` and organizer settings.
- [ ] **Reject** with a public reason → organizer sees the reason in settings; the **internal note is NOT** shown to the organizer.
- [ ] Return-to-pending works (requires internal note).
- [ ] Verification detail shows the document **placeholder** (no fake uploaded docs).

## Reports
- [ ] Admin can view reports at `/admin/reports`, filter by status/target.
- [ ] **Resolve** a report → status resolved, reviewer + internal note saved.
- [ ] **Dismiss** a report → status dismissed.
- [ ] Reporter identity / internal note appear only in admin UI.

## Mission moderation
- [ ] Admin can moderate any org's mission at `/admin/missions`.
- [ ] **Pause** a published mission (reason required) → it disappears from `/explore`.
- [ ] Cancel / archive respect transition rules; invalid actions aren't offered.
- [ ] **Mark reviewed** records an audit event without changing status.

## Organizations & users
- [ ] `/admin/organizations` lists all orgs with status + counts; filters work.
- [ ] `/admin/users` is read-only; shows safe fields only (no email/phone/address).

## Audit
- [ ] Audit event created for each: verification approve/reject/return, report resolve/dismiss, mission moderate.
- [ ] `/admin/audit` lists them with actor + category filters.
- [ ] **Non-admin cannot read audit events** (SQL: zero rows).

## Regression
- [ ] Public, volunteer, and organizer routes still work.
- [ ] No service-role key in client/server-action code.

## Mobile (320 / 375 / 390 / 414 / 768px)
- [ ] No horizontal overflow on any `/admin/*` page; lists are cards, badges readable, tap targets ~44px, dialogs/prompts usable.

## Build
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` succeeds (stop the dev server first).
