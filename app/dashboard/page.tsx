import Link from "next/link";
import { CalendarDays, ListChecks, Trophy } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { MatchCard } from "@/components/matches/match-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMatches, getProfile, getRanking } from "@/lib/actions/queries";

export default async function DashboardPage() {
  const [profile, matches, ranking] = await Promise.all([getProfile(), getMatches(), getRanking()]);
  const me = ranking.find((row) => row.user_id === profile?.id);
  const upcoming = matches.filter((match) => match.status !== "finished").slice(0, 3);
  const pending = matches.filter((match) => !match.user_prediction && match.status !== "finished");

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">Dashboard</p>
        <h1 className="text-2xl font-bold tracking-normal md:text-3xl">
          Hola, {profile?.name ?? "familia"}
        </h1>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="size-4" />
              Puntos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{me?.total_points ?? 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <ListChecks className="size-4" />
              Posición
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{me ? `#${me.position}` : "-"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{pending.length}</p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <Button asChild>
          <Link href="/matches">Ver partidos</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/ranking">Ver ranking</Link>
        </Button>
      </div>
      <section className="mt-8">
        <h2 className="mb-3 text-xl font-semibold">Próximos partidos</h2>
        {upcoming.length ? (
          <div className="grid gap-3">
            {upcoming.map((match) => (
              <MatchCard key={match.id} match={match} />
            ))}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
            No hay próximos partidos.
          </div>
        )}
      </section>
    </AppShell>
  );
}
