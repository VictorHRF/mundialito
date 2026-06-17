"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateMatchResult, type MutationState } from "@/lib/actions/predictions";
import type { MatchWithTeams } from "@/types/match";

const initialState: MutationState = { ok: false, message: "" };

export function AdminMatchResultForm({ match }: { match: MatchWithTeams }) {
  const [state, action, pending] = useActionState(updateMatchResult, initialState);
  const home = match.home_team?.name ?? match.home_placeholder ?? "Local";
  const away = match.away_team?.name ?? match.away_placeholder ?? "Visitante";

  return (
    <form action={action} className="space-y-3 rounded-lg border bg-card p-4">
      <input type="hidden" name="matchId" value={match.id} />
      <div>
        <p className="font-semibold">{home} vs {away}</p>
        <p className="text-sm text-muted-foreground">{match.stage}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${match.id}-home`}>{home}</Label>
          <Input
            id={`${match.id}-home`}
            name="homeScore"
            type="number"
            min={0}
            defaultValue={match.home_score ?? ""}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${match.id}-away`}>{away}</Label>
          <Input
            id={`${match.id}-away`}
            name="awayScore"
            type="number"
            min={0}
            defaultValue={match.away_score ?? ""}
            required
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
        Guardar resultado y recalcular
      </Button>
    </form>
  );
}
