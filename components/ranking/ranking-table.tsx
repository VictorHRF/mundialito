import { Medal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RankingRow } from "@/types/ranking";

export function RankingTable({ rows }: { rows: RankingRow[] }) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border bg-card p-8 text-center text-muted-foreground">
        Aún no hay participantes en el ranking.
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-lg border bg-card md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Posición</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Puntos</TableHead>
              <TableHead>Exactos</TableHead>
              <TableHead>Ganadores</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.user_id}>
                <TableCell className="font-semibold">#{row.position}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell className="font-bold">{row.total_points}</TableCell>
                <TableCell>{row.exact_count}</TableCell>
                <TableCell>{row.winner_count}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <Card key={row.user_id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Medal className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">#{row.position} {row.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {row.exact_count} exactos · {row.winner_count} ganadores
                  </p>
                </div>
              </div>
              <Badge>{row.total_points} pts</Badge>
            </CardContent>
          </Card>
        ))}
      </div>
    </>
  );
}
