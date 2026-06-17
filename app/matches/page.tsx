import { AppShell } from "@/components/layout/app-shell";
import { MatchFilters } from "@/components/matches/match-filters";
import { getMatches } from "@/lib/actions/queries";

export default async function MatchesPage() {
  const matches = await getMatches();

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">Partidos</p>
        <h1 className="text-2xl font-bold tracking-normal md:text-3xl">Calendario del Mundialito</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Revisa juegos, estados y captura tus marcadores antes del inicio.
        </p>
      </div>
      <MatchFilters matches={matches} />
    </AppShell>
  );
}
