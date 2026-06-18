create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  avatar_url text,
  role text not null default 'player' check (role in ('player', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.pools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  owner_id uuid references public.profiles(id),
  invite_code text unique not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.pool_members (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  display_name text not null,
  total_points int not null default 0,
  joined_at timestamptz not null default now(),
  unique(pool_id, user_id)
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text not null unique,
  flag_url text,
  group_name text
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  match_number int,
  stage text not null,
  group_name text,
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  home_placeholder text,
  away_placeholder text,
  home_score int,
  away_score int,
  match_date timestamptz not null,
  stadium text,
  status text not null default 'scheduled' check (status in ('scheduled', 'live', 'finished')),
  created_at timestamptz not null default now()
);

create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  pool_id uuid not null references public.pools(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  match_id uuid not null references public.matches(id) on delete cascade,
  predicted_home_score int not null check (predicted_home_score >= 0),
  predicted_away_score int not null check (predicted_away_score >= 0),
  predicted_winner_team_id uuid references public.teams(id),
  points_awarded int not null default 0,
  result_type text check (result_type in ('exact', 'winner', 'difference', 'none')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(pool_id, user_id, match_id)
);

create index if not exists predictions_pool_user_idx on public.predictions(pool_id, user_id);
create index if not exists matches_match_date_idx on public.matches(match_date);

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

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

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1), 'Participante'))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.prevent_locked_prediction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  starts_at timestamptz;
begin
  select match_date into starts_at from public.matches where id = new.match_id;

  if starts_at is null then
    raise exception 'No encontramos el partido.';
  end if;

  if now() >= starts_at then
    raise exception 'Este pronostico ya esta bloqueado porque el partido inicio.';
  end if;

  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists block_locked_prediction on public.predictions;
create trigger block_locked_prediction
  before insert or update of predicted_home_score, predicted_away_score, predicted_winner_team_id
  on public.predictions
  for each row execute procedure public.prevent_locked_prediction();

alter table public.profiles enable row level security;
alter table public.pools enable row level security;
alter table public.pool_members enable row level security;
alter table public.teams enable row level security;
alter table public.matches enable row level security;
alter table public.predictions enable row level security;

drop policy if exists "profiles_select_own_or_members" on public.profiles;
create policy "profiles_select_own_or_members"
on public.profiles for select
to authenticated
using (id = auth.uid() or public.is_admin());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles for insert
to authenticated
with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

drop policy if exists "pools_read_active" on public.pools;
create policy "pools_read_active"
on public.pools for select
to authenticated
using (is_active = true);

drop policy if exists "pool_members_read_same_pool" on public.pool_members;
create policy "pool_members_read_same_pool"
on public.pool_members for select
to authenticated
using (true);

drop policy if exists "pool_members_join_self" on public.pool_members;
create policy "pool_members_join_self"
on public.pool_members for insert
to authenticated
with check (user_id = auth.uid());

drop policy if exists "pool_members_update_self_or_admin" on public.pool_members;
create policy "pool_members_update_self_or_admin"
on public.pool_members for update
to authenticated
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

drop policy if exists "teams_read_all" on public.teams;
create policy "teams_read_all"
on public.teams for select
to authenticated
using (true);

drop policy if exists "matches_read_all" on public.matches;
create policy "matches_read_all"
on public.matches for select
to authenticated
using (true);

drop policy if exists "matches_update_admin" on public.matches;
create policy "matches_update_admin"
on public.matches for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "predictions_read_own" on public.predictions;
create policy "predictions_read_own"
on public.predictions for select
to authenticated
using (
  user_id = auth.uid()
  or public.is_pool_member(pool_id)
  or public.is_admin()
);

drop policy if exists "predictions_insert_own_before_match" on public.predictions;
create policy "predictions_insert_own_before_match"
on public.predictions for insert
to authenticated
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.matches
    where matches.id = predictions.match_id
      and now() < matches.match_date
  )
);

drop policy if exists "predictions_update_own_before_match" on public.predictions;
create policy "predictions_update_own_before_match"
on public.predictions for update
to authenticated
using (
  user_id = auth.uid()
  and exists (
    select 1 from public.matches
    where matches.id = predictions.match_id
      and now() < matches.match_date
  )
)
with check (
  user_id = auth.uid()
  and exists (
    select 1 from public.matches
    where matches.id = predictions.match_id
      and now() < matches.match_date
  )
);

insert into public.teams (name, code, group_name)
values
  ('México', 'MEX', 'A'),
  ('Sudáfrica', 'RSA', 'A'),
  ('Corea del Sur', 'KOR', 'A'),
  ('República Checa', 'CZE', 'A'),
  ('Canadá', 'CAN', 'B'),
  ('Bosnia y Herzegovina', 'BIH', 'B'),
  ('Catar', 'QAT', 'B'),
  ('Suiza', 'SUI', 'B'),
  ('Brasil', 'BRA', 'C'),
  ('Marruecos', 'MAR', 'C'),
  ('Haití', 'HAI', 'C'),
  ('Escocia', 'SCO', 'C'),
  ('Estados Unidos', 'USA', 'D'),
  ('Paraguay', 'PAR', 'D'),
  ('Australia', 'AUS', 'D'),
  ('Turquía', 'TUR', 'D'),
  ('Alemania', 'GER', 'E'),
  ('Curazao', 'CUW', 'E'),
  ('Costa de Marfil', 'CIV', 'E'),
  ('Ecuador', 'ECU', 'E'),
  ('Países Bajos', 'NED', 'F'),
  ('Japón', 'JPN', 'F'),
  ('Túnez', 'TUN', 'F'),
  ('Suecia', 'SWE', 'F'),
  ('Bélgica', 'BEL', 'G'),
  ('Egipto', 'EGY', 'G'),
  ('Irán', 'IRN', 'G'),
  ('Nueva Zelanda', 'NZL', 'G'),
  ('España', 'ESP', 'H'),
  ('Cabo Verde', 'CPV', 'H'),
  ('Arabia Saudita', 'KSA', 'H'),
  ('Uruguay', 'URU', 'H'),
  ('Francia', 'FRA', 'I'),
  ('Senegal', 'SEN', 'I'),
  ('Noruega', 'NOR', 'I'),
  ('Irak', 'IRQ', 'I'),
  ('Argentina', 'ARG', 'J'),
  ('Argelia', 'ALG', 'J'),
  ('Austria', 'AUT', 'J'),
  ('Jordania', 'JOR', 'J'),
  ('Portugal', 'POR', 'K'),
  ('Uzbekistán', 'UZB', 'K'),
  ('Colombia', 'COL', 'K'),
  ('República Democrática del Congo', 'COD', 'K'),
  ('Inglaterra', 'ENG', 'L'),
  ('Croacia', 'CRO', 'L'),
  ('Ghana', 'GHA', 'L'),
  ('Panamá', 'PAN', 'L')
on conflict (code)
do update set
  name = excluded.name,
  group_name = excluded.group_name;

insert into public.pools (name, description, invite_code, is_active)
values ('Mundialito Familiar', 'Quiniela familiar del Mundial 2026', 'FAMILIA2026', true)
on conflict (invite_code) do update set name = excluded.name, is_active = true;

with team_ids as (
  select code, id from public.teams
)
insert into public.matches (
  match_number,
  stage,
  group_name,
  home_team_id,
  away_team_id,
  match_date,
  stadium,
  status
)
values
  (1, 'Fase de grupos', 'A', (select id from team_ids where code = 'MEX'), (select id from team_ids where code = 'RSA'), now() + interval '30 days', 'Estadio Azteca', 'scheduled'),
  (2, 'Fase de grupos', 'A', (select id from team_ids where code = 'KOR'), (select id from team_ids where code = 'CZE'), now() + interval '31 days', 'Estadio Monterrey', 'scheduled'),
  (3, 'Fase de grupos', 'A', (select id from team_ids where code = 'MEX'), (select id from team_ids where code = 'KOR'), now() + interval '35 days', 'Estadio Guadalajara', 'scheduled'),
  (4, 'Octavos de final', null, (select id from team_ids where code = 'BRA'), (select id from team_ids where code = 'ARG'), now() + interval '45 days', 'MetLife Stadium', 'scheduled'),
  (5, 'Cuartos de final', null, (select id from team_ids where code = 'ESP'), (select id from team_ids where code = 'FRA'), now() + interval '52 days', 'SoFi Stadium', 'scheduled')
on conflict do nothing;
