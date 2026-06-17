import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProfile } from "@/lib/actions/queries";
import { LogoutButton } from "@/components/logout-button";

export default async function ProfilePage() {
  const profile = await getProfile();

  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">Perfil</p>
        <h1 className="text-2xl font-bold tracking-normal md:text-3xl">Mi cuenta</h1>
      </div>
      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>{profile?.name ?? "Participante"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">Rol: {profile?.role ?? "player"}</p>
          <LogoutButton />
        </CardContent>
      </Card>
    </AppShell>
  );
}
