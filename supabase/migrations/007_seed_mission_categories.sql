-- ============================================================
-- 007_seed_mission_categories.sql · Public taxonomy (reference data)
--
-- mission_categories is fixed, public, non-user reference data, so it is seeded
-- as a migration to deploy deterministically to every environment. Idempotent
-- via ON CONFLICT (slug) — safe to re-run. This mirrors supabase/seed.sql, which
-- remains the source used by local `supabase db reset`.
-- NO fake users / orgs / missions are seeded anywhere.
-- ============================================================

insert into public.mission_categories (slug, name, description, icon_key, accent_color, sort_order)
values
  ('food-support',      'Food Support',      'Sort donations and prepare food boxes for families.', 'bowl',     '#ff8a5c', 10),
  ('animal-rescue',     'Animal Rescue',     'Walk, foster, and care for rescued animals.',          'paw',      '#1fae82', 20),
  ('tutoring',          'Tutoring',          'Help students read, learn, and grow.',                 'book',     '#7a6bf5', 30),
  ('cleanups',          'Cleanups',          'Restore parks, beaches, and shared spaces.',           'wave',     '#3a8bf0', 40),
  ('community-care',    'Community Care',    'Share time with neighbors who need company.',          'heart',    '#ff5e7a', 50),
  ('environment',       'Environment',       'Plant and green your neighborhood.',                   'sprout',   '#1fae82', 60),
  ('elderly-support',   'Elderly Support',   'Visit and support local seniors.',                     'hands',    '#ff8a3c', 70),
  ('donation-drives',   'Donation Drives',   'Collect and sort donations for those in need.',        'box',      '#ff6f5e', 80),
  ('youth-mentorship',  'Youth Mentorship',  'Mentor and guide young people in your area.',          'compass',  '#7a6bf5', 90),
  ('health-awareness',  'Health Awareness',  'Support health education and awareness events.',       'pulse',    '#3a8bf0', 100),
  ('cultural-events',   'Cultural Events',   'Help run inclusive community and cultural events.',     'sparkles', '#ff8a3c', 110),
  ('emergency-support', 'Emergency Support', 'Respond to urgent local needs and relief efforts.',    'alert',    '#f1543f', 120)
on conflict (slug) do update set
  name         = excluded.name,
  description  = excluded.description,
  icon_key     = excluded.icon_key,
  accent_color = excluded.accent_color,
  sort_order   = excluded.sort_order,
  is_active    = true;
