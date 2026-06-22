# Phase 3 — Auth test checklist

Run after `npm run db:push` + `npm run db:types` and the dashboard config
(see [phase-3-auth-setup.md](./phase-3-auth-setup.md)). Start a fresh dev server.

```
[ ] Volunteer signup works (shows "Check your email")
[ ] Organizer signup works (shows "Check your email")
[ ] Invalid email shows an inline error
[ ] Weak password (<8 chars) shows an error
[ ] Missing Terms acceptance shows an error
[ ] Verification email is sent
[ ] Unverified user cannot log in (sees "verify your email")
[ ] Verified volunteer link → /dashboard
[ ] Verified organizer link → /manage/onboarding (no org yet)
[ ] Organizer onboarding creates org → /manage/dashboard
[ ] Login works (correct dashboard by role)
[ ] Logout works (sidebar + /settings) → /auth
[ ] Forgot password sends a reset email (generic success message)
[ ] Reset password updates password → /auth?reset=success
[ ] SECURITY: signup with selected_role tampered to "admin" → user gets "volunteer"
[ ] Volunteer cannot access /manage/* (redirected to /dashboard)
[ ] Volunteer cannot access /admin (redirected to /dashboard)
[ ] Organizer cannot access /admin (redirected to /manage/dashboard)
[ ] Anonymous hitting /dashboard, /manage, /admin → /auth
[ ] Admin (manually assigned) can access /admin and /admin/verify
[ ] Public pages work logged-out: / /explore /for-volunteers /for-organizers /pricing /missions/[slug] /org/[slug]
[ ] No redirect loops anywhere
[ ] Mobile auth pages still look correct (signup steps, login)
[ ] Dashboard greeting uses the real display_name (fallback "Welcome back")
```

## Quick security spot-check (no email needed)
After `db:push`, in Supabase SQL Editor you can confirm the whitelist directly:

```sql
-- simulate metadata claiming admin; provisioning must yield 'volunteer'
select public.jsonb_text_array('{"interests":["a","b"]}'::jsonb, 'interests'); -- => {a,b}
```
Then after a real signup, verify the row:
```sql
select ur.role from public.user_roles ur
join auth.users u on u.id = ur.user_id
where u.email = 'tester@example.com';
```
