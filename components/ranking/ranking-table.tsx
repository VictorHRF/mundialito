import { Crown, Medal, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RankingRow } from "@/types/ranking";

const positionNicknames = [
  "El Oráculo del VAR",
  "A un rebote del líder",
  "Medalla en revisión",
  "Repechaje emocional",
  "Remontada para mañana",
  "Confía en el proceso",
  "Cuchara de madera",
];

const positionStyles = [
  "border-cup-yellow bg-cup-yellow/15",
  "border-[#aebcc8] bg-[#e8eef2]",
  "border-[#c47a43] bg-[#f5e3d4]",
  "border-cup-cyan bg-cup-cyan/10",
  "border-cup-blue bg-cup-blue/8",
  "border-cup-magenta bg-cup-magenta/10",
  "border-cup-red bg-cup-red/8",
];

const positionIconStyles = [
  "bg-cup-yellow text-cup-navy",
  "bg-[#aebcc8] text-cup-navy",
  "bg-[#c47a43] text-white",
  "bg-cup-cyan text-white",
  "bg-cup-blue text-white",
  "bg-cup-magenta text-white",
  "bg-cup-red text-white",
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function PositionMark({ row }: { row: RankingRow }) {
  const className = cn(
    "flex size-9 shrink-0 items-center justify-center rounded-md text-xs font-bold",
    positionIconStyles[row.position - 1] ?? positionIconStyles[4],
  );

  if (row.position === 1) {
    return (
      <span className={className}>
        <Crown className="size-4" />
      </span>
    );
  }

  if (row.position <= 3) {
    return (
      <span className={className}>
        <Medal className="size-4" />
      </span>
    );
  }

  return <span className={className}>{getInitials(row.name)}</span>;
}

export function RankingTable({ rows }: { rows: RankingRow[] }) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Aún no hay participantes en el ranking.
      </div>
    );
  }

  const leaderPoints = rows[0]?.total_points ?? 0;

  return (
    <div className="overflow-hidden rounded-lg border border-cup-blue/20 bg-card shadow-[0_6px_18px_rgb(7_31_61_/_0.08)]">
      <div className="hidden grid-cols-[4rem_1fr_7rem_7rem_6rem] items-center border-b bg-cup-navy px-4 py-2 text-xs font-bold uppercase text-white/75 md:grid">
        <span>Puesto</span>
        <span>Participante</span>
        <span>Apodo</span>
        <span>Exactos</span>
        <span className="text-right">Puntos</span>
      </div>

      <div className="divide-y">
        {rows.map((row) => {
          const gap = Math.max(leaderPoints - row.total_points, 0);

          return (
            <div
              key={row.user_id}
              className={cn(
                "grid min-h-14 grid-cols-[2rem_2.75rem_minmax(0,1fr)_auto] items-center gap-2 border-l-4 px-2 py-2 md:grid-cols-[4rem_1fr_7rem_7rem_6rem] md:gap-0 md:px-4",
                positionStyles[row.position - 1] ?? positionStyles[4],
              )}
            >
              <span className="text-center text-sm font-black text-cup-blue md:text-left">
                #{row.position}
              </span>

              <div className="md:hidden">
                <PositionMark row={row} />
              </div>

              <div className="min-w-0 md:flex md:items-center md:gap-3">
                <div className="hidden md:block">
                  <PositionMark row={row} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold">{row.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground md:hidden">
                    {positionNicknames[row.position - 1] ?? "Estrategia secreta"}
                  </p>
                </div>
              </div>

              <p className="hidden truncate text-xs font-semibold text-cup-navy md:block">
                {positionNicknames[row.position - 1] ?? "Estrategia secreta"}
              </p>

              <p className="hidden text-sm text-muted-foreground md:block">
                {row.exact_count}
                {row.position > 1 ? ` · -${gap}` : " · líder"}
              </p>

              <div className="text-right">
                <p className="text-lg font-black text-cup-navy">{row.total_points}</p>
                <p className="text-[10px] font-bold uppercase text-muted-foreground">pts</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-center gap-2 border-t bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">
        <Trophy className="size-3.5 text-cup-yellow" />
        Todo puede cambiar en el siguiente partido.
      </div>
    </div>
  );
}
