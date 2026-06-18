import Link from "next/link";
import { Trophy } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cup-navy px-4 py-10 text-white">
      <div className="cup-color-bar absolute inset-x-0 top-0" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="absolute bottom-0 left-0 h-3 w-1/3 bg-cup-green" />
      <div className="absolute bottom-0 left-1/3 h-3 w-1/3 bg-cup-yellow" />
      <div className="absolute bottom-0 right-0 h-3 w-1/3 bg-cup-magenta" />
      <Link href="/" className="relative mb-8 flex items-center gap-2 text-lg font-semibold">
        <span className="flex size-10 items-center justify-center rounded-md bg-cup-lime text-cup-navy">
          <Trophy className="size-5" />
        </span>
        Mundialito
      </Link>
      <AuthForm />
    </main>
  );
}
