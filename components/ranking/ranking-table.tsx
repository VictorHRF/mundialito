import type { LucideIcon } from "lucide-react";
import {
  Award,
  Crown,
  Crosshair,
  Handshake,
  Medal,
  ShieldQuestion,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { RankingRow } from "@/types/ranking";

type SpecialBadge = {
  label: string;
  icon: LucideIcon;
  className: string;
};

const positionNicknames = [
  "El Oráculo del VAR",
  "A un rebote del liderato",
  "Medalla en revisión",
  "Zona de repechaje emocional",
  "La remontada empieza mañana",
  "Confía en el proceso",
  "Ministro de la Cuchara de Madera",
];

const positionStyles = [
  {
    border: "border-cup-yellow",
    surface: "bg-cup-yellow/15",
    icon: "bg-cup-yellow text-cup-navy",
  },
  {
    border: "border-[#aebcc8]",
    surface: "bg-[#e8eef2]",
    icon: "bg-[#aebcc8] text-cup-navy",
  },
  {
    border: "border-[#c47a43]",
    surface: "bg-[#f5e3d4]",
    icon: "bg-[#c47a43] text-white",
  },
  {
    border: "border-cup-cyan",
    surface: "bg-cup-cyan/10",
    icon: "bg-cup-cyan text-white",
  },
  {
    border: "border-cup-blue",
    surface: "bg-cup-blue/8",
    icon: "bg-cup-blue text-white",
  },
  {
    border: "border-cup-magenta",
    surface: "bg-cup-magenta/10",
    icon: "bg-cup-magenta text-white",
  },
  {
    border: "border-cup-red",
    surface: "bg-cup-red/8",
    icon: "bg-cup-red text-white",
  },
];

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getSpecialBadges(rows: RankingRow[], row: RankingRow): SpecialBadge[] {
  const max = (selector: (item: RankingRow) => number) =>
    Math.max(...rows.map(selector), 0);
  const badges: SpecialBadge[] = [];

  if (row.exact_count > 0 && row.exact_count === max((item) => item.exact_count)) {
    badges.push({
      label: "Francotirador",
      icon: Target,
      className: "bg-cup-red text-white",
    });
  }

  if (
    row.wildcard_points > 0 &&
    row.wildcard_points === max((item) => item.wildcard_points)
  ) {
    badges.push({
      label: "Comodín de oro",
      icon: Sparkles,
      className: "bg-cup-yellow text-cup-navy",
    });
  }

  if (row.winner_count > 0 && row.winner_count === max((item) => item.winner_count)) {
    badges.push({
      label: "Oráculo familiar",
      icon: Crosshair,
      className: "bg-cup-blue text-white",
    });
  }

  if (
    row.difference_count > 0 &&
    row.difference_count === max((item) => item.difference_count)
  ) {
    badges.push({
      label: "Casi exacto",
      icon: Award,
      className: "bg-cup-cyan text-white",
    });
  }

  if (
    row.draw_prediction_count > 0 &&
    row.draw_prediction_count === max((item) => item.draw_prediction_count)
  ) {
    badges.push({
      label: "Embajador del empate",
      icon: Handshake,
      className: "bg-cup-green text-white",
    });
  }

  if (row.miss_count > 0 && row.miss_count === max((item) => item.miss_count)) {
    badges.push({
      label: "VAR en contra",
      icon: ShieldQuestion,
      className: "bg-cup-magenta text-white",
    });
  }

  if (row.position === rows.length && row.exact_count > 0) {
    badges.unshift({
      label: "Cuchara premium",
      icon: Medal,
      className: "bg-cup-navy text-white",
    });
  }

  return badges.slice(0, 2);
}

function RankingCard({
  row,
  rows,
  leaderPoints,
  podium = false,
}: {
  row: RankingRow;
  rows: RankingRow[];
  leaderPoints: number;
  podium?: boolean;
}) {
  const style = positionStyles[row.position - 1] ?? positionStyles[4];
  const badges = getSpecialBadges(rows, row);
  const gap = Math.max(leaderPoints - row.total_points, 0);
  const progress =
    leaderPoints > 0 ? Math.max((row.total_points / leaderPoints) * 100, 4) : 100;

  return (
    <Card
      className={cn(
        "overflow-hidden border-t-4",
        style.border,
        podium && row.position === 1 && "md:-translate-y-5",
      )}
    >
      <div className={cn("h-2", style.surface)} />
      <CardContent className={cn("p-4", podium && "md:p-5")}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "flex size-11 shrink-0 items-center justify-center rounded-md font-bold",
                style.icon,
                podium && "md:size-14",
              )}
            >
              {row.position === 1 ? (
                <Crown className={podium ? "size-7" : "size-5"} />
              ) : row.position <= 3 ? (
                <Medal className={podium ? "size-7" : "size-5"} />
              ) : (
                getInitials(row.name)
              )}
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase text-cup-blue">Puesto {row.position}</p>
              <h2 className={cn("truncate font-bold", podium ? "text-xl" : "text-base")}>
                {row.name}
              </h2>
            </div>
          </div>
          <Badge variant={row.position === 1 ? "gold" : "default"}>
            {row.total_points} pts
          </Badge>
        </div>

        <p className="mt-4 font-semibold text-cup-navy">
          {positionNicknames[row.position - 1] ?? "Estrategia en construcción"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          {row.position === 1
            ? "Defendiendo el liderato con revisión incluida."
            : `A ${gap} ${gap === 1 ? "punto" : "puntos"} del líder.`}
        </p>

        <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn("h-full rounded-full", row.position === 1 ? "bg-cup-yellow" : "bg-cup-blue")}
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-xs text-muted-foreground">
          <span>{row.exact_count} exactos</span>
          <span>·</span>
          <span>{row.winner_count} resultados</span>
          {row.wildcard_points > 0 ? (
            <>
              <span>·</span>
              <span>+{row.wildcard_points} por comodín</span>
            </>
          ) : null}
        </div>

        {badges.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <span
                  key={badge.label}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-bold",
                    badge.className,
                  )}
                >
                  <Icon className="size-3.5" />
                  {badge.label}
                </span>
              );
            })}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
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
  const podiumOrder = [rows[1], rows[0], rows[2]].filter(
    (row): row is RankingRow => Boolean(row),
  );
  const battleRows = rows.slice(3);

  return (
    <div className="space-y-8">
      <section>
        <div className="mb-7 hidden items-end justify-center gap-4 md:grid md:grid-cols-3">
          {podiumOrder.map((row) => (
            <RankingCard
              key={row.user_id}
              row={row}
              rows={rows}
              leaderPoints={leaderPoints}
              podium
            />
          ))}
        </div>

        <div className="grid gap-3 md:hidden">
          {rows.map((row) => (
            <RankingCard
              key={row.user_id}
              row={row}
              rows={rows}
              leaderPoints={leaderPoints}
            />
          ))}
        </div>
      </section>

      {battleRows.length ? (
        <section className="hidden md:block">
          <div className="mb-3 flex items-center gap-2">
            <Trophy className="size-5 text-cup-magenta" />
            <h2 className="text-lg font-bold">Zona de batalla familiar</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {battleRows.map((row) => (
              <RankingCard
                key={row.user_id}
                row={row}
                rows={rows}
                leaderPoints={leaderPoints}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
