import { redirect } from "next/navigation";
import { ShieldAlert } from "lucide-react";
import { AdminMatchResultForm } from "@/components/admin/admin-match-result-form";
import { AppShell } from "@/components/layout/app-shell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getMatches, getProfile } from "@/lib/actions/queries";

export default async function AdminPage() {
  const [profile, matches] = await Promise.all([getProfile(), getMatches()]);

  if (!profile) redirect("/login");

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">Admin</p>
        <h1 className="text-2xl font-bold tracking-normal md:text-3xl">Resultados</h1>
      </div>
      {profile.role !== "admin" ? (
        <Alert variant="destructive">
          <ShieldAlert className="size-4" />
          <AlertTitle>Acceso restringido</AlertTitle>
          <AlertDescription>Solo usuarios admin pueden actualizar resultados.</AlertDescription>
        </Alert>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {matches.map((match) => (
            <AdminMatchResultForm key={match.id} match={match} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
