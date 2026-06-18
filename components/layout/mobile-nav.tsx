import Link from "next/link";
import { BarChart3, CalendarDays, Home, Shield, Trophy, UserRound, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] | null;

export function MobileNav({ profile }: { profile: Profile }) {
  const items = [
    { href: "/dashboard", label: "Inicio", icon: Home },
    { href: "/matches", label: "Partidos", icon: CalendarDays },
    { href: "/ranking", label: "Ranking", icon: Trophy },
    { href: "/my-predictions", label: "Míos", icon: BarChart3 },
    { href: "/predictions", label: "Todos", icon: Users },
    profile?.role === "admin"
      ? { href: "/admin", label: "Admin", icon: Shield }
      : { href: "/profile", label: "Perfil", icon: UserRound },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-cup-navy text-white shadow-[0_-6px_20px_rgb(7_31_61_/_0.22)] md:hidden">
      <div className="grid h-16 grid-cols-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-[11px] font-semibold text-white/75",
                "active:bg-cup-blue active:text-white",
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
