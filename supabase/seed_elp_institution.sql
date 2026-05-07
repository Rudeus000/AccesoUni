-- Seed: Escuela Superior La Pontificia (ELP) — dominio apex elp.edu.pe
-- Ejecutar en Supabase → SQL Editor.
-- Igual que unsch: el endpoint público sólo lista instituciones con status «active».

insert into public.institutions (domain, name, plan, status)
values (
  'elp.edu.pe',
  'Escuela Superior La Pontificia (ELP)',
  'basic'::institution_plan,
  'active'::institution_status
)
on conflict (domain) do update
  set
    name = excluded.name,
    plan = excluded.plan,
    status = excluded.status;
