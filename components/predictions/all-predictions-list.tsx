"use client";

import { useEffect, useState } from "react";
import { EyeOff, Loader2, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { formatMatchDate } from "@/lib/utils";
import type { Database } from "@/types/database";

type Match = Database["public"]["Tables"]["matches"]["Row"];
type Team = Database["public"]["Tables"]["teams"]["Row"];
type Prediction = Database["public"]["Tables"]["predictions"]["Row"];
type Member = Database["public"]["Tables"]["pool_members"]["Row"];

type MatchPredictions = {
  match: Match;
  homeTeam: Team | null;
  awayTeam: Team | null;
  predictions: Array<Prediction & { participantName: string; isWildcard: boolean }>;
};

const resultLabels = {
  exact: "Exacto",
  difference: "Diferencia",
  winner: "Ganador",
  none: "Fallado",
};

export function AllPredictionsList() {
  const [items, setItems] = useState<MatchPredictions[]>([]);
  const [hideFinished, setHideFinished] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPredictions() {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError("Inicia sesión para consultar los pronósticos.");
        setLoading(false);
        return;
      }

      const { data: pool, error: poolError } = await supabase
        .from("pools")
        .select("id")
        .eq("is_active", true)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle();

      if (poolError || !pool) {
        setError(`No encontramos la quiniela activa: ${poolError?.message ?? "sin datos"}`);
        setLoading(false);
        return;
      }

      const fallbackName =
        typeof user.user_metadata?.name === "string" && user.user_metadata.name.length > 0
          ? user.user_metadata.name
          : user.email?.split("@")[0] ?? "Participante";

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          name: fallbackName,
        },
        { onConflict: "id" },
      );

      if (profileError) {
        setError(`No pudimos preparar tu perfil: ${profileError.message}`);
        setLoading(false);
        return;
      }

      const { error: membershipError } = await supabase.from("pool_members").upsert(
        {
          pool_id: pool.id,
          user_id: user.id,
          display_name: fallbackName,
        },
        { onConflict: "pool_id,user_id" },
      );

      if (membershipError) {
        setError(`No pudimos acceder a la quiniela: ${membershipError.message}`);
        setLoading(false);
        return;
      }

      const [
        { data: predictions, error: predictionsError },
        { data: members, error: membersError },
        { data: wildcards, error: wildcardsError },
      ] = await Promise.all([
        supabase
          .from("predictions")
          .select("*")
          .eq("pool_id", pool.id)
          .order("created_at", { ascending: true }),
        supabase.from("pool_members").select("*").eq("pool_id", pool.id),
        supabase
          .from("daily_wildcards")
          .select("user_id, match_id")
          .eq("pool_id", pool.id),
      ]);

      if (predictionsError || membersError || wildcardsError) {
        setError(
          `No pudimos cargar los pronósticos: ${
            predictionsError?.message ?? membersError?.message ?? wildcardsError?.message
          }`,
        );
        setLoading(false);
        return;
      }

      if (!predictions?.length) {
        setItems([]);
        setLoading(false);
        return;
      }

      const matchIds = Array.from(new Set(predictions.map((prediction) => prediction.match_id)));
      const { data: matches, error: matchesError } = await supabase
        .from("matches")
        .select("*")
        .in("id", matchIds)
        .order("match_date", { ascending: true });

      if (matchesError || !matches) {
        setError(`No pudimos cargar los partidos: ${matchesError?.message ?? "sin datos"}`);
        setLoading(false);
        return;
      }

      const teamIds = Array.from(
        new Set(
          matches
            .flatMap((match) => [match.home_team_id, match.away_team_id])
            .filter((id): id is string => Boolean(id)),
        ),
      );
      const { data: teams, error: teamsError } = teamIds.length
        ? await supabase.from("teams").select("*").in("id", teamIds)
        : { data: [] as Team[], error: null };

      if (teamsError) {
        setError(`No pudimos cargar los equipos: ${teamsError.message}`);
        setLoading(false);
        return;
      }

      const memberMap = new Map(
        ((members ?? []) as Member[]).map((member) => [member.user_id, member.display_name]),
      );
      const teamMap = new Map(((teams ?? []) as Team[]).map((team) => [team.id, team]));
      const wildcardKeys = new Set(
        (wildcards ?? []).map((wildcard) => `${wildcard.user_id}:${wildcard.match_id}`),
      );

      setItems(
        (matches as Match[]).map((match) => ({
          match,
          homeTeam: match.home_team_id ? teamMap.get(match.home_team_id) ?? null : null,
          awayTeam: match.away_team_id ? teamMap.get(match.away_team_id) ?? null : null,
          predictions: (predictions as Prediction[])
            .filter((prediction) => prediction.match_id === match.id)
            .map((prediction) => ({
              ...prediction,
              participantName: memberMap.get(prediction.user_id) ?? "Participante",
              isWildcard: wildcardKeys.has(`${prediction.user_id}:${prediction.match_id}`),
            })),
        })),
      );
      setLoading(false);
    }

    loadPredictions();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-48 items-center justify-center text-muted-foreground">
        <Loader2 className="mr-2 size-5 animate-spin" />
        Cargando pronósticos...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Todavía no hay pronósticos registrados.
      </div>
    );
  }

  const finishedCount = items.filter(({ match }) => match.status === "finished").length;
  const visibleItems = hideFinished
    ? items.filter(({ match }) => match.status !== "finished")
    : items;

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-cup-blue/20 bg-card p-4 shadow-sm">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cup-blue text-white">
            <EyeOff className="size-4" />
          </span>
          <span>
            <span className="block font-semibold">Ocultar partidos jugados</span>
            <span className="block text-sm text-muted-foreground">
              {finishedCount} {finishedCount === 1 ? "partido finalizado" : "partidos finalizados"}
            </span>
          </span>
        </span>
        <input
          type="checkbox"
          checked={hideFinished}
          onChange={(event) => setHideFinished(event.target.checked)}
          className="size-5 shrink-0 accent-cup-blue"
        />
      </label>

      {visibleItems.length ? (
        <div className="grid gap-4">
          {visibleItems.map(({ match, homeTeam, awayTeam, predictions }) => {
        const home = homeTeam?.name ?? match.home_placeholder ?? "Local";
        const away = awayTeam?.name ?? match.away_placeholder ?? "Visitante";

        return (
          <Card key={match.id}>
            <CardHeader className="gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={match.status === "finished" ? "gold" : "secondary"}>
                  {match.status === "finished" ? "Finalizado" : "Programado"}
                </Badge>
                <Badge variant="outline">{match.group_name ?? match.stage}</Badge>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <CardTitle>{home} vs {away}</CardTitle>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {formatMatchDate(match.match_date)}
                  </p>
                </div>
                {match.status === "finished" &&
                match.home_score !== null &&
                match.away_score !== null ? (
                  <p className="text-xl font-bold">
                    {match.home_score} - {match.away_score}
                  </p>
                ) : null}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {predictions.map((prediction) => (
                  <div
                    key={prediction.id}
                    className="flex items-center justify-between rounded-md border bg-background p-3"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 truncate font-medium">
                        <Users className="size-4 shrink-0 text-muted-foreground" />
                        {prediction.participantName}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Pronóstico:{" "}
                        <span className="font-semibold text-foreground">
                          {prediction.predicted_home_score} - {prediction.predicted_away_score}
                        </span>
                      </p>
                      {prediction.isWildcard ? (
                        <Badge variant="gold" className="mt-2">
                          Comodín x2
                        </Badge>
                      ) : null}
                    </div>
                    {match.status === "finished" ? (
                      <div className="ml-3 flex shrink-0 flex-col items-end gap-1">
                        <Badge>{prediction.points_awarded} pts</Badge>
                        <span className="text-xs text-muted-foreground">
                          {prediction.result_type
                            ? resultLabels[prediction.result_type]
                            : "Pendiente"}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
          })}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No hay partidos pendientes con pronósticos. Desactiva el filtro para consultar los
          partidos finalizados.
        </div>
      )}
    </div>
  );
}
