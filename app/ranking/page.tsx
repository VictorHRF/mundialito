import { AppShell } from "@/components/layout/app-shell";
import { RankingTable } from "@/components/ranking/ranking-table";
import { getRanking } from "@/lib/actions/queries";

export default async function RankingPage() {
  const ranking = await getRanking();

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-bold text-cup-blue">Ranking</p>
        <h1 className="text-2xl font-bold tracking-normal md:text-3xl">
          La batalla familiar
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Podio, apodos y reconocimientos completamente serios avalados por nadie.
        </p>
      </div>
      <RankingTable rows={ranking} />
    </AppShell>
  );
}
