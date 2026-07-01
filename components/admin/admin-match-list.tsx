"use client";

import { EyeOff } from "lucide-react";
import { AdminMatchResultForm } from "@/components/admin/admin-match-result-form";
import { Badge } from "@/components/ui/badge";
import type { MatchWithTeams } from "@/types/match";
import { useMemo, useState } from "react";

function isPlayedMatch(match: MatchWithTeams) {
  return match.status === "finished" || new Date() >= new Date(match.match_date);
}

export function AdminMatchList({ matches }: { matches: MatchWithTeams[] }) {
  const [hidePlayed, setHidePlayed] = useState(false);
  const playedCount = useMemo(() => matches.filter(isPlayedMatch).length, [matches]);
  const visibleMatches = hidePlayed ? matches.filter((match) => !isPlayedMatch(match)) : matches;

  return (
    <div className="space-y-4">
      <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border bg-card p-4 shadow-sm">
        <span className="flex min-w-0 items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-cup-blue/15 text-cup-blue">
            <EyeOff className="size-5" />
          </span>
          <span>
            <span className="block font-semibold">Ocultar partidos ya jugados</span>
            <span className="block text-sm text-muted-foreground">
              {playedCount} partidos jugados o iniciados
            </span>
          </span>
        </span>
        <input
          type="checkbox"
          checked={hidePlayed}
          onChange={(event) => setHidePlayed(event.target.checked)}
          className="size-5 shrink-0 accent-cup-blue"
        />
      </label>

      {visibleMatches.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {visibleMatches.map((match) => (
            <AdminMatchResultForm key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border border-dashed bg-card p-6 text-center">
          <Badge variant="outline">Sin partidos pendientes</Badge>
          <p className="mt-3 text-sm text-muted-foreground">
            Todos los partidos visibles ya fueron jugados o iniciaron.
          </p>
        </div>
      )}
    </div>
  );
}
