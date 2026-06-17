import Link from "next/link";
import { BarChart3, CalendarDays, Home, Shield, Trophy, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] | null;

export function MobileNav({ profile }: { profile: Profile }) {
  const items = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/matches", label: "Partidos", icon: CalendarDays },
    { href: "/ranking", label: "Ranking", icon: Trophy },
    { href: "/my-predictions", label: "Míos", icon: BarChart3 },
    profile?.role === "admin"
      ? { href: "/admin", label: "Admin", icon: Shield }
      : { href: "/profile", label: "Perfil", icon: UserRound },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur md:hidden">
      <div className="grid h-16 grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-medium text-muted-foreground",
                "active:bg-secondary",
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
