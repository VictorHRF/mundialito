-- Ejecuta este archivo en Supabase SQL Editor.
-- Evita que los flujos normales de la aplicación sobrescriban roles
-- y bloquea cambios de rol hechos por usuarios que no sean admin.

create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role
    and auth.uid() is not null
    and not public.is_admin()
  then
    raise exception 'Solo un administrador puede cambiar roles.';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_role_update on public.profiles;
create trigger protect_profile_role_update
  before update of role on public.profiles
  for each row execute procedure public.protect_profile_role();
