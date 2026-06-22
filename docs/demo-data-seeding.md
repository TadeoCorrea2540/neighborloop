# Demo Data Seeding

`supabase/seed.sql` contains **only stable, safe taxonomy** (`mission_categories`).
It intentionally seeds **no users, profiles, organizations, missions, emails, or
verification documents** — those involve real `auth.users` rows and PII-adjacent data
and must be created through real (test) accounts after Phase 3 authentication exists.

## Why no demo users/orgs/missions yet
- `profiles.id` and ownership FKs reference `auth.users(id)`. Seeding fake rows would mean
  fabricating auth users, which is fragile and can leak into production.
- RLS is owner/role-scoped; meaningful demo data needs real authenticated sessions to test.

## How to create demo data safely (after Phase 3 auth)
Use a **non-production** project (or local stack) and real sign-ups:

1. Start local stack (optional): `npx supabase start` → sign up test users in the app.
2. Promote one test user to admin (SQL editor / psql), e.g.:
   ```sql
   insert into public.user_roles (user_id, role)
   values ('<test-user-uuid>', 'admin')
   on conflict do nothing;
   ```
   (The first admin must be set this way — admins cannot self-grant via the app.)
3. As a test organizer, create an organization (becomes `owner`), then add the owner
   membership row, then create `draft` → `published` missions.
4. As a test volunteer, save missions / apply.

## Optional dev seed (future)
A `supabase/seed.dev.sql` could insert demo orgs/missions **bound to known local test-user
UUIDs** for a repeatable local environment. Keep it out of production and out of the default
`seed.sql`. Not included in Phase 2 to avoid fake/sensitive data.

> Never seed fake real users, private profiles, sensitive organizations, real email
> addresses, or verification documents.
