-- ============================================================
-- 001 · Extensions & Enums
-- NeighborLoop Phase 2 — Backend Foundation
-- Non-destructive: only creates extensions and enum types.
-- ============================================================

-- gen_random_uuid() lives in pgcrypto on Supabase.
create extension if not exists pgcrypto;
-- Trigram + GIN helpers are available out of the box on Supabase; we rely on
-- the built-in to_tsvector for full-text (see 004), so no extra extension needed.

-- ---------- Stable enum types ----------
-- Enums are used ONLY for states that are stable over the product lifetime.
-- Anything that may grow freely (categories, org member roles) stays text.

-- Platform-level role. Assigned via user_roles, never self-granted (see RLS).
do $$ begin
  create type app_role as enum ('volunteer', 'organizer', 'admin');
exception when duplicate_object then null; end $$;

-- Kinds of entities that can organize missions.
do $$ begin
  create type organization_type as enum (
    'nonprofit',
    'school',
    'university',
    'student_club',
    'community_group',
    'faith_group',
    'local_business',
    'family_individual',
    'other'
  );
exception when duplicate_object then null; end $$;

-- Verification lifecycle for organizations / verification records.
do $$ begin
  create type verification_status as enum (
    'pending',
    'verified',
    'rejected',
    'not_required'
  );
exception when duplicate_object then null; end $$;

-- Mission lifecycle. Public visitors only ever see 'published'.
do $$ begin
  create type mission_status as enum (
    'draft',
    'pending_review',
    'published',
    'paused',
    'closed',
    'cancelled',
    'archived'
  );
exception when duplicate_object then null; end $$;

-- Volunteer application lifecycle.
do $$ begin
  create type application_status as enum (
    'pending',
    'approved',
    'waitlisted',
    'declined',
    'withdrawn',
    'cancelled'
  );
exception when duplicate_object then null; end $$;
