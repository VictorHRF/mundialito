# Mundialito

Mundialito es una quiniela familiar para vivir el Mundial de Fútbol 2026. El MVP permite registro, login, consulta de partidos, captura de pronósticos, bloqueo al iniciar el partido, carga admin de resultados, cálculo de puntos y ranking general.

## Stack

- Next.js con App Router
- TypeScript
- Tailwind CSS
- shadcn/ui compatible
- Supabase Auth y Postgres
- React Hook Form y Zod
- Lucide React
- Preparado para Vercel

## Instalación

```bash
pnpm install
```

## Variables de entorno

Copia `.env.example` a `.env.local` y configura:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Supabase

1. Crea un proyecto en Supabase.
2. Abre el SQL editor.
3. Ejecuta `supabase/schema.sql`.
4. Crea un usuario desde la app.
5. Para hacer admin a un usuario:

```sql
update public.profiles
set role = 'admin'
where id = 'USER_ID';
```

El schema incluye:

- `profiles`
- `pools`
- `pool_members`
- `teams`
- `matches`
- `predictions`
- RLS sugerido
- Trigger para bloquear pronósticos cuando el partido ya inició
- Seed mínimo de equipos, pool y partidos futuros

## Desarrollo local

```bash
pnpm dev
```

Abre `http://localhost:3000`.

## Build

```bash
pnpm build
```

## Deploy en Vercel

1. Sube el repositorio a GitHub.
2. Importa el proyecto en Vercel.
3. Agrega las variables de entorno.
4. Ejecuta el deploy.

## Rutas principales

- `/`
- `/login`
- `/dashboard`
- `/matches`
- `/matches/[id]`
- `/my-predictions`
- `/ranking`
- `/admin`
- `/profile`

## Reglas de puntos

Fase de grupos:

- Ganador o empate correcto: 2 puntos
- Diferencia de goles correcta: 1 punto adicional
- Marcador exacto: 2 puntos adicionales
- Máximo por partido: 5 puntos

Eliminación directa:

- Ganador correcto: 3 puntos
- Diferencia de goles correcta: 1 punto adicional
- Marcador exacto: 2 puntos adicionales
- Máximo por partido: 6 puntos

Los puntos son acumulativos. Por ejemplo, en fase de grupos, si el resultado
real es 3-1 y el pronóstico es 2-0, se obtienen 3 puntos: 2 por acertar al
ganador y 1 por acertar la diferencia de dos goles.

La lógica vive en `lib/scoring.ts`.
