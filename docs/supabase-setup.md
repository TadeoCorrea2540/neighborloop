# Supabase Setup

Step-by-step to connect NeighborLoop to a Supabase project and run the Phase 2 schema.

## 1. Create a Supabase project
1. Go to <https://supabase.com/dashboard> → **New project**.
2. Pick an org, name (e.g. `neighborloop`), database password, and region.
3. Wait for provisioning.

## 2. Retrieve URL + publishable key
- **Project URL:** Project Settings → **Data API** (or **API**) → *Project URL*.
- **Publishable key:** Project Settings → **API keys** → *Publishable* (or legacy *anon public*).
  This key is safe for the browser.
- **Do NOT** copy the *service-role* / *secret* key into any `NEXT_PUBLIC_*` variable.

## 3. Add `.env.local`
```bash
cp .env.example .env.local
```
Fill in:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR-publishable-key
```
- `.env.local` is **git-ignored** (`.gitignore` has `.env*.local`) — never commit it.
- Validate: `npm run validate:env`

## 4. Install / log in to the Supabase CLI
The CLI is a dev dependency (`supabase`). Use it via `npx supabase ...`.
```bash
npx supabase login        # opens browser, paste access token
```

## 5. Link the local project
Find your project ref in the dashboard URL (`.../project/<ref>`).
```bash
npx supabase link --project-ref <your-project-ref>
```

## 6. Run migrations
Pushes everything in `supabase/migrations/` (001 → 006) to the linked database.
```bash
npx supabase db push
```
> Review first if you like: `npx supabase db push --dry-run`.
> Migrations are **non-destructive** (no drops/resets). Do not run `db reset` against a
> database with real data — it wipes and re-seeds.

## 7. Generate database types
Overwrites the placeholder with types from the live schema:
```bash
npm run db:types
# = npx supabase gen types typescript --linked --schema public > types/database.generated.ts
```

## 8. Verify seed data
`seed.sql` seeds `mission_categories`. With local dev DB: `npx supabase db reset` re-applies
migrations + seed. Against a linked remote, apply seed manually:
```bash
# Local stack:
npx supabase start && npx supabase db reset
# Or apply seed to the linked DB via the SQL editor / psql using supabase/seed.sql
```
Confirm in Dashboard → Table editor → `mission_categories` (12 rows).

## 9. Run the app locally
```bash
npm run dev
```
Existing pages keep working on mock data. Live Supabase data is wired in per the migration
order in `docs/phase-2-backend-foundation.md` during later phases.

## 10. Storage buckets
`006_storage_foundation.sql` attempts to create `mission-media`, `organization-media`
(public) and `verification-documents` (private). If your environment didn't create them
(the migration logs a notice), create them manually: Dashboard → **Storage** → New bucket,
matching those names and public/private flags. Bucket **policies** are added in Phase 7.

## Troubleshooting
- **"Missing Supabase env var(s)"** at runtime → fill `.env.local`, restart `npm run dev`.
- **`db push` auth error** → re-run `npx supabase login`, confirm `link` ref.
- **Types out of date / TS errors after schema change** → re-run `npm run db:types`.
- **RLS returns no rows when you expect some** → that's RLS working; confirm you're the
  owner/member/admin, or that the mission is `published` for public reads.
- **Never** disable RLS to "fix" access; adjust policies instead.
