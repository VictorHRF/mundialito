-- Selecciones participantes en la Copa Mundial 2026.
-- Este script es idempotente: inserta equipos faltantes y actualiza
-- el nombre y grupo de los que ya existen.

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

-- Verificación: debe devolver 48.
select count(*) as total_teams_2026
from public.teams
where group_name between 'A' and 'L';
