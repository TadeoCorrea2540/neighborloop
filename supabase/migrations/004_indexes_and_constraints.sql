-- ============================================================
-- 004 · Indexes, constraints & full-text search
-- Business-rule checks, uniqueness, lookup indexes, and a GIN
-- full-text index for mission discovery.
-- ============================================================

-- ---------- Business-rule check constraints ----------
-- (added via DO blocks so re-runs don't error on existing constraints)

do $$ begin
  alter table public.missions
    add constraint missions_ends_after_starts
    check (ends_at is null or ends_at > starts_at);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.missions
    add constraint missions_capacity_positive
    check (volunteer_capacity is null or volunteer_capacity > 0);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.missions
    add constraint missions_min_age_reasonable
    check (minimum_age is null or (minimum_age >= 0 and minimum_age <= 120));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.missions
    add constraint missions_estimated_hours_positive
    check (estimated_hours is null or estimated_hours >= 0);
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.missions
    add constraint missions_lat_range
    check (latitude is null or (latitude >= -90 and latitude <= 90));
exception when duplicate_object then null; end $$;

do $$ begin
  alter table public.missions
    add constraint missions_long_range
    check (longitude is null or (longitude >= -180 and longitude <= 180));
exception when duplicate_object then null; end $$;

-- Reports must target exactly one of mission / organization / user.
do $$ begin
  alter table public.reports
    add constraint reports_single_target
    check (
      (case when mission_id       is not null then 1 else 0 end)
    + (case when organization_id  is not null then 1 else 0 end)
    + (case when reported_user_id is not null then 1 else 0 end)
      = 1
    );
exception when duplicate_object then null; end $$;

-- ---------- Uniqueness (prevent duplicates) ----------
-- One application per (mission, volunteer).
create unique index if not exists uq_applications_mission_volunteer
  on public.applications (mission_id, volunteer_id);

-- One saved record per (user, mission).
create unique index if not exists uq_saved_missions_user_mission
  on public.saved_missions (user_id, mission_id);

-- (organization_members already unique via composite PK in 003.)

-- ---------- Lookup indexes ----------
create index if not exists idx_missions_status        on public.missions (status);
create index if not exists idx_missions_organization  on public.missions (organization_id);
create index if not exists idx_missions_category      on public.missions (category_id);
create index if not exists idx_missions_starts_at     on public.missions (starts_at);
create index if not exists idx_missions_published_at  on public.missions (published_at desc);
create index if not exists idx_missions_city          on public.missions (lower(city));

create index if not exists idx_org_owner              on public.organizations (owner_id);
create index if not exists idx_org_members_user       on public.organization_members (user_id);
create index if not exists idx_applications_volunteer on public.applications (volunteer_id);
create index if not exists idx_applications_mission   on public.applications (mission_id);
create index if not exists idx_saved_user            on public.saved_missions (user_id);
create index if not exists idx_org_verif_org         on public.organization_verifications (organization_id);
create index if not exists idx_reports_status        on public.reports (status);
create index if not exists idx_audit_entity          on public.audit_events (entity_type, entity_id);
create index if not exists idx_categories_active     on public.mission_categories (is_active, sort_order);

-- ---------- Full-text search foundation ----------
-- Generated tsvector over title + summary; GIN index for fast discovery.
do $$ begin
  alter table public.missions
    add column search_vector tsvector
    generated always as (
      to_tsvector('simple', coalesce(title, '') || ' ' || coalesce(summary, ''))
    ) stored;
exception when duplicate_column then null; end $$;

create index if not exists idx_missions_search on public.missions using gin (search_vector);
