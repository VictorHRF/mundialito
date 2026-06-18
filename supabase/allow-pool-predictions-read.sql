-- Ejecuta este archivo en Supabase SQL Editor para permitir que cada usuario
-- vea los pronósticos de los participantes de su misma quiniela.
-- La función SECURITY DEFINER evita recursión en las políticas de pool_members.

create or replace function public.is_pool_member(target_pool_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pool_members
    where pool_id = target_pool_id
      and user_id = auth.uid()
  );
$$;

drop policy if exists "predictions_read_own" on public.predictions;
create policy "predictions_read_own"
on public.predictions for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_pool_member(pool_id)
  or public.is_admin()
);
