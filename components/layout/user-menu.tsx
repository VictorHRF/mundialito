"use client";

import Link from "next/link";
import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Database } from "@/types/database";

type Profile = Database["public"]["Tables"]["profiles"]["Row"] | null;

export function UserMenu({ profile }: { profile: Profile }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline">
          <UserRound className="size-4" />
          {profile?.name ?? "Perfil"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/profile">Mi perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
          <LogoutButton className="h-auto w-full border-0 bg-transparent px-0 py-0 text-popover-foreground shadow-none hover:bg-transparent" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
