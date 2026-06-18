-- Ejecuta este archivo en Supabase SQL Editor.
-- Permite que un administrador actualice points_awarded y result_type
-- al recalcular un partido finalizado.

drop policy if exists "predictions_update_admin_scoring" on public.predictions;
create policy "predictions_update_admin_scoring"
on public.predictions for update
to authenticated
using (public.is_admin())
with check (public.is_admin());
