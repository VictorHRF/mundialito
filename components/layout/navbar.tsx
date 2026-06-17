import Link from "next/link";
import { Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserMenu } from "@/components/layout/user-menu";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] | null;

const navItems = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/matches", label: "Partidos" },
  { href: "/my-predictions", label: "Pronósticos" },
  { href: "/ranking", label: "Ranking" },
];

export function Navbar({ profile }: { profile: Profile }) {
  return (
    <header className="sticky top-0 z-40 hidden border-b bg-background/95 backdrop-blur md:block">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Trophy className="size-5" />
          </span>
          Mundialito
        </Link>
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Button key={item.href} asChild variant="ghost">
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
          {profile?.role === "admin" ? (
            <Button asChild variant="ghost">
              <Link href="/admin">Admin</Link>
            </Button>
          ) : null}
        </nav>
        <UserMenu profile={profile} />
      </div>
    </header>
  );
}
