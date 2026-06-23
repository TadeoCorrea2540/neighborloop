# Admin Route Protection

Admin access is enforced in **three** independent layers — never by hiding buttons alone.

## 1. Middleware (`middleware.ts`)
`/admin` is in `PROTECTED_PREFIXES`. An **anonymous** request to any `/admin/*` path is redirected to `/auth?redirect=<path>` before the page renders.

## 2. Layout role gate (`app/admin/layout.tsx`)
`await requireRole("admin")` runs for every admin page. `requireRole` (`lib/auth/server.ts`) resolves the role from the **`user_roles`** table via `getCurrentUserRole()` (highest-privilege wins) — not from editable profile data, and not from JWT claims. Wrong role → `redirect(dashboardPathForRole(role))`:
- volunteer → `/dashboard`
- organizer → `/manage/dashboard`
- no role / anon → `/auth`

So: anonymous → `/auth`; volunteer/organizer → their own dashboard; admin → allowed. No redirect loops (each role's target is outside `/admin`).

## 3. Server actions + RLS
Every admin server action calls `requireAdmin()` (`lib/auth/require-admin.ts`) → `{ ok, userId, role:'admin' }` or `{ ok:false, code:'auth'|'role' }`. It re-checks the role server-side on every mutation; client-provided ids are never trusted for authorization. The database is the final gate: all admin reads/writes pass RLS `public.is_admin()` (a `SECURITY DEFINER` check against `user_roles`).

## Admin role assignment
The admin role is **never** self-assignable: `user_roles` INSERT/UPDATE is admin-only (RLS), the signup trigger only ever grants `volunteer`/`organizer`, and there is no frontend path to grant admin. Admin is assigned manually via SQL by a trusted operator — see [phase-6-test-data.md](phase-6-test-data.md).

## What non-admins see
- Anonymous: bounced to `/auth` by middleware.
- Volunteer/organizer: bounced to their own dashboard by the layout.
- Admin-only data (verifications' internal notes, all reports, audit events) returns **nothing** to non-admins even if a query somehow ran — RLS denies it.
