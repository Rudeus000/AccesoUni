-- Seed: Escuela Superior La Pontificia (ELP), dominio apex elp.edu.pe
--
-- Rutas ejemplo (la extensión envía hostname, p. ej. www.elp.edu.pe y aulavirtual.elp.edu.pe).
-- Backend resuelve subdominios contra institutions.domain = 'elp.edu.pe'.
--
-- Dónde: Supabase Dashboard → SQL Editor → ejecutar.
--
-- 1) Crea antes el usuario en Authentication con correo EXACTAMENTE el de abajo
--    (Contraseña al gusto): 70391919@elp.edu.pe
-- 2) Ejecuta este script para copiar auth.users.id → public.users.
--

with inst as (
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
      status = excluded.status
  returning id
)
insert into public.users (
  id,
  institution_id,
  email,
  name,
  disability_type
)
select
  au.id,
  i.id,
  '70391919@elp.edu.pe',
  'Estudiante ELP ejemplo',
  null
from auth.users au
cross join inst i
where lower(trim(au.email)) = lower(trim('70391919@elp.edu.pe'))
on conflict (id) do update
  set
    institution_id = excluded.institution_id,
    email = excluded.email,
    name = excluded.name,
    disability_type = excluded.disability_type;
