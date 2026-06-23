# Phase 5 — Test Checklist

Use an **organizer-role account** ([phase-5-test-data.md](phase-5-test-data.md)). Tick each.

## Onboarding & access
- [ ] Organizer with no org → any `/manage/*` page redirects to `/manage/onboarding`.
- [ ] Submitting onboarding (name + short description required) creates the org and lands on `/manage/dashboard`.
- [ ] Sidebar shows the real org name; badge is **not** "Verified" (status is `not_required`).
- [ ] A **volunteer** account visiting `/manage/*` is bounced (route protection).

## Create / edit mission
- [ ] `/manage/missions/new` → **Save as draft** creates a draft (not on `/explore`) and opens the edit page.
- [ ] **Save & publish** with all required fields → mission goes live on `/explore`; public detail page works.
- [ ] Publish with missing fields → friendly message lists what's needed; mission stays a draft.
- [ ] Edit a mission → changes persist; editing a published mission updates the public page.
- [ ] Validation: end before start, capacity ≤ 0, age outside 0–120 all show friendly errors (no raw DB error).
- [ ] **Private details** (address/contact) save and are **NOT** visible on the public mission page (check logged out).

## Lifecycle
- [ ] Published → **Pause** (leaves `/explore`) → **Resume** (returns).
- [ ] Published/paused → **Close**; closed → **Archive**.
- [ ] **Cancel** works from draft/published/paused; cancelled → **Archive**.
- [ ] Invalid transitions aren't offered, and are rejected if forced.

## Applications
- [ ] Volunteer applies → appears under **Pending** in `/manage/applicants` and the mission's applications page.
- [ ] **Approve** increments approved count; at capacity, approve is blocked with a "full / use waitlist" message.
- [ ] **Waitlist** and **Decline** work; optional private note saves.
- [ ] Private-profile volunteer shows as initials + "Volunteer" (no fabricated details).
- [ ] Sidebar **Applicants** badge reflects the real pending count.

## Dashboard & settings
- [ ] Dashboard counts (active, drafts, pending, approved) match reality; next-upcoming + recent applicants are real.
- [ ] Settings edits name/description/urls/city/country/is_public and persists.
- [ ] Settings cannot change verification status (no such field; trigger would block it anyway).
- [ ] Verification banner shows the correct informational message and never blocks publishing.

## Security / isolation
- [ ] Second org cannot open or edit the first org's mission (`/manage/missions/<other-id>/edit` → 404).
- [ ] Second org sees none of the first org's applicants.
- [ ] SQL spot-check: `status`, `published_at`, `reviewed_by`, `reviewed_at`, `verification_status='not_required'` all correct.

## Responsive
- [ ] `/manage` pages at 320–414px: forms are sectioned and usable, mission/applicant cards aren't squeezed, tap targets ~44px.

## Build
- [ ] `npx tsc --noEmit` clean.
- [ ] `npm run build` succeeds (stop the dev server first — building over a live dev server corrupts `.next`).
