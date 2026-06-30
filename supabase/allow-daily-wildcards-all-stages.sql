-- Ejecuta este archivo en Supabase SQL Editor.
-- Permite usar el comodin diario en cualquier fase del torneo.
-- Se conserva la regla: un comodin por usuario, pool y dia CDMX.

create or replace function public.validate_daily_wildcard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  starts_at timestamptz;
  old_starts_at timestamptz;
begin
  select match_date
  into starts_at
  from public.matches
  where id = new.match_id;

  if starts_at is null then
    raise exception 'No encontramos el partido del comodin.';
  end if;

  if now() >= starts_at then
    raise exception 'El comodin ya no puede modificarse porque el partido inicio.';
  end if;

  if tg_op = 'UPDATE' and old.match_id is distinct from new.match_id then
    select match_date into old_starts_at
    from public.matches
    where id = old.match_id;

    if old_starts_at is not null and now() >= old_starts_at then
      raise exception 'El comodin de este dia ya esta bloqueado.';
    end if;
  end if;

  if not exists (
    select 1
    from public.predictions
    where pool_id = new.pool_id
      and user_id = new.user_id
      and match_id = new.match_id
  ) then
    raise exception 'Guarda primero el pronostico del partido.';
  end if;

  new.match_day = (starts_at at time zone 'America/Mexico_City')::date;
  new.updated_at = now();
  return new;
end;
$$;
