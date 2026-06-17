"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type LogoutButtonProps = ButtonProps & {
  showIcon?: boolean;
};

export function LogoutButton({
  children = "Cerrar sesión",
  className,
  variant = "outline",
  showIcon = true,
  ...props
}: LogoutButtonProps) {
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    const supabase = createClient();
    await supabase.auth.signOut({ scope: "local" });
    fetch("/auth/signout", { method: "POST", keepalive: true }).catch(() => null);

    for (const key of Object.keys(localStorage)) {
      if (key.startsWith("sb-") || key.toLowerCase().includes("supabase")) {
        localStorage.removeItem(key);
      }
    }

    for (const key of Object.keys(sessionStorage)) {
      if (key.startsWith("sb-") || key.toLowerCase().includes("supabase")) {
        sessionStorage.removeItem(key);
      }
    }

    document.cookie.split(";").forEach((cookie) => {
      const name = cookie.split("=")[0]?.trim();
      if (name?.startsWith("sb-")) {
        document.cookie = `${name}=; Max-Age=0; path=/`;
      }
    });

    window.location.href = "/";
  }

  return (
    <Button
      type="button"
      variant={variant}
      className={cn("justify-start", className)}
      disabled={pending}
      onClick={handleLogout}
      {...props}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : showIcon ? (
        <LogOut className="size-4" />
      ) : null}
      {children}
    </Button>
  );
}
