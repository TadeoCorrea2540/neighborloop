# Phase 7 — Test Checklist

Setup: apply migrations 014/015/016; have an organizer+org, an approved volunteer, and an admin ([phase-7-test-data.md](phase-7-test-data.md)).

## Files / uploads
- [ ] Organizer uploads organization **logo**.
- [ ] Organizer uploads organization **cover** image.
- [ ] Organizer uploads **mission cover** image (edit page).
- [ ] Public mission page / Explore show the mission cover (gradient fallback when none).
- [ ] Org page shows logo + cover.
- [ ] Private verification documents are **not** public; admin opens via signed link.
- [ ] Bad file type / oversize is rejected with a friendly error.
- [ ] A non-member cannot write to another org's storage path (RLS).

## Attendance
- [ ] Organizer sees attendance missions at `/manage/attendance`.
- [ ] Organizer manages attendance for own mission; **cannot** for another org's mission.
- [ ] Volunteer **cannot** edit their own attendance (no UI; RLS denies).
- [ ] Manual **check in** works.
- [ ] **Check out** works and computes hours.
- [ ] **Complete** works; hours confirmed.
- [ ] Hours credited calculated correctly (and editable).
- [ ] No-show / excused work.

## QR check-in
- [ ] QR token can be generated (real scannable QR).
- [ ] QR check-in works for an approved volunteer.
- [ ] QR check-in fails for a non-approved volunteer.
- [ ] QR check-in fails for an expired/inactive token.
- [ ] Non-volunteer sees the role message.

## Volunteer hours / history / certificates
- [ ] `/impact` shows real completed hours + completed missions + certificates.
- [ ] `/my-missions` Completed + Certificates tabs show real data.
- [ ] `/dashboard` shows total hours, completed, next mission.
- [ ] Organizer can issue a certificate for completed attendance.
- [ ] Volunteer can view their own certificate; **cannot** view another volunteer's (404).
- [ ] Certificate page prints / saves as PDF.

## Security
- [ ] Public users cannot read attendance records or certificates (SQL: 0 rows).
- [ ] Internal/organizer notes not shown to volunteers; verification docs not public.
- [ ] No service-role key in client/server-action code.

## Regression
- [ ] Public, volunteer, organizer, and admin routes still work.

## Mobile (320 / 375 / 390 / 414 / 768px)
- [ ] Attendance roster, check-in, certificate, impact, my-missions, upload controls usable; no horizontal overflow; 44px targets.

## Build
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` passes (stop the dev server first).
