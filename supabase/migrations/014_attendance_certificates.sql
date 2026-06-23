-- ============================================================
-- 014 · Phase 7 — attendance, check-in tokens, certificates
-- Enums + tables + constraints + updated_at triggers + RLS.
-- RLS mirrors the org-scoped style from 005 (is_org_member / is_org_manager
-- / is_admin). Volunteers can READ their own attendance/certificates but
-- never write them; organizers manage their own org's records. QR self
-- check-in is handled by a SECURITY DEFINER function (migration 015), so
-- volunteers get NO direct write to attendance and NO read of tokens.
-- ============================================================
set check_function_bodies = off;

-- ---------- enums ----------
do $$ begin
  create type attendance_status as enum
    ('registered', 'checked_in', 'checked_out', 'completed', 'no_show', 'cancelled', 'excused');
exception when duplicate_object then null; end $$;

do $$ begin
  create type check_in_method as enum ('manual', 'qr', 'organizer', 'self_reported');
exception when duplicate_object then null; end $$;

-- ---------- attendance_records ----------
create table if not exists public.attendance_records (
  id              uuid primary key default gen_random_uuid(),
  mission_id      uuid not null references public.missions (id) on delete cascade,
  application_id  uuid references public.applications (id) on delete set null,
  volunteer_id    uuid not null references public.profiles (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  status          attendance_status not null default 'registered',
  check_in_method check_in_method,
  checked_in_at   timestamptz,
  checked_out_at  timestamptz,
  confirmed_by    uuid references public.profiles (id) on delete set null,
  confirmed_at    timestamptz,
  hours_credited  numeric(6, 2),
  organizer_note  text,
  volunteer_note  text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint attendance_unique_mission_volunteer unique (mission_id, volunteer_id),
  constraint attendance_hours_nonneg check (hours_credited is null or hours_credited >= 0),
  constraint attendance_checkout_after_checkin
    check (checked_out_at is null or checked_in_at is null or checked_out_at > checked_in_at)
);
comment on table public.attendance_records is
  'One row per (mission, volunteer). Volunteers read own; organizers manage own org. Volunteers never write directly.';

create index if not exists idx_attendance_mission on public.attendance_records (mission_id);
create index if not exists idx_attendance_volunteer on public.attendance_records (volunteer_id);
create index if not exists idx_attendance_org on public.attendance_records (organization_id);

-- ---------- check_in_tokens ----------
create table if not exists public.check_in_tokens (
  id              uuid primary key default gen_random_uuid(),
  mission_id      uuid not null references public.missions (id) on delete cascade,
  organization_id uuid not null references public.organizations (id) on delete cascade,
  token_hash      text not null unique,
  token_type      text not null default 'mission_check_in',
  expires_at      timestamptz,
  is_active       boolean not null default true,
  created_by      uuid references public.profiles (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table public.check_in_tokens is
  'QR check-in tokens (hash only). Organizer/admin manage; volunteers never read — qr_check_in() validates.';

-- at most one active token per mission
create unique index if not exists uq_check_in_one_active
  on public.check_in_tokens (mission_id) where is_active;

-- ---------- certificates ----------
create table if not exists public.certificates (
  id                   uuid primary key default gen_random_uuid(),
  volunteer_id         uuid not null references public.profiles (id) on delete cascade,
  mission_id           uuid not null references public.missions (id) on delete cascade,
  organization_id      uuid not null references public.organizations (id) on delete cascade,
  attendance_record_id uuid not null references public.attendance_records (id) on delete cascade,
  certificate_number   text not null unique,
  status               text not null default 'issued',
  issued_at            timestamptz not null default now(),
  issued_by            uuid references public.profiles (id) on delete set null,
  hours_credited       numeric(6, 2) not null,
  file_path            text,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now(),
  constraint certificates_one_per_attendance unique (attendance_record_id)
);
comment on table public.certificates is
  'Participation proof. One per completed attendance record. Volunteer reads own; org reads own; admin all.';

create index if not exists idx_certificates_volunteer on public.certificates (volunteer_id);
create index if not exists idx_certificates_org on public.certificates (organization_id);

-- ---------- updated_at triggers ----------
do $$
declare t text;
begin
  foreach t in array array['attendance_records', 'check_in_tokens', 'certificates'] loop
    execute format('drop trigger if exists trg_%1$s_updated_at on public.%1$s;', t);
    execute format(
      'create trigger trg_%1$s_updated_at before update on public.%1$s
         for each row execute function public.set_updated_at();', t);
  end loop;
end $$;

-- ============================================================
-- RLS
-- ============================================================
alter table public.attendance_records enable row level security;
alter table public.check_in_tokens    enable row level security;
alter table public.certificates       enable row level security;

-- attendance_records: volunteer reads own; org members read; managers/admin write
drop policy if exists attendance_select on public.attendance_records;
create policy attendance_select on public.attendance_records
  for select to authenticated
  using (volunteer_id = auth.uid() or public.is_org_member(organization_id) or public.is_admin());

drop policy if exists attendance_insert on public.attendance_records;
create policy attendance_insert on public.attendance_records
  for insert to authenticated
  with check (public.is_org_manager(organization_id) or public.is_admin());

drop policy if exists attendance_update on public.attendance_records;
create policy attendance_update on public.attendance_records
  for update to authenticated
  using (public.is_org_manager(organization_id) or public.is_admin())
  with check (public.is_org_manager(organization_id) or public.is_admin());

drop policy if exists attendance_delete on public.attendance_records;
create policy attendance_delete on public.attendance_records
  for delete to authenticated
  using (public.is_org_manager(organization_id) or public.is_admin());

-- check_in_tokens: managers/admin only (volunteers use qr_check_in())
drop policy if exists tokens_select on public.check_in_tokens;
create policy tokens_select on public.check_in_tokens
  for select to authenticated
  using (public.is_org_manager(organization_id) or public.is_admin());

drop policy if exists tokens_insert on public.check_in_tokens;
create policy tokens_insert on public.check_in_tokens
  for insert to authenticated
  with check (public.is_org_manager(organization_id) or public.is_admin());

drop policy if exists tokens_update on public.check_in_tokens;
create policy tokens_update on public.check_in_tokens
  for update to authenticated
  using (public.is_org_manager(organization_id) or public.is_admin())
  with check (public.is_org_manager(organization_id) or public.is_admin());

drop policy if exists tokens_delete on public.check_in_tokens;
create policy tokens_delete on public.check_in_tokens
  for delete to authenticated
  using (public.is_org_manager(organization_id) or public.is_admin());

-- certificates: volunteer reads own; org members read; managers/admin write
drop policy if exists certificates_select on public.certificates;
create policy certificates_select on public.certificates
  for select to authenticated
  using (volunteer_id = auth.uid() or public.is_org_member(organization_id) or public.is_admin());

drop policy if exists certificates_insert on public.certificates;
create policy certificates_insert on public.certificates
  for insert to authenticated
  with check (public.is_org_manager(organization_id) or public.is_admin());

drop policy if exists certificates_update on public.certificates;
create policy certificates_update on public.certificates
  for update to authenticated
  using (public.is_org_manager(organization_id) or public.is_admin())
  with check (public.is_org_manager(organization_id) or public.is_admin());
