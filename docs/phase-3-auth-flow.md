# Phase 3 — Auth flow reference

## Signup
1. User fills `/auth` (combined page). Role = **Volunteer** or **Organizer**
   (host: organization / family / individual). `admin` is never selectable.
2. Final submit → `signUpAction` ([app/auth/actions.ts](../app/auth/actions.ts)) calls
   `supabase.auth.signUp({ email, password, options: { data, emailRedirectTo } })`.
   All non-PII profile fields go into `options.data` (→ `raw_user_meta_data`).
3. The DB trigger `handle_new_user` ([009](../supabase/migrations/009_handle_new_user.sql))
   fires on the `auth.users` insert and creates the `profiles` row + assigns the
   whitelisted role (`volunteer`/`organizer` only).
4. UI shows **"Check your email to verify your account."**

## Email verification
1. User clicks the email link → `/auth/confirm?token_hash=…&type=signup`
   ([route](../app/auth/confirm/route.ts)).
2. `verifyOtp` exchanges the token for a session, then `ensure_user_provisioned`
   runs as a self-heal fallback, then the user is redirected **by role**:
   volunteer → `/dashboard`, organizer → `/manage/dashboard` (→ onboarding if no org),
   admin → `/admin`.
3. Failures → `/auth/error` (no raw tokens or stack traces shown).

## Profile creation
- Created by the trigger from signup metadata. Fields: `display_name`, `full_name`,
  `bio`, `city`, `region`, `interests`, `skills`, `availability`, `education_level`,
  `volunteer_experience`, `transport`, `referral_source`, `is_profile_public`.
- **Not stored** (PII): phone, exact age. Email stays in Supabase Auth only.
- Fallback display name: **"New neighbor"**.

## Role assignment
- Only via `handle_new_user` / `ensure_user_provisioned` (both SECURITY DEFINER),
  because `user_roles` INSERT requires `is_admin()` under RLS.
- Role value is **whitelisted** to `volunteer`/`organizer`; anything else → `volunteer`.
- Users cannot self-assign or escalate. Admin is manual only.

## Login
1. `/auth` (Log in tab) → `signInAction` → `signInWithPassword`.
2. On success, role is read and the user is redirected to their dashboard.
3. Unverified email → friendly "verify your email" message. Bad credentials →
   "that email or password didn't match."

## Logout
- `signOutAction` → `supabase.auth.signOut()` → redirect `/auth`.
- Available in the volunteer/org/admin sidebars and on `/settings`.

## Password reset
1. `/forgot-password` → `requestPasswordResetAction` → `resetPasswordForEmail`.
   Always shows a generic success (anti-enumeration).
2. Email link → `/auth/confirm?type=recovery` → session → `/reset-password`.
3. `/reset-password` → `updatePasswordAction` → `updateUser({ password })` →
   redirect `/auth?reset=success`.
