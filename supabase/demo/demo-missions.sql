-- ============================================================
-- demo-missions.sql · Published test missions for Phase 4 (volunteer workflow)
--
-- Adds several PUBLISHED missions to the existing demo org so Explore / mission
-- detail / save / apply / My Missions all have real data to work with.
-- Idempotent (ON CONFLICT by slug). Requires demo-org-mission.sql to have run
-- first (it creates the `greenroots-demo` org). No fake users are created.
--
-- Run in: Supabase Dashboard → SQL Editor.
-- ============================================================

do $$
declare
  v_org uuid;
  v_food uuid;
  v_clean uuid;
  v_animal uuid;
  v_tutor uuid;
  v_community uuid;
begin
  select id into v_org from public.organizations where slug = 'greenroots-demo';
  if v_org is null then
    raise exception 'No greenroots-demo org found. Run supabase/demo/demo-org-mission.sql first.';
  end if;

  select id into v_food from public.mission_categories where slug = 'food-support';
  select id into v_clean from public.mission_categories where slug = 'cleanups';
  select id into v_animal from public.mission_categories where slug = 'animal-rescue';
  select id into v_tutor from public.mission_categories where slug = 'tutoring';
  select id into v_community from public.mission_categories where slug = 'community-care';

  insert into public.missions
    (organization_id, category_id, title, slug, summary, description, status, is_virtual,
     location_label, city, country_code, starts_at, ends_at, timezone, volunteer_capacity,
     estimated_hours, difficulty, is_beginner_friendly, skills, perks, application_mode, published_at)
  values
    (v_org, v_food, 'Saturday Food Bank Sort', 'demo-food-bank-sort',
     'Sort and pack food donations into family boxes. Friendly crew, no experience needed.',
     'Join us for a hands-on morning sorting donations and packing boxes for local families.',
     'published', false, 'Mission District Pantry', 'San Francisco', 'US',
     now() + interval '5 days', now() + interval '5 days' + interval '3 hours',
     'America/Los_Angeles', 12, 3.0, 'Easy', true,
     array['Reliable', 'Team player'], array['Snacks provided', 'Hours logged'], 'request', now()),

    (v_org, v_clean, 'Ocean Beach Cleanup', 'demo-ocean-beach-cleanup',
     'Help restore the shoreline. Gloves and bags provided — just bring water and sunscreen.',
     'A morning of beach cleanup along Ocean Beach. Great for groups and first-timers.',
     'published', false, 'Ocean Beach', 'San Francisco', 'US',
     now() + interval '8 days', now() + interval '8 days' + interval '2 hours',
     'America/Los_Angeles', 30, 2.0, 'Easy', true,
     array['Outdoors'], array['Volunteer t-shirt'], 'open', now()),

    (v_org, v_animal, 'Cat Shelter Care Crew', 'demo-cat-shelter-care',
     'Feed, groom, and socialize rescue cats and kittens at our partner shelter.',
     'Spend the afternoon caring for rescue animals. Training provided on arrival.',
     'published', false, 'Bayview Shelter', 'San Francisco', 'US',
     now() + interval '10 days', now() + interval '10 days' + interval '2 hours',
     'America/Los_Angeles', 8, 2.0, 'Medium', true,
     array['Animal-friendly'], array['Hours logged'], 'request', now()),

    (v_org, v_tutor, 'After-School Reading Buddy', 'demo-reading-buddy',
     'Read one-on-one with kids and help them build confidence. Virtual sessions available.',
     'Become a reading buddy for local students. Orientation provided.',
     'published', true, 'Online', null, 'US',
     now() + interval '6 days', now() + interval '6 days' + interval '1 hours',
     'America/Los_Angeles', 20, 1.0, 'Easy', true,
     array['Patient', 'Good communicator'], array['Certificate available'], 'request', now()),

    (v_org, v_community, 'Senior Companionship Visits', 'demo-senior-visits',
     'Share an afternoon with neighbors who could use some company and conversation.',
     'Visit local seniors for friendly conversation and light activities.',
     'published', false, 'Sunset Community Center', 'San Francisco', 'US',
     now() + interval '12 days', now() + interval '12 days' + interval '2 hours',
     'America/Los_Angeles', 6, 2.0, 'Easy', true,
     array['Warm', 'Reliable'], array['Hours logged'], 'request', now())
  on conflict (slug) do update set
    status = 'published',
    title = excluded.title,
    summary = excluded.summary,
    category_id = excluded.category_id,
    starts_at = excluded.starts_at,
    ends_at = excluded.ends_at,
    volunteer_capacity = excluded.volunteer_capacity,
    application_mode = excluded.application_mode,
    published_at = coalesce(public.missions.published_at, now());

  raise notice 'Seeded demo missions for org %', v_org;
end $$;
