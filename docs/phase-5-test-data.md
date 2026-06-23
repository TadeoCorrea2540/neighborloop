# Phase 5 — Test Data

Phase 5 is the **organizer** side, so you need an **organizer-role account**. The Phase 4 demo org is owned by a *volunteer-role* account on purpose (so volunteer testing works) — that account **cannot** reach `/manage`.

## Option A (recommended) — real organizer signup
1. Sign up with a fresh email and choose **Organizer**. The `handle_new_user` trigger assigns the `organizer` role.
2. Verify the email (see [phase-3-auth-setup.md](phase-3-auth-setup.md) for the free-tier rate-limit note).
3. Log in → you're routed to `/manage/onboarding` (no org yet).
4. Create the org → you land on `/manage/dashboard`.
5. Create a mission draft → publish → it appears on `/explore`.
6. From a **separate volunteer account**, apply to that mission.
7. Back in the organizer account, review the application at `/manage/applicants`.

## Option B — promote an existing account to organizer
Run in the Supabase SQL editor (replace the email). This only flips the role; it doesn't fabricate any data.

```sql
update public.profiles p
set role = 'organizer'
from auth.users u
where u.id = p.id
  and u.email = 'you+org@example.com'
  and p.role <> 'admin';   -- never silently change an admin
```
Then sign out/in (or refresh) so the new role is picked up, and continue from step 3 above.

## Verify with SQL (after acting in the UI)
```sql
-- mission status + published timestamp
select id, title, status, published_at from public.missions order by created_at desc limit 5;

-- application review fields land correctly
select id, status, reviewed_by, reviewed_at, organizer_note
from public.applications order by applied_at desc limit 10;

-- new org has verification_status = 'not_required'
select name, verification_status, is_public from public.organizations order by created_at desc limit 5;
```

## Cross-org isolation check
Create a **second** organizer account + org. Confirm that org A cannot load org B's mission edit page (`/manage/missions/<B's id>/edit` → 404) and sees none of B's applicants. This is enforced by RLS + per-action ownership checks.

## Notes
- No fake/seeded real users — accounts are created through normal signup.
- Private details (`mission_private_details`) and `organizer_note` must never appear on public pages — verify by opening the public mission page logged out.
