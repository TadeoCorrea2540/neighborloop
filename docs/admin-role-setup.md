# Phase 3 — Admin role setup

Admin is **never** self-assignable. There is no admin option in signup, and the
provisioning trigger whitelists roles to `volunteer`/`organizer` — passing
`admin` in signup metadata is ignored and collapses to `volunteer`.

## Assign admin manually (development)
1. Create or identify the account (Dashboard → **Authentication → Users**).
2. Dashboard → **SQL Editor** → run (replace the email):

```sql
insert into public.user_roles (user_id, role)
select id, 'admin'::app_role
from auth.users
where email = 'you@example.com'
on conflict (user_id, role) do nothing;
```

3. Log out and back in. You'll be routed to `/admin`.

## Why admin can't be self-assigned
- `user_roles` INSERT RLS requires `is_admin()`, so no normal client/user can write
  any role row.
- The only writers are the SECURITY DEFINER provisioning functions, which whitelist
  the role and never emit `admin`.
- Therefore admin can only be granted by someone with direct DB access (you).

## Verify admin protection
- As a **volunteer/organizer**, visiting `/admin` → redirected to your dashboard.
- As **anonymous**, `/admin` → redirected to `/auth`.
- As **admin**, `/admin` and `/admin/verify` load.

## Remove an admin
```sql
delete from public.user_roles
where role = 'admin'
  and user_id = (select id from auth.users where email = 'you@example.com');
```
