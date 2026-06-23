# Phase 6 — Test Data

Phase 6 is admin-facing. You need an **admin account**, plus an organizer + org to verify and (optionally) a report to triage. Admin role assignment is **manual/trusted** — there is no self-assignment in the app.

## 0. Apply the migrations
In Supabase, run:
- `supabase/migrations/012_audit_events_insert.sql` — admin-only INSERT policy on `audit_events` (without it, decisions still apply but the audit log can't be written).
- `supabase/migrations/013_verification_one_pending.sql` — partial unique index so an org can have only one open verification request (also cleans up any existing duplicate pending rows).

## 1. Create an admin account
Sign up normally (any role), verify the email, then promote to admin via the SQL editor (service-role context):
```sql
insert into public.user_roles (user_id, role)
select u.id, 'admin'
from auth.users u
where u.email = 'you+admin@example.com'
on conflict (user_id, role) do nothing;
```
Sign out/in so the new role is picked up. (Admin is highest-precedence, so this account now lands on `/admin`.)

## 2. Create an organizer + organization
Use a separate account: sign up as **Organizer** → verify → onboarding creates the org (status `not_required`). See [phase-5-test-data.md](phase-5-test-data.md).

## 3. Produce a verification request
As the organizer, go to `/manage/settings` → **Request verification**. A pending row appears in the admin queue (`/admin/verification`).
*(SQL fallback if needed:)*
```sql
insert into public.organization_verifications (organization_id, submitted_by, status)
select o.id, o.owner_id, 'pending'
from public.organizations o
where o.slug = '<your-org-slug>';
```

## 4. Review as admin
At `/admin/verification` → open the request → **Approve** (org gets the ✓ badge on `/org/<slug>` and in organizer settings) or **Reject** with a public reason (organizer sees the reason in settings; the internal note stays hidden).

## 5. File a report (to test triage)
Reporting UI is a later phase, so seed one via SQL (replace ids/emails). Exactly one target column must be set:
```sql
-- report a mission
insert into public.reports (reporter_id, mission_id, reason, details, status)
select p.id, m.id, 'Spam', 'Looks like a scam listing.', 'open'
from public.profiles p, public.missions m
where p.id = (select id from auth.users where email='you+admin@example.com')
  and m.slug = '<a-mission-slug>';
```
Then at `/admin/reports` → open it → **Resolve** or **Dismiss** (optional internal note).

## 6. Moderate a mission
At `/admin/missions`, find a **published** mission → **Pause** (enter a reason). Confirm it leaves `/explore`.

## 7. Verify the audit trail (SQL)
```sql
select event_type, entity_type, actor_id, metadata, created_at
from public.audit_events order by created_at desc limit 20;
```
Each decision above should have a row. Confirm a **non-admin** account selecting `audit_events` / `reports` / `organization_verifications` gets **zero rows** (RLS).

## Notes
- No service-role key is used in app code. The SQL above runs in the Supabase dashboard (service role) for test setup only.
- Never expose admin self-assignment in the frontend.
