-- Ejecuta este archivo completo en Supabase SQL Editor.
-- Agrega un comodín de puntos dobles por usuario y día CDMX durante fase de grupos.

create table if not exists public.daily_wildcards (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  match_day date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pool_id, user_id, match_day),
  unique(pool_id, user_id, match_id)
);

create index if not exists daily_wildcards_match_idx
on public.daily_wildcards(match_id);

create or replace function public.validate_daily_wildcard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  starts_at timestamptz;
  selected_stage text;
  old_starts_at timestamptz;
begin
  select match_date, stage
  into starts_at, selected_stage
  from public.matches
  where id = new.match_id;

  if starts_at is null then
    raise exception 'No encontramos el partido del comodin.';
  end if;

  if lower(selected_stage) not like '%grupo%'
    and lower(selected_stage) not like '%group%'
  then
    raise exception 'El comodin diario solo esta disponible en fase de grupos.';
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

drop trigger if exists validate_daily_wildcard_write on public.daily_wildcards;
create trigger validate_daily_wildcard_write
  before insert or update on public.daily_wildcards
  for each row execute procedure public.validate_daily_wildcard();

create or replace function public.prevent_locked_wildcard_delete()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  starts_at timestamptz;
begin
  select match_date into starts_at
  from public.matches
  where id = old.match_id;

  if starts_at is not null and now() >= starts_at then
    raise exception 'El comodin ya esta bloqueado porque el partido inicio.';
  end if;

  return old;
end;
$$;

drop trigger if exists block_locked_wildcard_delete on public.daily_wildcards;
create trigger block_locked_wildcard_delete
  before delete on public.daily_wildcards
  for each row execute procedure public.prevent_locked_wildcard_delete();

alter table public.daily_wildcards enable row level security;

drop policy if exists "daily_wildcards_read" on public.daily_wildcards;
create policy "daily_wildcards_read"
on public.daily_wildcards for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_pool_member(pool_id)
  or public.is_admin()
);

drop policy if exists "daily_wildcards_insert_own" on public.daily_wildcards;
create policy "daily_wildcards_insert_own"
on public.daily_wildcards for insert
to authenticated
with check (
  user_id = auth.uid()
  and public.is_pool_member(pool_id)
);

drop policy if exists "daily_wildcards_update_own" on public.daily_wildcards;
create policy "daily_wildcards_update_own"
on public.daily_wildcards for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "daily_wildcards_delete_own" on public.daily_wildcards;
create policy "daily_wildcards_delete_own"
on public.daily_wildcards for delete
to authenticated
using (user_id = auth.uid());
