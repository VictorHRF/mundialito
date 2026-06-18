import Link from "next/link";
import { CalendarDays, ListChecks, Trophy } from "lucide-react";
import { DashboardGreeting } from "@/components/dashboard-greeting";
import { AppShell } from "@/components/layout/app-shell";
import { MatchCard } from "@/components/matches/match-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ensureProfile, getMatches, getRanking } from "@/lib/actions/queries";

export default async function DashboardPage() {
  const [profile, matches, ranking] = await Promise.all([ensureProfile(), getMatches(), getRanking()]);
  const me = ranking.find((row) => row.user_id === profile?.id);
  const upcoming = matches.filter((match) => match.status !== "finished").slice(0, 3);
  const pending = matches.filter((match) => !match.user_prediction && match.status !== "finished");

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-bold text-cup-blue">Dashboard</p>
        <DashboardGreeting fallbackName={profile?.name} />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border-t-4 border-t-cup-yellow">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="size-4 text-cup-yellow" />
              Puntos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cup-navy">{me?.total_points ?? 0}</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-cup-magenta">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <ListChecks className="size-4 text-cup-magenta" />
              Posición
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cup-navy">{me ? `#${me.position}` : "-"}</p>
          </CardContent>
        </Card>
        <Card className="border-t-4 border-t-cup-cyan">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="size-4 text-cup-cyan" />
              Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-cup-navy">{pending.length}</p>
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
