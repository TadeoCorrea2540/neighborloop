-- ============================================================
-- 017 · Phase 8 Pass 1 — notifications, preferences, reminders
-- ------------------------------------------------------------
-- In-app notifications (per-user, private), notification preferences, and a
-- reminders foundation (records only — no cron this phase). Notifications are
-- created by a SECURITY DEFINER function because the creator is usually a
-- DIFFERENT user than the recipient (e.g. organizer → volunteer), which an RLS
-- insert policy can't express. Reads/writes are RLS-gated to the owner.
-- ============================================================
set check_function_bodies = off;

-- ---------- enums ----------
do $$ begin
  create type notification_type as enum (
    'application_submitted', 'application_approved', 'application_declined', 'application_waitlisted',
    'mission_update', 'mission_reminder', 'mission_cancelled',
    'attendance_checked_in', 'attendance_completed', 'certificate_issued',
    'message_received', 'organization_verified', 'organization_rejected', 'report_resolved', 'system'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type reminder_type as enum (
    'mission_24h_before', 'mission_2h_before', 'saved_mission_before_deadline',
    'attendance_followup', 'certificate_available'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type reminder_status as enum ('pending', 'sent', 'cancelled', 'failed');
exception when duplicate_object then null; end $$;

-- ---------- notifications ----------
create table if not exists public.notifications (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references public.profiles (id) on delete cascade,
  notification_type notification_type not null,
  title             text not null,
  body              text,
  link_url          text,
  entity_type       text,
  entity_id         uuid,
  metadata          jsonb not null default '{}'::jsonb,
  read_at           timestamptz,
  created_at        timestamptz not null default now()
);
comment on table public.notifications is 'Per-user in-app notifications. Owner-only read/update; created via create_notification().';
create index if not exists idx_notifications_user on public.notifications (user_id, created_at desc);
create index if not exists idx_notifications_unread on public.notifications (user_id) where read_at is null;

-- ---------- notification_preferences ----------
create table if not exists public.notification_preferences (
  user_id                      uuid primary key references public.profiles (id) on delete cascade,
  messages_enabled             boolean not null default true,
  application_updates_enabled   boolean not null default true,
  mission_updates_enabled      boolean not null default true,
  mission_reminders_enabled    boolean not null default true,
  attendance_updates_enabled   boolean not null default true,
  certificate_updates_enabled  boolean not null default true,
  email_notifications_enabled  boolean not null default false,
  push_notifications_enabled   boolean not null default false,
  created_at                   timestamptz not null default now(),
  updated_at                   timestamptz not null default now()
);

-- ---------- scheduled_reminders ----------
create table if not exists public.scheduled_reminders (
  id              uuid primary key default gen_random_uuid(),
  reminder_type   reminder_type not null,
  mission_id      uuid references public.missions (id) on delete cascade,
  user_id         uuid references public.profiles (id) on delete cascade,
  organization_id uuid references public.organizations (id) on delete cascade,
  scheduled_for   timestamptz not null,
  status          reminder_status not null default 'pending',
  sent_at         timestamptz,
  metadata        jsonb not null default '{}'::jsonb,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_reminders_user on public.scheduled_reminders (user_id);
create index if not exists idx_reminders_due on public.scheduled_reminders (scheduled_for) where status = 'pending';

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['notification_preferences', 'scheduled_reminders'] loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
         for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ---------- RLS ----------
alter table public.notifications            enable row level security;
alter table public.notification_preferences enable row level security;
alter table public.scheduled_reminders      enable row level security;

drop policy if exists notifications_select on public.notifications;
create policy notifications_select on public.notifications
  for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists notifications_update on public.notifications;
create policy notifications_update on public.notifications
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists notif_prefs_select on public.notification_preferences;
create policy notif_prefs_select on public.notification_preferences
  for select to authenticated using (user_id = auth.uid());
drop policy if exists notif_prefs_insert on public.notification_preferences;
create policy notif_prefs_insert on public.notification_preferences
  for insert to authenticated with check (user_id = auth.uid());
drop policy if exists notif_prefs_update on public.notification_preferences;
create policy notif_prefs_update on public.notification_preferences
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists reminders_select on public.scheduled_reminders;
create policy reminders_select on public.scheduled_reminders
  for select to authenticated
  using (user_id = auth.uid() or (organization_id is not null and public.is_org_member(organization_id)) or public.is_admin());
drop policy if exists reminders_insert on public.scheduled_reminders;
create policy reminders_insert on public.scheduled_reminders
  for insert to authenticated
  with check (user_id = auth.uid() or (organization_id is not null and public.is_org_manager(organization_id)) or public.is_admin());
drop policy if exists reminders_update on public.scheduled_reminders;
create policy reminders_update on public.scheduled_reminders
  for update to authenticated
  using (user_id = auth.uid() or (organization_id is not null and public.is_org_manager(organization_id)) or public.is_admin())
  with check (user_id = auth.uid() or (organization_id is not null and public.is_org_manager(organization_id)) or public.is_admin());

-- ---------- create_notification() (SECURITY DEFINER) ----------
-- Creator is typically a different user than the recipient, so this runs as
-- definer. Callable by any authenticated user (server actions authorize first);
-- it only writes a notification — no data exposure. Future hardening: per-type
-- authorization or a trusted worker.
create or replace function public.create_notification(
  p_user_id uuid,
  p_type notification_type,
  p_title text,
  p_body text default null,
  p_link_url text default null,
  p_entity_type text default null,
  p_entity_id uuid default null,
  p_metadata jsonb default '{}'::jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare v_id uuid;
begin
  if auth.uid() is null then return null; end if;
  insert into public.notifications (user_id, notification_type, title, body, link_url, entity_type, entity_id, metadata)
  values (p_user_id, p_type, p_title, p_body, p_link_url, p_entity_type, p_entity_id, coalesce(p_metadata, '{}'::jsonb))
  returning id into v_id;
  return v_id;
end;
$$;

revoke all on function public.create_notification(uuid, notification_type, text, text, text, text, uuid, jsonb) from public, anon;
grant execute on function public.create_notification(uuid, notification_type, text, text, text, text, uuid, jsonb) to authenticated;

-- ---------- realtime (RLS-filtered) ----------
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when duplicate_object then null; when undefined_object then null; end $$;
