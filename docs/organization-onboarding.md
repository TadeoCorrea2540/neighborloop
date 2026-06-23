# Organization Onboarding

How an organizer account gets an organization, and why publishing doesn't wait on verification.

## Flow
1. User signs up choosing **Organizer** → the `handle_new_user` trigger assigns the `organizer` role (admin is never self-assignable).
2. After email verification, the organizer lands in `/manage`. Pages that need an org redirect to **`/manage/onboarding`** when none exists (`requireOrganizer()` returns `code:'no_org'`).
3. `OnboardingForm` collects name, type, city, country, short description and calls `createOrganizationAction`.
4. The action inserts the `organizations` row and the owner's `organization_members` row (RLS lets the owner self-insert), then redirects to `/manage/dashboard`.

## Verification status decision (locked)
New orgs are created with **`verification_status = 'not_required'`** (overriding the schema default `'pending'`).

- **Publishing is gated by mission-field completeness only**, never by verification. An unverified org can publish immediately.
- The **"✓ Verified"** badge (public pages + sidebar) appears only when an admin sets `verification_status = 'verified'` — that admin flow is Phase 6.
- Settings shows an informational banner per status (`not_required` / `verified` / `pending` / `rejected`) that **never blocks** publishing.

## The verification guard trigger
`trg_guard_org_verification` raises if a non-admin UPDATE changes `verification_status` or `verification_note`. Therefore `updateOrganizationAction` (settings) **must not** include those two columns — it edits name/description/urls/city/country/is_public only. Slug is immutable after creation (public URLs depend on it).

## Org types
`organization_type` enum: nonprofit, school, university, student_club, community_group, faith_group, local_business, **family_individual**, other. The onboarding `<select>` lists all of them.
