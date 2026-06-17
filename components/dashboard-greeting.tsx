"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function DashboardGreeting({ fallbackName }: { fallbackName?: string | null }) {
  const [name, setName] = useState(fallbackName ?? "familia");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      const user = data.user;
      if (!user) return;

      const metadataName =
        typeof user.user_metadata?.name === "string" ? user.user_metadata.name : null;
      const fallback = metadataName ?? user.email?.split("@")[0] ?? "familia";

      const { data: profile } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", user.id)
        .maybeSingle();

      setName(profile?.name ?? fallback);
    });
  }, []);

  return (
    <h1 className="text-2xl font-bold tracking-normal md:text-3xl">
      Hola, {name}
    </h1>
  );
}
