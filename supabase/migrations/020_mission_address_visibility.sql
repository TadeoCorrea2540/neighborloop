alter table public.missions
  add column if not exists show_exact_address_publicly boolean not null default false;

comment on column public.missions.show_exact_address_publicly is
  'When true, exact address is shown on the public mission page to everyone (including visitors not logged in).';
