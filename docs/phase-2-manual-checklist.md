# Phase 2 — Manual Checklist

Actions only you can do (browser/terminal). Full details in `docs/supabase-setup.md`.

```txt
[ ] Create a Supabase project (dashboard)
[ ] Copy Project URL + Publishable key
[ ] cp .env.example .env.local  and fill both NEXT_PUBLIC_ values
[ ] Confirm .env.local is git-ignored  (git check-ignore .env.local)
[ ] npm run validate:env   → should print ✓
[ ] npx supabase login
[ ] npx supabase link --project-ref <your-project-ref>
[ ] npx supabase db push          (apply migrations 001–006)
[ ] Verify RLS is ON for every table (Dashboard → Auth → Policies, or Table editor)
[ ] Verify mission_categories has 12 rows (apply seed.sql if needed)
[ ] Create storage buckets if the migration logged a notice (mission-media,
    organization-media = public; verification-documents = private)
[ ] npm run db:types              (regenerate types/database.generated.ts)
[ ] npx tsc --noEmit              (clean)
[ ] npm run build                 (succeeds)
```

## Security sign-off (please confirm)
```txt
[ ] No service-role/secret key is in any NEXT_PUBLIC_* variable
[ ] .env.local is NOT committed
[ ] Anonymous read returns only published missions + public orgs/categories
[ ] user_roles cannot be written by a normal user (admin-only)
```
