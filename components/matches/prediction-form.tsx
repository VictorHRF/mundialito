"use client";

import { useActionState } from "react";
import { Loader2, Lock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { savePrediction, type MutationState } from "@/lib/actions/predictions";
import type { Prediction } from "@/types/prediction";

const initialState: MutationState = { ok: false, message: "" };

type PredictionFormProps = {
  matchId: string;
  locked: boolean;
  prediction: Prediction | null;
};

export function PredictionForm({ matchId, locked, prediction }: PredictionFormProps) {
  const [state, action, pending] = useActionState(savePrediction, initialState);

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
    <form action={action} className="space-y-4">
      <input type="hidden" name="matchId" value={matchId} />
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="predictedHomeScore">Local</Label>
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
          <Label htmlFor="predictedAwayScore">Visitante</Label>
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
      {state.message ? (
        <Alert variant={state.ok ? "default" : "destructive"}>
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        Guardar pronóstico
      </Button>
    </form>
  );
}
