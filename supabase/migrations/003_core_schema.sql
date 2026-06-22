-- ============================================================
-- 003 · Core schema
-- Tables only (FKs/indexes/constraints in 004, RLS in 005).
-- UUID PKs, timestamptz everywhere, updated_at triggers where relevant.
-- Privacy: public tables never store email/phone/address/IDs/financials.
-- ============================================================

-- ---------- profiles ----------
-- Safe, public-facing user data. 1:1 with auth.users.
create table if not exists public.profiles (
  id               uuid primary key references auth.users (id) on delete cascade,
  display_name     text not null default 'Neighbor',
  full_name        text,
  avatar_url       text,
  bio              text,
  city             text,
  country_code     text,
  interests        text[] not null default '{}',
  is_profile_public boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table public.profiles is 'Public-facing user profile. No email/phone/address/PII here.';

-- ---------- user_roles ----------
-- Role assignment kept separate from editable profile fields.
-- Users may READ their own role but never write it (see RLS).
create table if not exists public.user_roles (
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       app_role not null,
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);
comment on table public.user_roles is 'Platform role assignments. Never self-granted; admin assigns server-side.';

-- ---------- mission_categories ----------
-- Public, stable taxonomy (seeded in seed.sql).
create table if not exists public.mission_categories (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  name         text not null,
  description  text,
  icon_key     text,
  accent_color text,
  sort_order   integer not null default 0,
  is_active    boolean not null default true,
  created_at   timestamptz not null default now()
);
comment on table public.mission_categories is 'Public mission/impact categories. Static taxonomy.';

-- ---------- organizations ----------
-- Public organizer identity. Supports orgs through to families/individuals.
create table if not exists public.organizations (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references public.profiles (id) on delete restrict,
  organization_type   organization_type not null,
  name                text not null,
  slug                text not null unique,
  short_description   text,
  description         text,
  website_url         text,
  instagram_url       text,
  logo_path           text,
  cover_image_path    text,
  city                text,
  country_code        text,
  is_public           boolean not null default true,
  verification_status verification_status not null default 'pending',
  verification_note   text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table public.organizations is 'Public organizer identity. verification_note must not leak internal moderation info.';

-- ---------- organization_members ----------
-- Team support (owner represented here too). member_role is text + check.
create table if not exists public.organization_members (
  organization_id uuid not null references public.organizations (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  member_role     text not null default 'coordinator'
                    check (member_role in ('owner', 'admin', 'coordinator')),
  created_at      timestamptz not null default now(),
  primary key (organization_id, user_id)
);
comment on table public.organization_members is 'Org membership for team-based management (Phase 5 UI).';

-- ---------- organization_verifications ----------
-- Moderation record. internal_note is admin-only (RLS); public_reason is safe.
create table if not exists public.organization_verifications (
  id              uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status          verification_status not null default 'pending',
  submitted_by    uuid references public.profiles (id) on delete set null,
  reviewed_by     uuid references public.profiles (id) on delete set null,
  submitted_at    timestamptz not null default now(),
  reviewed_at     timestamptz,
  internal_note   text,
  public_reason   text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table public.organization_verifications is 'Verification workflow (Phase 6). internal_note never publicly readable.';

-- ---------- missions ----------
-- Public mission/event data. Exact addresses live in mission_private_details.
create table if not exists public.missions (
  id                   uuid primary key default gen_random_uuid(),
  organization_id      uuid not null references public.organizations (id) on delete cascade,
  category_id          uuid references public.mission_categories (id) on delete set null,
  title                text not null,
  slug                 text not null unique,
  summary              text not null,
  description          text,
  cover_image_path     text,
  status               mission_status not null default 'draft',
  is_virtual           boolean not null default false,
  location_label       text,
  city                 text,
  country_code         text,
  latitude             numeric(9, 6),
  longitude            numeric(9, 6),
  starts_at            timestamptz not null,
  ends_at              timestamptz,
  timezone             text not null default 'UTC',
  volunteer_capacity   integer,
  minimum_age          integer,
  estimated_hours      numeric(5, 2),
  difficulty           text,
  is_beginner_friendly boolean not null default true,
  skills               text[] not null default '{}',
  materials_needed     text[] not null default '{}',
  perks                text[] not null default '{}',
  safety_notes         text,
  application_mode     text not null default 'request'
                         check (application_mode in ('request', 'open', 'external')),
  published_at         timestamptz,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table public.missions is 'Public mission data. No exact private addresses; location_label is safe/public.';

-- ---------- mission_private_details ----------
-- Private organizer/approved-volunteer info. NEVER publicly readable (RLS).
create table if not exists public.mission_private_details (
  mission_id                  uuid primary key references public.missions (id) on delete cascade,
  exact_address               text,
  private_meeting_instructions text,
  private_contact_name        text,
  private_contact_phone       text,
  private_contact_email       text,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);
comment on table public.mission_private_details is 'Private mission details. Organizer-only now; approved volunteers in Phase 4.';

-- ---------- applications ----------
-- Volunteer requests to join missions. organizer_note hidden from volunteers.
create table if not exists public.applications (
  id            uuid primary key default gen_random_uuid(),
  mission_id    uuid not null references public.missions (id) on delete cascade,
  volunteer_id  uuid not null references public.profiles (id) on delete cascade,
  status        application_status not null default 'pending',
  message       text,
  applied_at    timestamptz not null default now(),
  reviewed_at   timestamptz,
  reviewed_by   uuid references public.profiles (id) on delete set null,
  organizer_note text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table public.applications is 'Volunteer applications. organizer_note is organizer/admin-only.';

-- ---------- saved_missions ----------
create table if not exists public.saved_missions (
  id         uuid primary key default gen_random_uuid(),
  mission_id uuid not null references public.missions (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);
comment on table public.saved_missions is 'Volunteer bookmarks. Owner-only access.';

-- ---------- reports ----------
-- Moderation reports. Exactly one target (mission/org/user) — enforced in 004.
create table if not exists public.reports (
  id               uuid primary key default gen_random_uuid(),
  reporter_id      uuid references public.profiles (id) on delete set null,
  mission_id       uuid references public.missions (id) on delete cascade,
  organization_id  uuid references public.organizations (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete cascade,
  reason           text not null,
  details          text,
  status           text not null default 'open'
                     check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  reviewed_by      uuid references public.profiles (id) on delete set null,
  reviewed_at      timestamptz,
  internal_note    text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table public.reports is 'Moderation reports. Reporter sees own; admin sees all; internal_note admin-only.';

-- ---------- audit_events ----------
-- Internal traceability. No public access at all (RLS).
create table if not exists public.audit_events (
  id          uuid primary key default gen_random_uuid(),
  actor_id    uuid references public.profiles (id) on delete set null,
  event_type  text not null,
  entity_type text not null,
  entity_id   uuid,
  metadata    jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
comment on table public.audit_events is 'Admin/security audit trail. No public or self-serve access.';

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array[
    'profiles', 'organizations', 'organization_verifications',
    'missions', 'mission_private_details', 'applications', 'reports'
  ] loop
    execute format(
      'drop trigger if exists trg_%1$s_updated_at on public.%1$s;', t
    );
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
         for each row execute function public.set_updated_at();', t
    );
  end loop;
end $$;
