# Phase 5 — Organizer Core Workflow

Makes the **organizer** side run on real Supabase data while preserving the design. The volunteer side (Phase 4) and auth/roles (Phase 3) stay unchanged.

## Journey
Sign up as **Organizer** → verify email → **onboarding** creates the org → **create mission** (draft or publish) → **edit** + add private details → **manage lifecycle** (pause/resume/close/cancel/archive) → **review applicants** (approve/decline/waitlist) → **dashboard** shows real counts → **settings** edits the org profile.

## Routes (app uses `/manage/*`; the spec's `/organization/*` maps here)
- `/manage/dashboard` — real summary: active/draft missions, pending applications, approved volunteers, next upcoming, recent applicants, your-missions mini-list.
- `/manage/missions` — real list of **all** your missions (incl. drafts) with status filter + search, per-row approved/capacity + pending badge, Edit / Applicants links.
- `/manage/missions/new` — create form (Save draft / Save & publish).
- `/manage/missions/[id]/edit` — edit form + lifecycle status bar + **private details** subform. 404 if the mission isn't your org's.
- `/manage/missions/[id]/applications` — review applicants for one mission (capacity shown).
- `/manage/applicants` — review applicants across all your missions.
- `/manage/settings` — org profile editor + informational verification banner.
- `/manage/onboarding` — create the org (fuller fields).
- `/manage/attendance`, `/manage/reports` — remain clearly-marked placeholders (out of scope).

## Key product decision — publishing does NOT require verification
New orgs are created with `verification_status = 'not_required'` (overriding the schema default `'pending'`). Publishing is gated by **mission-field completeness only**. The "✓ Verified" badge appears only when an admin sets `verified` (Phase 6). See [organization-onboarding.md](organization-onboarding.md).

## Security model (no RLS changes — existing policies already cover this)
- Every organizer server action: **role check** (organizer/admin) → **org membership** → **per-mission ownership** (`organization_id === orgId`) → validate/transition → mutate → revalidate. RLS (`is_org_manager`) is the final gate.
- Private data never leaks: `mission_private_details` and `organizer_note` are never rendered on public pages; private-profile volunteers show as initials + "Volunteer".
- Org-update payloads **exclude** `verification_status` / `verification_note` (DB trigger `trg_guard_org_verification` blocks non-admins).
- No service-role key anywhere in client/server-action code.

## Data tables used
`organizations`, `organization_members`, `missions`, `mission_categories`, `mission_private_details`, `applications`, `profiles`.

## Files
- Data: `lib/data/organization-membership.ts`, `organization-missions.ts`, `organization-applications.ts`, `organizer-dashboard.ts`, `mission-private-details.ts`.
- Guard/types: `lib/auth/require-organizer.ts`, `types/domain.ts` (`toMissionFull`, `OrganizerMission`, `OrganizerApplication`), `lib/slug.ts`.
- Actions: `app/manage/missions/actions.ts`, `app/manage/applications/actions.ts`, `app/manage/onboarding/actions.ts`, `app/manage/settings/actions.ts`.
- UI: `components/manage/mission-form.tsx`, `mission-status-actions.tsx`, `private-details-form.tsx`, `applications-review.tsx`, `missions-list.tsx`; the `/manage/*` pages; `components/org-shell.tsx` (real org name/badge/pending count).

## See also
[organizer-actions.md](organizer-actions.md) · [mission-lifecycle.md](mission-lifecycle.md) · [application-review-flow.md](application-review-flow.md) · [phase-5-test-checklist.md](phase-5-test-checklist.md) · [phase-5-test-data.md](phase-5-test-data.md)
