import { AppShell } from "@/components/layout/app-shell";
import { RankingTable } from "@/components/ranking/ranking-table";
import { getRanking } from "@/lib/actions/queries";

export default async function RankingPage() {
  const ranking = await getRanking();

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">Ranking</p>
        <h1 className="text-2xl font-bold tracking-normal md:text-3xl">Tabla familiar</h1>
      </div>
      <RankingTable rows={ranking} />
    </AppShell>
  );
}
