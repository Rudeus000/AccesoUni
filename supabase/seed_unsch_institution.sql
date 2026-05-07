-- Seed: Universidad Nacional de San Cristóbal de Huamanga (UNSCH)
--
-- Dominio apex en institutions: unsch.edu.pe
-- Cubre subdominios usados por la universidad, por ejemplo:
--   https://enlinea.unsch.edu.pe/
--   https://enlinea2.unsch.edu.pe/new_transparencia/
-- (la extensión envía el hostname; el backend hace match con *.unsch.edu.pe)
--
-- Dónde: Supabase Dashboard → SQL Editor → ejecutar.
-- Opcional: tras crear un usuario en Authentication, replica el patrón de
-- seed_demo_user.sql (INSERT desde auth.users) para public.users.

insert into public.institutions (domain, name, plan, status)
values (
  'unsch.edu.pe',
  'Universidad Nacional de San Cristóbal de Huamanga (UNSCH)',
  'basic'::institution_plan,
  'active'::institution_status
)
on conflict (domain) do update
  set
    name = excluded.name,
    plan = excluded.plan,
    status = excluded.status;
