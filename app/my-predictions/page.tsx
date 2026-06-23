import Link from "next/link";
import { PencilLine } from "lucide-react";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getUserPredictions } from "@/lib/actions/queries";
import { isPredictionLocked } from "@/lib/utils";

const resultLabels = {
  exact: "exacto",
  winner: "acertado",
  difference: "diferencia",
  none: "fallado",
};

export default async function MyPredictionsPage() {
  const predictions = await getUserPredictions();

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">Mis pronósticos</p>
        <h1 className="text-2xl font-bold tracking-normal md:text-3xl">Tus marcadores</h1>
      </div>
      {predictions.length ? (
        <div className="grid gap-3">
          {predictions.map((prediction) => {
            const match = prediction.match;
            const home = match.home_team?.name ?? match.home_placeholder ?? "Local";
            const away = match.away_team?.name ?? match.away_placeholder ?? "Visitante";
            const resultType = prediction.result_type ?? "none";
            const status = match.status === "finished" ? resultLabels[resultType] : "pendiente";
            const locked = isPredictionLocked(match.match_date);

            return (
              <Card key={prediction.id}>
                <CardContent className="p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold">{home} vs {away}</p>
                      <p className="text-sm text-muted-foreground">
                        Pronóstico: {prediction.predicted_home_score} - {prediction.predicted_away_score}
                        {match.home_score !== null && match.away_score !== null
                          ? ` · Resultado: ${match.home_score} - ${match.away_score}`
                          : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {prediction.is_wildcard ? (
                        <Badge variant="gold">Comodín x2</Badge>
                      ) : null}
                      <Badge variant={status === "exacto" ? "gold" : "secondary"}>{status}</Badge>
                      <Badge>{prediction.points_awarded} pts</Badge>
                      {!locked ? (
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/matches/${match.id}`}>
                            <PencilLine className="size-4" />
                            Editar
                          </Link>
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          Todavía no tienes pronósticos guardados.
        </div>
      )}
    </AppShell>
  );
}
