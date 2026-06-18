import { AppShell } from "@/components/layout/app-shell";
import { AllPredictionsList } from "@/components/predictions/all-predictions-list";

export default function PredictionsPage() {
  return (
    <AppShell>
      <div className="mb-6">
        <p className="text-sm font-semibold text-primary">Pronósticos</p>
        <h1 className="text-2xl font-bold tracking-normal md:text-3xl">
          Pronósticos de participantes
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Consulta los marcadores registrados por todos los integrantes del Mundialito.
        </p>
      </div>
      <AllPredictionsList />
    </AppShell>
  );
}
