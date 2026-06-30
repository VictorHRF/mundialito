import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarClock, MapPin } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { PredictionForm } from "@/components/matches/prediction-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getMatchById, getUserPrediction } from "@/lib/actions/queries";
import { formatMatchDate, isPredictionLocked } from "@/lib/utils";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MatchDetailPage({ params }: PageProps) {
  const { id } = await params;
  const [match, prediction] = await Promise.all([getMatchById(id), getUserPrediction(id)]);
  if (!match) notFound();

  const home = match.home_team?.name ?? match.home_placeholder ?? "Por definir";
  const away = match.away_team?.name ?? match.away_placeholder ?? "Por definir";
  const locked = isPredictionLocked(match.match_date);

  return (
    <AppShell>
      <Button asChild variant="ghost" className="mb-4 px-0">
        <Link href="/matches">
          <ArrowLeft className="size-4" />
          Volver a partidos
        </Link>
      </Button>
      <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge>{match.status}</Badge>
              <Badge variant="outline">{match.group_name ?? match.stage}</Badge>
            </div>
            <CardTitle className="text-2xl">{home} vs {away}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg bg-secondary p-4">
              <p className="font-semibold">{home}</p>
              <span className="font-bold">vs</span>
              <p className="text-right font-semibold">{away}</p>
            </div>
            {match.status === "finished" && match.home_score !== null && match.away_score !== null ? (
              <div className="rounded-lg border p-4 text-center">
                <p className="text-sm text-muted-foreground">Resultado final</p>
                <p className="text-3xl font-bold">{match.home_score} - {match.away_score}</p>
              </div>
            ) : null}
            <div className="grid gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <CalendarClock className="size-4" />
                {formatMatchDate(match.match_date)}
              </span>
              {match.stadium ? (
                <span className="flex items-center gap-2">
                  <MapPin className="size-4" />
                  {match.stadium}
                </span>
              ) : null}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tu pronóstico</CardTitle>
          </CardHeader>
          <CardContent>
            {prediction ? (
              <p className="mb-4 text-sm text-muted-foreground">
                Guardado: {prediction.predicted_home_score} - {prediction.predicted_away_score}
              </p>
            ) : null}
            <PredictionForm
              matchId={match.id}
              matchDate={match.match_date}
              homeTeamName={home}
              awayTeamName={away}
              locked={locked}
              prediction={prediction}
            />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
