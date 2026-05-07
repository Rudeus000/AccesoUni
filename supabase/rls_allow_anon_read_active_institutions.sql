-- Si GET /api/v1/public/allowed-domains devuelve {"domains":[]} pero en Table Editor
-- sí hay filas con status = active, casi seguro el backend usa la clave ANON en
-- SUPABASE_SERVICE_ROLE_KEY. Con RLS, «anon» no tenía ninguna política SELECT en
-- institutions → 0 filas.
--
-- Solución recomendada: en backend/.env poner la clave secreta «service_role»
-- (Settings → API en Supabase).
--
-- Solución alternativa (menos ideal): ejecutar este script en SQL Editor para
-- permitir que quien use la clave anon lea solo instituciones activas.

drop policy if exists institutions_select_active_anon_public on public.institutions;
create policy institutions_select_active_anon_public
on public.institutions
for select
to anon
using (status = 'active'::institution_status);
