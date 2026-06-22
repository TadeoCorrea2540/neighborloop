# Phase 3 — Supabase Auth setup (manual dashboard steps)

These are the **one-time** settings you must configure in the Supabase dashboard
for Phase 3 auth to work. Code is already in place; these connect it to Supabase.

## 1. Apply the migrations
Migrations `008` (profile columns), `009` (provisioning trigger), and `010`
(locks the provisioning functions so only the trigger / authenticated self-heal
can call them) make up the auth backend. Apply them:

```bash
cd neighborloop
npm run db:push          # review the list, confirm Y
npm run db:types         # regenerate types/database.generated.ts
```

`009` creates a trigger on `auth.users` that auto-creates the profile + assigns
the (whitelisted) role on every signup. **`admin` can never be assigned this way.**

## 2. Email confirmations
Dashboard → **Authentication → Providers → Email** → enable **"Confirm email."**
(If this is off, signup logs the user in immediately and the email step is skipped;
the trigger still provisions the profile/role.)

## 3. URL configuration
Dashboard → **Authentication → URL Configuration**:
- **Site URL:** `http://localhost:3000`
- **Redirect URLs (allow list):**
  ```
  http://localhost:3000/auth/confirm
  http://localhost:3000/auth/callback
  http://localhost:3000/reset-password
  ```
For production later, add the same paths under your real domain.

## 4. Email templates — NOTHING TO DO on the free tier
The default Supabase templates use `{{ .ConfirmationURL }}`, which (with PKCE)
sends the user to your **`emailRedirectTo`** (`/auth/callback`) carrying a `?code`
that our [callback handler](../app/auth/callback/route.ts) exchanges for a
session. So the **default templates work as-is** — no editing needed.

> Editing template subject/body is gated behind **custom SMTP** on the free tier
> (the dashboard will say "Set up custom SMTP to edit templates"). You can skip it.

Caveat of the default (code) flow: the confirmation link should be opened in the
**same browser** that started signup (PKCE stores a verifier cookie there). That's
the normal case. If you later set up custom SMTP, you can switch to the more robust
token-hash links pointing at `/auth/confirm` (handler already included) — see
[phase-3-auth-flow.md](./phase-3-auth-flow.md).

The default built-in email sender is fine for local testing (low volume).

## 5. Admin role
Admins are **never** created through the UI. Assign manually — see
[admin-role-setup.md](./admin-role-setup.md).

## How to test locally
1. `npm run dev`, open `http://localhost:3000/auth`.
2. Sign up as a volunteer → you should see **"Check your email."**
3. Open the confirmation email → click the link → you land on `/dashboard`.
4. Sign up as an organizer → after confirming you land on `/manage/onboarding`.
5. Password reset: `/forgot-password` → email → `/reset-password` → new password.

## Troubleshooting
- **Clicking the email link hits `/auth/error`** → the email template still uses
  `{{ .ConfirmationURL }}`; switch it to the token-hash form (step 4).
- **"Please verify your email before continuing" on login** → confirmation email
  not clicked yet, or confirmations were toggled after the account was made.
- **Stuck/looping redirects** → ensure `/auth/confirm` & `/reset-password` are on
  the redirect allow list and Site URL matches the origin you're testing.
- **No email arrives** → check spam; Supabase's built-in SMTP is rate-limited.
  Resend from the dashboard (Authentication → Users → user → "Send confirmation").
