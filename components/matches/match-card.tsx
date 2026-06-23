import Link from "next/link";
import { CalendarClock, MapPin, PencilLine } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatMatchDate, isPredictionLocked } from "@/lib/utils";
import type { MatchWithTeams } from "@/types/match";

const statusLabels = {
  scheduled: "Programado",
  live: "En vivo",
  finished: "Finalizado",
};

export function MatchCard({ match }: { match: MatchWithTeams }) {
  const home = match.home_team?.name ?? match.home_placeholder ?? "Por definir";
  const away = match.away_team?.name ?? match.away_placeholder ?? "Por definir";
  const locked = isPredictionLocked(match.match_date);

  return (
    <Card
      className={`overflow-hidden border-l-4 ${
        match.status === "finished"
          ? "border-l-cup-yellow"
          : match.status === "live"
            ? "border-l-cup-red"
            : match.user_prediction
              ? "border-l-cup-cyan"
              : "border-l-cup-blue"
      }`}
    >
      <CardContent className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <Badge variant={match.status === "finished" ? "gold" : match.status === "live" ? "destructive" : "secondary"}>
                {statusLabels[match.status]}
              </Badge>
              <Badge variant="outline">{match.group_name ?? match.stage}</Badge>
              {match.user_prediction ? (
                <Badge>Pronosticado</Badge>
              ) : (
                <Badge variant="outline">Pendiente</Badge>
              )}
              {match.user_prediction?.is_wildcard ? (
                <Badge variant="gold">Comodín x2</Badge>
              ) : null}
            </div>
            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
              <p className="truncate text-base font-semibold">{home}</p>
              <span className="rounded-md bg-cup-navy px-2 py-1 text-xs font-bold text-white">vs</span>
              <p className="truncate text-right text-base font-semibold">{away}</p>
            </div>
            {match.user_prediction ? (
              <div className="mt-3 flex items-center justify-center gap-3 rounded-md border border-cup-cyan/30 bg-cup-cyan/10 px-3 py-2">
                <span className="text-xs font-semibold text-muted-foreground">Tu pronóstico</span>
                <span className="text-lg font-bold text-cup-navy">
                  {match.user_prediction.predicted_home_score} -{" "}
                  {match.user_prediction.predicted_away_score}
                </span>
              </div>
            ) : null}
            {match.status === "finished" && match.home_score !== null && match.away_score !== null ? (
              <div className="mt-2 text-center">
                <span className="text-xs font-semibold text-muted-foreground">Resultado final</span>
                <p className="text-lg font-bold">{match.home_score} - {match.away_score}</p>
              </div>
            ) : null}
            <div className="mt-4 flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:gap-4">
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
          </div>
          <Button asChild variant={locked ? "outline" : "default"} className="sm:w-auto">
            <Link href={`/matches/${match.id}`}>
              <PencilLine className="size-4" />
              {match.user_prediction ? "Editar" : "Pronosticar"}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
