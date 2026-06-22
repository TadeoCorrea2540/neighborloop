# Phase 3 — Route protection strategy

Two layers of defense (plus RLS at the database):

1. **`middleware.ts`** — refreshes the Supabase session cookie on every request
   and redirects **anonymous** users away from protected path prefixes to `/auth`.
   It is role-agnostic (role is a DB row, not the JWT).
2. **Server layout guards** — the three route-group layouts run role checks via
   `requireAuth` / `requireRole` ([lib/auth/server.ts](../lib/auth/server.ts)) and
   redirect wrong-role users to **their own** dashboard.
3. **RLS** — even if both app-layer checks were bypassed, the database only lets a
   user read/write their own data.

## Public (no auth)
```
/  /explore  /for-volunteers  /for-organizers  /pricing
/auth  /auth/confirm  /auth/callback  /auth/error
/forgot-password  /reset-password  /login  /signup
/missions/[slug]  /org/[slug]
```

## Volunteer area — `app/(volunteer)/layout.tsx`
`/dashboard /my-missions /impact /badges /messages /settings`
- Allowed: **volunteer**, **admin**. Organizer → redirected to `/manage/dashboard`.
- Anonymous → `/auth` (middleware).

## Organizer area — `app/manage/layout.tsx`
`/manage/dashboard /manage/onboarding /manage/missions /manage/missions/new
/manage/applicants /manage/attendance /manage/reports`
- Allowed: **organizer**, **admin** (`requireRole(['organizer','admin'])`).
- Volunteer → redirected to `/dashboard`. Anonymous → `/auth`.
- An organizer with **no organization yet** is sent to `/manage/onboarding`
  (checked in the dashboard page, not the layout, to avoid a redirect loop).

## Admin area — `app/admin/layout.tsx`
`/admin /admin/verify`
- Allowed: **admin** only (`requireRole('admin')`).
- Everyone else → their own dashboard / `/auth`.

## Loop safety
- Middleware redirects only when there is **no user**; layouts redirect only on
  **role mismatch**, always to a dashboard whose own layout admits that role.
- `/auth*`, `/reset-password`, `/forgot-password` are NOT protected prefixes, so an
  anonymous user redirected there is never redirected again.

## Where it's implemented
- [middleware.ts](../middleware.ts) — session refresh + anonymous gate + matcher.
- [lib/auth/server.ts](../lib/auth/server.ts) — `requireAuth`, `requireRole`, role lookup.
- [lib/auth/redirect-by-role.ts](../lib/auth/redirect-by-role.ts) — role → path mapping.
- The three group `layout.tsx` files — call the guards above the Shell components.
