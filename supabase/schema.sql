-- AccesoUni - ERS v2.0 | Supabase schema + RLS
-- Ejecutar este script en Supabase (SQL Editor) antes de correr el backend.

-- Extensions recomendadas (si tu proyecto las soporta)
create extension if not exists pgcrypto;

-- Tipos
do $$
begin
  if not exists (select 1 from pg_type where typname = 'institution_plan') then
    create type institution_plan as enum ('basic', 'premium', 'enterprise');
  end if;

  if not exists (select 1 from pg_type where typname = 'institution_status') then
    create type institution_status as enum ('pending_payment', 'active', 'suspended');
  end if;

  if not exists (select 1 from pg_type where typname = 'activity_event_type') then
    create type activity_event_type as enum (
      'preferences_saved',
      'scan_submitted',
      'report_generated'
    );
  end if;
end $$;

-- Tabla: institutions
create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  domain text not null unique,
  name text,
  ruc text,
  plan institution_plan not null default 'basic',
  status institution_status not null default 'pending_payment',
  subscription_end timestamptz
);

-- Tabla: users (perfil de la extensión)
-- Nota: ERS indica email cifrado; para MVP usamos columna `email` (almacenada como texto).
-- La lógica de cifrado/descifrado se implementará en backend cuando definamos la estrategia exacta.
create table if not exists public.users (
  id uuid primary key,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  email text,
  name text,
  disability_type text,
  created_at timestamptz not null default now(),
  constraint users_institution_fk check (institution_id is not null)
);

-- Tabla puente: institution_admins
create table if not exists public.institution_admins (
  user_id uuid not null references public.users(id) on delete cascade,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, institution_id),
);

-- Tabla: user_preferences
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  contrast integer not null default 100,
  font_size integer not null default 100,
  font_family text not null default 'default',
  line_spacing integer not null default 100,
  color_mode text not null default 'auto',
  updated_at timestamptz not null default now()
);

-- Tabla: compliance_logs
create table if not exists public.compliance_logs (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  url text not null,
  page_errors text[] not null default '{}',
  corrections_applied text[] not null default '{}',
  wcag_score numeric not null default 0,
  session_id text,
  timestamp timestamptz not null default now()
);

-- Tabla: activity_logs
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  event_type activity_event_type not null,
  domain text,
  metadata jsonb not null default '{}'::jsonb,
  timestamp timestamptz not null default now()
);

-- Tabla: compliance_reports
create table if not exists public.compliance_reports (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  period_start date not null,
  period_end date not null,
  pdf_url text,
  generated_at timestamptz not null default now(),
  score numeric
);

-- Indexes
create index if not exists compliance_logs_institution_id_idx on public.compliance_logs(institution_id);
create index if not exists compliance_logs_timestamp_idx on public.compliance_logs(timestamp);
create index if not exists activity_logs_user_id_idx on public.activity_logs(user_id);
create index if not exists institutions_domain_idx on public.institutions(domain);
create index if not exists compliance_reports_institution_period_idx
  on public.compliance_reports(institution_id, period_start, period_end);

-- RLS
alter table public.institutions enable row level security;
alter table public.users enable row level security;
alter table public.institution_admins enable row level security;
alter table public.user_preferences enable row level security;
alter table public.compliance_logs enable row level security;
alter table public.activity_logs enable row level security;
alter table public.compliance_reports enable row level security;

-- Helper (admin check)
create or replace function public.is_institution_admin(p_institution_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.institution_admins ia
    where ia.institution_id = p_institution_id
      and ia.user_id = auth.uid()
  );
$$;

-- Helper (user institution)
create or replace function public.get_my_institution_id()
returns uuid
language sql
stable
as $$
  select u.institution_id
  from public.users u
  where u.id = auth.uid()
  limit 1
$$;

-- Policies: institutions
drop policy if exists institutions_select_own_admin on public.institutions;
create policy institutions_select_own_admin
on public.institutions
for select
to authenticated
using (public.is_institution_admin(public.institutions.id));

-- Allow admins to read/update their own institution rows
drop policy if exists institutions_update_own_admin on public.institutions;
create policy institutions_update_own_admin
on public.institutions
for update
to authenticated
using (public.is_institution_admin(public.institutions.id))
with check (public.is_institution_admin(public.institutions.id));

-- Lectura pública (rol anon) solo de filas activas: útil si el backend usa por error la clave «anon»
-- en SUPABASE_SERVICE_ROLE_KEY; lo correcto es usar «service_role» (bypass RLS).
drop policy if exists institutions_select_active_anon_public on public.institutions;
create policy institutions_select_active_anon_public
on public.institutions
for select
to anon
using (status = 'active'::institution_status);

-- Policies: users
drop policy if exists users_select_self_or_admin on public.users;
create policy users_select_self_or_admin
on public.users
for select
to authenticated
using (
  public.users.id = auth.uid()
  OR public.is_institution_admin(public.users.institution_id)
);

drop policy if exists users_insert_self on public.users;
create policy users_insert_self
on public.users
for insert
to authenticated
with check (public.users.id = auth.uid());

drop policy if exists users_update_self on public.users;
create policy users_update_self
on public.users
for update
to authenticated
using (public.users.id = auth.uid())
with check (public.users.id = auth.uid());

-- Policies: institution_admins
drop policy if exists institution_admins_select_admins on public.institution_admins;
create policy institution_admins_select_admins
on public.institution_admins
for select
to authenticated
using (public.is_institution_admin(public.institution_admins.institution_id));

-- Insert admin mapping (usualmente desde backend dashboard con service role)
drop policy if exists institution_admins_insert_self on public.institution_admins;
create policy institution_admins_insert_self
on public.institution_admins
for insert
to authenticated
with check (
  public.institution_admins.user_id = auth.uid()
  AND public.institution_admins.institution_id = (
    select u.institution_id
    from public.users u
    where u.id = auth.uid()
    limit 1
  )
);

-- Policies: user_preferences (estudiante)
drop policy if exists user_preferences_select_owner on public.user_preferences;
create policy user_preferences_select_owner
on public.user_preferences
for select
to authenticated
using (public.user_preferences.user_id = auth.uid());

drop policy if exists user_preferences_upsert_owner on public.user_preferences;
create policy user_preferences_upsert_owner
on public.user_preferences
for insert
to authenticated
with check (public.user_preferences.user_id = auth.uid());

drop policy if exists user_preferences_update_owner on public.user_preferences;
create policy user_preferences_update_owner
on public.user_preferences
for update
to authenticated
using (public.user_preferences.user_id = auth.uid())
with check (public.user_preferences.user_id = auth.uid());

-- Policies: activity_logs
drop policy if exists activity_logs_select_self_or_admin on public.activity_logs;
create policy activity_logs_select_self_or_admin
on public.activity_logs
for select
to authenticated
using (
  public.activity_logs.user_id = auth.uid()
  OR public.is_institution_admin((
    select u.institution_id from public.users u where u.id = public.activity_logs.user_id
  ))
);

drop policy if exists activity_logs_insert_self on public.activity_logs;
create policy activity_logs_insert_self
on public.activity_logs
for insert
to authenticated
with check (public.activity_logs.user_id = auth.uid());

-- Policies: compliance_logs
-- Inserción permitida para cualquier usuario autenticado de la institución (estudiante puede enviar scan).
drop policy if exists compliance_logs_select_admin on public.compliance_logs;
create policy compliance_logs_select_admin
on public.compliance_logs
for select
to authenticated
using (public.is_institution_admin(public.compliance_logs.institution_id));

drop policy if exists compliance_logs_insert_same_institution_user on public.compliance_logs;
create policy compliance_logs_insert_same_institution_user
on public.compliance_logs
for insert
to authenticated
with check (
  public.compliance_logs.institution_id = public.get_my_institution_id()
);

-- Policies: compliance_reports
drop policy if exists compliance_reports_select_admin on public.compliance_reports;
create policy compliance_reports_select_admin
on public.compliance_reports
for select
to authenticated
using (public.is_institution_admin(public.compliance_reports.institution_id));

drop policy if exists compliance_reports_insert_admin_or_job on public.compliance_reports;
create policy compliance_reports_insert_admin_or_job
on public.compliance_reports
for insert
to authenticated
with check (public.is_institution_admin(public.compliance_reports.institution_id));

-- Fin

