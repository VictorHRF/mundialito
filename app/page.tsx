import Link from "next/link";
import { CheckCircle2, Medal, PenLine, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  { icon: PenLine, title: "Registra tus pronósticos" },
  { icon: CheckCircle2, title: "Gana puntos por aciertos" },
  { icon: Medal, title: "Compite en el ranking familiar" },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,rgba(190,146,47,0.24),transparent_28%),radial-gradient(circle_at_85%_20%,rgba(179,35,45,0.16),transparent_24%),linear-gradient(135deg,#fbfbf7,#eef7f0)]">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10">
        <div className="max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Trophy className="size-7" />
            </span>
            <span className="text-2xl font-bold">Mundialito</span>
          </div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-normal text-foreground sm:text-6xl">
            La quiniela familiar para vivir el Mundial 2026
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
            Pronostica marcadores, celebra aciertos y lleva un ranking claro para toda la familia.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Crear cuenta</Link>
            </Button>
          </div>
        </div>
        <div className="mt-14 grid gap-3 sm:grid-cols-3">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-lg border bg-card p-5 shadow-sm">
                <div className="mb-4 flex size-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </div>
                <p className="text-sm font-semibold text-muted-foreground">Paso {index + 1}</p>
                <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
