-- ============================================================
-- demo-org-mission.sql · OPTIONAL demo data to verify the live read path
--
-- Seeds ONE organization + ONE published mission, owned by a REAL auth user
-- that YOU create (no fabricated users). Idempotent: safe to re-run.
--
-- ──────────────── HOW TO USE ────────────────
-- 1. Supabase Dashboard → Authentication → Users → "Add user".
--      • Enter a real email you control (or a throwaway you own) + a password.
--      • This is a genuine account — NOT a fake seeded user.
-- 2. Put that exact email in v_owner_email below (replace CHANGE_ME).
-- 3. Supabase Dashboard → SQL Editor → paste this whole file → Run.
-- 4. Visit:  /org/greenroots-demo   and   /missions/community-garden-planting-demo
--
-- To remove later, run supabase/demo/demo-org-mission-teardown.sql
-- (deletes only these demo rows; the auth user you remove yourself in the
-- Authentication tab).
--
-- This file is NOT a migration and is NOT applied by `supabase db push`.
-- ============================================================

do $$
declare
  v_owner_email text := 'CHANGE_ME@example.com';   -- ← the auth user's email
  v_owner    uuid;
  v_org      uuid;
  v_category uuid;
begin
  -- Resolve the real auth user (created in the dashboard) by email.
  select id into v_owner from auth.users where email = v_owner_email;
  if v_owner is null then
    raise exception
      'No auth user with email %. Create one first: Dashboard → Authentication → Users → Add user, then set v_owner_email.',
      v_owner_email;
  end if;

  -- Public profile (no PII). 1:1 with the auth user.
  insert into public.profiles (id, display_name, full_name, city, country_code, is_profile_public)
  values (v_owner, 'GreenRoots Demo', 'Demo Owner', 'San Francisco', 'US', true)
  on conflict (id) do update set display_name = excluded.display_name;

  -- NOTE: we intentionally do NOT grant the organizer role here. For Phase 4
  -- volunteer testing the owner account must stay a volunteer (organizer role
  -- would redirect it away from the volunteer pages). Owning an org as a
  -- volunteer-role account is fine for seeding test data. To later test the
  -- organizer side, grant organizer to a separate account.

  -- Organization (public + verified so the badge shows). verification_status is
  -- only set on INSERT; the guard trigger blocks non-admin UPDATEs to it, and we
  -- deliberately don't touch it on re-run, so this stays idempotent.
  insert into public.organizations
    (owner_id, organization_type, name, slug, short_description, description,
     city, country_code, is_public, verification_status)
  values
    (v_owner, 'nonprofit', 'GreenRoots Collective (Demo)', 'greenroots-demo',
     'Community gardens & food security',
     'We turn vacant lots into thriving community gardens that feed neighborhoods and bring people together. This is demo data created to verify the live read path.',
     'San Francisco', 'US', true, 'verified')
  on conflict (slug) do update set
    name              = excluded.name,
    short_description = excluded.short_description,
    description       = excluded.description,
    city              = excluded.city,
    is_public         = true
  returning id into v_org;

  if v_org is null then
    select id into v_org from public.organizations where slug = 'greenroots-demo';
  end if;

  -- Owner is also a member (owner role) of the org.
  insert into public.organization_members (organization_id, user_id, member_role)
  values (v_org, v_owner, 'owner')
  on conflict (organization_id, user_id) do nothing;

  -- Pick a real category from the seeded taxonomy.
  select id into v_category from public.mission_categories where slug = 'community-care';

  -- Published mission (visible to anon: status='published' + org is_public).
  insert into public.missions
    (organization_id, category_id, title, slug, summary, description, status,
     is_virtual, location_label, city, country_code,
     starts_at, ends_at, timezone, volunteer_capacity, estimated_hours,
     difficulty, is_beginner_friendly, skills, perks, application_mode, published_at)
  values
    (v_org, v_category,
     'Community Garden Planting (Demo)', 'community-garden-planting-demo',
     'Join GreenRoots to plant raised beds and green a neighborhood lot. Tools and guidance are provided on arrival — newcomers always welcome.',
     'Spend a hands-on morning building and planting raised garden beds at a community lot. You will mix soil, plant seedlings, and help set up irrigation alongside a friendly crew. No experience needed.',
     'published', false, 'Mission District Community Lot', 'San Francisco', 'US',
     now() + interval '7 days',
     now() + interval '7 days' + interval '3 hours',
     'America/Los_Angeles', 12, 3.0, 'Easy', true,
     array['Reliable', 'Team player', 'No experience needed'],
     array['Snacks provided', 'Volunteer hours logged', 'Take home fresh produce'],
     'request', now())
  on conflict (slug) do update set
    title              = excluded.title,
    summary            = excluded.summary,
    description        = excluded.description,
    status             = 'published',
    category_id        = excluded.category_id,
    starts_at          = excluded.starts_at,
    ends_at            = excluded.ends_at,
    volunteer_capacity = excluded.volunteer_capacity,
    skills             = excluded.skills,
    perks              = excluded.perks,
    published_at       = coalesce(public.missions.published_at, now());

  raise notice 'Demo seeded: org % / mission community-garden-planting-demo / owner %', v_org, v_owner;
end $$;
