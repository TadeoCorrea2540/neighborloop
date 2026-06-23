-- ============================================================
-- 018 · Phase 8 Pass 2 — messaging + mission updates
-- ------------------------------------------------------------
-- Mission-scoped volunteer⇄organizer conversations + organizer announcements.
-- A conversation exists once a volunteer has an application to the mission.
-- Access is via conversation_participants; is_conversation_participant() is a
-- SECURITY DEFINER helper so policies don't recurse. Conversations are created
-- via create_application_conversation() (definer) to set up both participant
-- rows atomically. Realtime is enabled on messages (RLS-filtered).
-- ============================================================
set check_function_bodies = off;

-- ---------- enums ----------
do $$ begin
  create type conversation_type as enum ('mission_application', 'mission_support', 'organizer_announcement', 'admin_support');
exception when duplicate_object then null; end $$;
do $$ begin
  create type conversation_status as enum ('active', 'archived', 'closed');
exception when duplicate_object then null; end $$;
do $$ begin
  create type message_type as enum ('text', 'system', 'mission_update', 'application_update', 'attendance_update', 'certificate_update');
exception when duplicate_object then null; end $$;
do $$ begin
  create type mission_update_type as enum ('general', 'schedule_change', 'location_change', 'reminder', 'attendance', 'cancellation', 'thank_you');
exception when duplicate_object then null; end $$;

-- ---------- conversations ----------
create table if not exists public.conversations (
  id                uuid primary key default gen_random_uuid(),
  conversation_type conversation_type not null,
  mission_id        uuid references public.missions (id) on delete cascade,
  application_id    uuid references public.applications (id) on delete set null,
  organization_id   uuid references public.organizations (id) on delete cascade,
  created_by        uuid references public.profiles (id) on delete set null,
  title             text,
  status            conversation_status not null default 'active',
  last_message_at   timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
-- one application conversation per (mission, volunteer) handled at app level via
-- create_application_conversation(); index for inbox queries:
create index if not exists idx_conversations_org on public.conversations (organization_id);
create index if not exists idx_conversations_mission on public.conversations (mission_id);

-- ---------- conversation_participants ----------
create table if not exists public.conversation_participants (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references public.profiles (id) on delete cascade,
  participant_role text not null,
  organization_id uuid references public.organizations (id) on delete set null,
  joined_at       timestamptz not null default now(),
  last_read_at    timestamptz,
  is_muted        boolean not null default false,
  is_archived     boolean not null default false,
  constraint conv_participant_unique unique (conversation_id, user_id)
);
create index if not exists idx_participants_user on public.conversation_participants (user_id);

-- ---------- messages ----------
create table if not exists public.messages (
  id                uuid primary key default gen_random_uuid(),
  conversation_id   uuid not null references public.conversations (id) on delete cascade,
  sender_id         uuid references public.profiles (id) on delete set null,
  sender_role       text not null,
  body              text not null,
  message_type      message_type not null default 'text',
  metadata          jsonb not null default '{}'::jsonb,
  is_system_message boolean not null default false,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  constraint messages_body_nonempty check (is_system_message or length(btrim(body)) > 0)
);
create index if not exists idx_messages_conversation on public.messages (conversation_id, created_at);

-- ---------- mission_updates ----------
create table if not exists public.mission_updates (
  id              uuid primary key default gen_random_uuid(),
  mission_id      uuid not null references public.missions (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  created_by      uuid references public.profiles (id) on delete set null,
  title           text not null,
  body            text not null,
  update_type     mission_update_type not null default 'general',
  audience        text not null default 'approved_volunteers',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index if not exists idx_mission_updates_mission on public.mission_updates (mission_id, created_at desc);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['conversations', 'messages', 'mission_updates'] loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s;', t);
    execute format('create trigger trg_%1$s_updated_at before update on public.%1$s for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ---------- participant helper (avoids recursive RLS) ----------
create or replace function public.is_conversation_participant(conv_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.conversation_participants p
    where p.conversation_id = conv_id and p.user_id = auth.uid()
  );
$$;
revoke all on function public.is_conversation_participant(uuid) from public, anon;
grant execute on function public.is_conversation_participant(uuid) to authenticated;

-- ============================================================
-- RLS
-- ============================================================
alter table public.conversations            enable row level security;
alter table public.conversation_participants enable row level security;
alter table public.messages                 enable row level security;
alter table public.mission_updates          enable row level security;

drop policy if exists conversations_select on public.conversations;
create policy conversations_select on public.conversations
  for select to authenticated using (public.is_conversation_participant(id) or public.is_admin());
drop policy if exists conversations_insert on public.conversations;
create policy conversations_insert on public.conversations
  for insert to authenticated with check (created_by = auth.uid());
drop policy if exists conversations_update on public.conversations;
create policy conversations_update on public.conversations
  for update to authenticated using (public.is_conversation_participant(id) or public.is_admin())
  with check (public.is_conversation_participant(id) or public.is_admin());

drop policy if exists participants_select on public.conversation_participants;
create policy participants_select on public.conversation_participants
  for select to authenticated using (user_id = auth.uid() or public.is_conversation_participant(conversation_id) or public.is_admin());
drop policy if exists participants_update on public.conversation_participants;
create policy participants_update on public.conversation_participants
  for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

drop policy if exists messages_select on public.messages;
create policy messages_select on public.messages
  for select to authenticated using (public.is_conversation_participant(conversation_id) or public.is_admin());
drop policy if exists messages_insert on public.messages;
create policy messages_insert on public.messages
  for insert to authenticated
  with check (sender_id = auth.uid() and public.is_conversation_participant(conversation_id));

drop policy if exists mission_updates_select on public.mission_updates;
create policy mission_updates_select on public.mission_updates
  for select to authenticated
  using (
    public.is_org_member(organization_id)
    or public.is_admin()
    or exists (
      select 1 from public.applications a
      where a.mission_id = mission_updates.mission_id and a.volunteer_id = auth.uid() and a.status = 'approved'
    )
  );
drop policy if exists mission_updates_insert on public.mission_updates;
create policy mission_updates_insert on public.mission_updates
  for insert to authenticated with check (public.is_org_manager(organization_id));

-- ---------- create_application_conversation() (SECURITY DEFINER) ----------
-- Idempotent: returns the existing mission_application conversation for the
-- application, or creates it + both participant rows. Caller must be the
-- application's volunteer OR a manager of the mission's org.
create or replace function public.create_application_conversation(p_application_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_app record;
  v_owner uuid;
  v_conv uuid;
begin
  if v_uid is null then return null; end if;

  select a.id, a.volunteer_id, a.mission_id, m.organization_id, m.title
    into v_app
  from public.applications a
  join public.missions m on m.id = a.mission_id
  where a.id = p_application_id;
  if not found then return null; end if;

  -- authorize: the volunteer themself, or a manager of the org
  if v_uid <> v_app.volunteer_id and not public.is_org_manager(v_app.organization_id) then
    return null;
  end if;

  -- existing?
  select id into v_conv from public.conversations
   where conversation_type = 'mission_application' and application_id = p_application_id
   limit 1;
  if v_conv is not null then return v_conv; end if;

  select owner_id into v_owner from public.organizations where id = v_app.organization_id;

  insert into public.conversations (conversation_type, mission_id, application_id, organization_id, created_by, title, last_message_at)
  values ('mission_application', v_app.mission_id, p_application_id, v_app.organization_id, v_uid, v_app.title, now())
  returning id into v_conv;

  insert into public.conversation_participants (conversation_id, user_id, participant_role, organization_id)
  values (v_conv, v_app.volunteer_id, 'volunteer', null);

  if v_owner is not null then
    insert into public.conversation_participants (conversation_id, user_id, participant_role, organization_id)
    values (v_conv, v_owner, 'organizer', v_app.organization_id)
    on conflict (conversation_id, user_id) do nothing;
  end if;

  return v_conv;
end;
$$;
revoke all on function public.create_application_conversation(uuid) from public, anon;
grant execute on function public.create_application_conversation(uuid) to authenticated;

-- ---------- realtime ----------
do $$ begin
  alter publication supabase_realtime add table public.messages;
exception when duplicate_object then null; when undefined_object then null; end $$;
