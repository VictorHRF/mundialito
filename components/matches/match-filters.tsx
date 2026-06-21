"use client";

import { useMemo, useState } from "react";
import { EyeOff } from "lucide-react";
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
  const [filter, setFilter] = useState<Filter>("pending");
  const [stage, setStage] = useState("all");
  const [hideFinishedPredicted, setHideFinishedPredicted] = useState(false);

  const stages = useMemo(
    () => Array.from(new Set(matches.map((match) => match.group_name ?? match.stage).filter(Boolean))),
    [matches],
  );

  const filtered = matches.filter((match) => {
    const byStatus =
      filter === "all" ||
      (filter === "pending" && !match.user_prediction && match.status !== "finished") ||
      (filter === "predicted" &&
        Boolean(match.user_prediction) &&
        (!hideFinishedPredicted || match.status !== "finished")) ||
      (filter === "finished" && match.status === "finished");
    const byStage = stage === "all" || (match.group_name ?? match.stage) === stage;
    return byStatus && byStage;
  });

  const finishedPredictedCount = matches.filter(
    (match) => match.user_prediction && match.status === "finished",
  ).length;

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
      {filter === "predicted" ? (
        <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-cup-blue/20 bg-card p-4 shadow-sm">
          <span className="flex min-w-0 items-center gap-3">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-cup-blue text-white">
              <EyeOff className="size-4" />
            </span>
            <span>
              <span className="block font-semibold">Ocultar partidos jugados</span>
              <span className="block text-sm text-muted-foreground">
                {finishedPredictedCount}{" "}
                {finishedPredictedCount === 1
                  ? "pronóstico finalizado"
                  : "pronósticos finalizados"}
              </span>
            </span>
          </span>
          <input
            type="checkbox"
            checked={hideFinishedPredicted}
            onChange={(event) => setHideFinishedPredicted(event.target.checked)}
            className="size-5 shrink-0 accent-cup-blue"
          />
        </label>
      ) : null}
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
