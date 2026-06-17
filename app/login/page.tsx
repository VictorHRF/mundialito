import Link from "next/link";
import { Trophy } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(23,119,78,0.22),transparent_36%),linear-gradient(135deg,#fafaf7,#f5f0e6)] px-4 py-10">
      <Link href="/" className="mb-8 flex items-center gap-2 text-lg font-semibold">
        <span className="flex size-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Trophy className="size-5" />
        </span>
        Mundialito
      </Link>
      <AuthForm />
    </main>
  );
}
