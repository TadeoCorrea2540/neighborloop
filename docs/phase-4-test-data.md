# Phase 4 — test data

No real missions exist until an organizer publishes one (Phase 5). To exercise the
volunteer workflow now, seed a demo org + published missions. **No fake users are
created** — the org is owned by your real account.

## Steps (Supabase Dashboard → SQL Editor)
1. **Create the demo org** (once): open `supabase/demo/demo-org-mission.sql`, set
   `v_owner_email` to your account email, run it. (Creates the `greenroots-demo`
   org owned by your profile + one mission.)
2. **Add the test missions:** open `supabase/demo/demo-missions.sql`, run it. Adds
   5 published missions across categories with a mix of `application_mode`:
   - `demo-ocean-beach-cleanup` is **`open`** → applying auto-approves (good for
     testing the "You're in" + Upcoming flow and spots-left).
   - the others are **`request`** → applying creates a **pending** application.

## What this enables
- **Explore** shows real missions; filters (category/when/format/beginner/difficulty/sort) and search work.
- **Mission detail** loads real data; Save and Apply work.
- **My Missions** populates: Saved, Applications (pending), Upcoming (after applying to the `open` one), Past, Cancelled.
- **Dashboard / Impact** show real counts.

## Verifying directly (optional)
```sql
-- your applications + their status
select m.title, a.status, a.applied_at
from public.applications a
join public.missions m on m.id = a.mission_id
where a.volunteer_id = auth.uid();  -- run as your user, or filter by email join

-- spots left for a mission
select * from public.get_mission_spot_counts(
  array(select id from public.missions where slug = 'demo-ocean-beach-cleanup')
);
```

## Cleanup
Delete the demo rows with `supabase/demo/demo-org-mission-teardown.sql` (and
`delete from public.missions where slug like 'demo-%';` for the extra missions).
