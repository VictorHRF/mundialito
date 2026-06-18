"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { Prediction } from "@/types/prediction";

type PredictionFormProps = {
  matchId: string;
  homeTeamName: string;
  awayTeamName: string;
  locked: boolean;
  prediction: Prediction | null;
};

export function PredictionForm({
  matchId,
  homeTeamName,
  awayTeamName,
  locked,
  prediction,
}: PredictionFormProps) {
  const router = useRouter();
  const [accessToken, setAccessToken] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token ?? "");
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccessToken(session?.access_token ?? "");
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");
    setOk(false);

    const supabase = createClient();
    const formData = new FormData(event.currentTarget);
    const predictedHomeScore = Number(formData.get("predictedHomeScore"));
    const predictedAwayScore = Number(formData.get("predictedAwayScore"));

    if (!Number.isInteger(predictedHomeScore) || !Number.isInteger(predictedAwayScore)) {
      setPending(false);
      setMessage("Ingresa marcadores válidos.");
      return;
    }

    if (predictedHomeScore < 0 || predictedAwayScore < 0) {
      setPending(false);
      setMessage("No se permiten goles negativos.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setPending(false);
      setMessage(`Inicia sesión para pronosticar.${userError ? ` ${userError.message}` : ""}`);
      return;
    }

    const { data: match, error: matchError } = await supabase
      .from("matches")
      .select("id, match_date, home_team_id, away_team_id")
      .eq("id", matchId)
      .single();

    if (matchError || !match) {
      setPending(false);
      setMessage(`No encontramos el partido: ${matchError?.message ?? "sin datos"}`);
      return;
    }

    if (new Date() >= new Date(match.match_date)) {
      setPending(false);
      setMessage("Este pronóstico ya está bloqueado porque el partido inició.");
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
      setPending(false);
      setMessage(`No pudimos crear tu perfil: ${profileError.message}`);
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
      setPending(false);
      setMessage(`No encontramos la quiniela activa: ${poolError?.message ?? "sin pool activo"}`);
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
      setPending(false);
      setMessage(`No pudimos unirte a la quiniela: ${membershipError.message}`);
      return;
    }

    const predictedWinnerTeamId =
      predictedHomeScore > predictedAwayScore
        ? match.home_team_id
        : predictedAwayScore > predictedHomeScore
          ? match.away_team_id
          : null;

    const { error: predictionError } = await supabase.from("predictions").upsert(
      {
        pool_id: pool.id,
        user_id: user.id,
        match_id: matchId,
        predicted_home_score: predictedHomeScore,
        predicted_away_score: predictedAwayScore,
        predicted_winner_team_id: predictedWinnerTeamId,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "pool_id,user_id,match_id" },
    );

    setPending(false);

    if (predictionError) {
      setMessage(`No pudimos guardar el pronóstico: ${predictionError.message}`);
      return;
    }

    setOk(true);
    setMessage("Pronóstico guardado.");
    router.refresh();
  }

  if (locked) {
    return (
      <Alert>
        <Lock className="size-4" />
        <AlertTitle>Pronóstico bloqueado</AlertTitle>
        <AlertDescription>
          El partido ya inició. Puedes consultar tu pronóstico, pero no editarlo.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="hidden" name="matchId" value={matchId} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="predictedHomeScore" className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Local</span>
            <span>{homeTeamName}</span>
          </Label>
          <Input
            id="predictedHomeScore"
            name="predictedHomeScore"
            type="number"
            min={0}
            required
            defaultValue={prediction?.predicted_home_score ?? ""}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="predictedAwayScore" className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Visitante</span>
            <span>{awayTeamName}</span>
          </Label>
          <Input
            id="predictedAwayScore"
            name="predictedAwayScore"
            type="number"
            min={0}
            required
            defaultValue={prediction?.predicted_away_score ?? ""}
          />
        </div>
      </div>
      {message ? (
        <Alert variant={ok ? "default" : "destructive"}>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending || !accessToken}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        {accessToken ? "Guardar pronóstico" : "Preparando sesión..."}
      </Button>
    </form>
  );
}
