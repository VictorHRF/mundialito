-- Ejecuta este archivo en Supabase SQL Editor si ya habías aplicado schema.sql.
-- Corrige la recursión infinita causada por políticas que consultaban pool_members
-- desde políticas de pool_members/profiles.

drop policy if exists "profiles_select_own_or_members" on public.profiles;
create policy "profiles_select_own_or_members"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "pool_members_read_same_pool" on public.pool_members;
create policy "pool_members_read_same_pool"
on public.pool_members for select
to authenticated
using (true);

drop policy if exists "predictions_read_own" on public.predictions;
create policy "predictions_read_own"
on public.predictions for select
to authenticated
using (user_id = auth.uid() or public.is_admin());
