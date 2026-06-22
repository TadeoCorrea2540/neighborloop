# Phase 2 — Backend Foundation

## What this phase delivers
A secure, migration-driven **Supabase foundation** for NeighborLoop:

- Supabase SSR clients (`@supabase/ssr`) for browser + server.
- A full PostgreSQL schema via ordered SQL migrations.
- A secure three-role model (`volunteer`, `organizer`, `admin`) with role checks separated from editable profile data.
- Row Level Security on **every** table (default-deny).
- Seeded public taxonomy (`mission_categories`).
- A typed, server-safe data-access layer + repository seams.
- Database-mirroring TypeScript types + a regeneration command.
- Safe environment handling + a validator.
- Documentation (this file, schema, RLS matrix, setup, checklist, demo seeding).

## What this phase intentionally does NOT do
No auth UI, email verification, OAuth, password reset, route-protection middleware, dashboard redirects, organization onboarding, mission/application submission UI, approval UI, realtime, notifications, QR attendance, certificates, PDF, payments, AI, production analytics, or storage upload flows. Those are later phases.

## Architecture overview
```
supabase/
  config.toml
  migrations/001..006_*.sql   ← schema, helpers, RLS, storage
  seed.sql                    ← stable taxonomy only
lib/
  supabase/{browser,server,env}.ts   ← SSR clients + env guard
  data/{missions,organizations,profiles,applications,moderation}.ts  ← typed queries
  repositories/{mission,organization,profile}-repository.ts          ← adapter seams
types/
  database.generated.ts       ← DB types (regenerate once linked)
  domain.ts                   ← UI-friendly models + mappers
scripts/validate-env.ts
docs/*.md
```
Existing UI (inline styles + CSS; `lib/data.ts` mock data) is **untouched**.

## How mock data and Supabase coexist (for now)
- All Phase-1 pages still import the existing mock data in `lib/*.ts` and render exactly as before.
- The new Supabase data layer is **available but not wired into any page**.
- Pages migrate one at a time by switching from mock data to the matching repository/data function. The repository layer (`lib/repositories/*`) is the swap point.

### Recommended migration order (Phase 3+)
1. Explore page
2. Mission detail page
3. Public organization profile
4. Volunteer dashboard
5. Organization dashboard
6. Admin dashboard

> Do not ship a silent production fallback to mock data. When a page is migrated, it should use live data intentionally; mock data stays only for not-yet-migrated pages and local development.

## Connection status
Supabase is **prepared locally, not connected** — no project ref or credentials were provided. All files, migrations, and docs exist and type-check. To connect, follow `docs/supabase-setup.md` and complete `docs/phase-2-manual-checklist.md`.

## What Phase 3 will add
- Real authentication (sign up / log in / sign out) using the SSR clients.
- A profile + default-role bootstrap (trigger on `auth.users` insert) to create a `profiles` row and assign the `volunteer` role.
- Session middleware + protected routes/dashboards.
- Wiring the Explore and mission-detail pages to live data.
