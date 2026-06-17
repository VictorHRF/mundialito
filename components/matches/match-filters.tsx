"use client";

import { useMemo, useState } from "react";
import { MatchCard } from "@/components/matches/match-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MatchWithTeams } from "@/types/match";

type Filter = "all" | "pending" | "predicted" | "finished";

export function MatchFilters({ matches }: { matches: MatchWithTeams[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [stage, setStage] = useState("all");

  const stages = useMemo(
    () => Array.from(new Set(matches.map((match) => match.group_name ?? match.stage).filter(Boolean))),
    [matches],
  );

  const filtered = matches.filter((match) => {
    const byStatus =
      filter === "all" ||
      (filter === "pending" && !match.user_prediction && match.status !== "finished") ||
      (filter === "predicted" && Boolean(match.user_prediction)) ||
      (filter === "finished" && match.status === "finished");
    const byStage = stage === "all" || (match.group_name ?? match.stage) === stage;
    return byStatus && byStage;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
          <TabsList className="grid w-full grid-cols-4 md:w-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendientes</TabsTrigger>
            <TabsTrigger value="predicted">Pronosticados</TabsTrigger>
            <TabsTrigger value="finished">Finalizados</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select value={stage} onValueChange={setStage}>
          <SelectTrigger className="md:w-56">
            <SelectValue placeholder="Grupo o fase" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las fases</SelectItem>
            {stages.map((item) => (
              <SelectItem key={item} value={item}>
                {item}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {filtered.length ? (
        <div className="grid gap-3">
          {filtered.map((match) => (
            <MatchCard key={match.id} match={match} />
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
          No hay partidos para este filtro.
        </div>
      )}
    </div>
  );
}
