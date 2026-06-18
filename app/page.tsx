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
    <main className="relative min-h-screen overflow-hidden bg-cup-navy text-white">
      <div className="absolute inset-y-0 right-0 hidden w-[34%] grid-cols-4 lg:grid">
        <span className="bg-cup-blue" />
        <span className="bg-cup-cyan" />
        <span className="bg-cup-magenta" />
        <span className="bg-cup-red" />
      </div>
      <div className="cup-color-bar absolute inset-x-0 top-0" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <section className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-12">
        <div className="max-w-3xl lg:max-w-2xl">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-12 items-center justify-center rounded-lg bg-cup-lime text-cup-navy">
              <Trophy className="size-7" />
            </span>
            <span className="text-2xl font-bold">Mundialito</span>
          </div>
          <h1 className="max-w-2xl text-4xl font-bold tracking-normal text-white sm:text-6xl">
            La quiniela familiar para vivir el Mundial 2026
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/72 sm:text-lg">
            Pronostica marcadores, celebra aciertos y lleva un ranking claro para toda la familia.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/login">Iniciar sesión</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white bg-transparent text-white hover:bg-white hover:text-cup-navy">
              <Link href="/login">Crear cuenta</Link>
            </Button>
          </div>
        </div>
        <div className="mt-14 grid gap-3 sm:grid-cols-3 lg:max-w-4xl">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="rounded-lg border border-white/18 bg-white p-5 text-cup-navy shadow-lg">
                <div className={`mb-4 flex size-10 items-center justify-center rounded-md ${
                  index === 0
                    ? "bg-cup-cyan text-white"
                    : index === 1
                      ? "bg-cup-yellow text-cup-navy"
                      : "bg-cup-magenta text-white"
                }`}>
                  <Icon className="size-5" />
                </div>
                <p className="text-sm font-semibold text-cup-blue">Paso {index + 1}</p>
                <h2 className="mt-1 text-lg font-semibold">{step.title}</h2>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
