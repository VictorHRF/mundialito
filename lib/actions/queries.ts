"use server";

import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";
import type { MatchWithTeams } from "@/types/match";
import type { Prediction, PredictionWithMatch } from "@/types/prediction";
import type { RankingRow } from "@/types/ranking";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Pool = Database["public"]["Tables"]["pools"]["Row"];

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data as Profile | null;
}

export async function ensureProfile(): Promise<Profile | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const existing = await getProfile();
  if (existing) return existing;

  const fallbackName =
    typeof user.user_metadata?.name === "string" && user.user_metadata.name.length > 0
      ? user.user_metadata.name
      : user.email?.split("@")[0] ?? "Participante";

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      id: user.id,
      name: fallbackName,
      role: "player",
    })
    .select("*")
    .single();

  if (error) return null;

  return data as Profile | null;
}

export async function getActivePool(): Promise<Pool | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("pools")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  return data as Pool | null;
}

export async function ensurePoolMembership(): Promise<Pool | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  if (!user) return null;

  const [profile, pool] = await Promise.all([ensureProfile(), getActivePool()]);
  if (!pool) return null;

  const { error } = await supabase.from("pool_members").upsert(
    {
      pool_id: pool.id,
      user_id: user.id,
      display_name: profile?.name ?? user.email ?? "Participante",
    },
    { onConflict: "pool_id,user_id" },
  );

  if (error) return null;

  return pool;
}

const matchSelect =
  "*, home_team:teams!matches_home_team_id_fkey(*), away_team:teams!matches_away_team_id_fkey(*)";

export async function getMatches(): Promise<MatchWithTeams[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const pool = user ? await ensurePoolMembership() : null;

  const { data, error } = await supabase
    .from("matches")
    .select(matchSelect)
    .order("match_date", { ascending: true });

  if (error || !data) return [];

  if (!user || !pool) return data as unknown as MatchWithTeams[];

  const { data: predictions } = await supabase
    .from("predictions")
    .select("id, match_id, predicted_home_score, predicted_away_score, points_awarded")
    .eq("user_id", user.id)
    .eq("pool_id", pool.id);

  const byMatch = new Map((predictions ?? []).map((prediction) => [prediction.match_id, prediction]));

  return (data as unknown as MatchWithTeams[]).map((match) => ({
    ...match,
    user_prediction: byMatch.get(match.id) ?? null,
  }));
}

export async function getMatchById(id: string): Promise<MatchWithTeams | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("matches")
    .select(matchSelect)
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as unknown as MatchWithTeams;
}

export async function getUserPrediction(matchId: string): Promise<Prediction | null> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const pool = user ? await ensurePoolMembership() : null;
  if (!user || !pool) return null;

  const { data } = await supabase
    .from("predictions")
    .select("*")
    .eq("user_id", user.id)
    .eq("pool_id", pool.id)
    .eq("match_id", matchId)
    .maybeSingle();

  return data as Prediction | null;
}

export async function getUserPredictions(): Promise<PredictionWithMatch[]> {
  const supabase = await createClient();
  const user = await getCurrentUser();
  const pool = user ? await ensurePoolMembership() : null;
  if (!user || !pool) return [];

  const { data, error } = await supabase
    .from("predictions")
    .select(`*, match:matches(${matchSelect})`)
    .eq("user_id", user.id)
    .eq("pool_id", pool.id)
    .order("updated_at", { ascending: false });

  if (error || !data) return [];
  return data as unknown as PredictionWithMatch[];
}

export async function getRanking(): Promise<RankingRow[]> {
  const supabase = await createClient();
  const pool = await ensurePoolMembership();
  if (!pool) return [];

  const { data: members } = await supabase
    .from("pool_members")
    .select("user_id, display_name, total_points")
    .eq("pool_id", pool.id)
    .order("total_points", { ascending: false });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, avatar_url")
    .in("id", (members ?? []).map((member) => member.user_id));

  const { data: stats } = await supabase
    .from("predictions")
    .select("user_id, result_type")
    .eq("pool_id", pool.id);

  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const statMap = new Map<string, { exact: number; winner: number }>();

  for (const stat of stats ?? []) {
    const current = statMap.get(stat.user_id) ?? { exact: 0, winner: 0 };
    if (stat.result_type === "exact") current.exact += 1;
    if (
      stat.result_type === "winner" ||
      stat.result_type === "difference" ||
      stat.result_type === "exact"
    ) {
      current.winner += 1;
    }
    statMap.set(stat.user_id, current);
  }

  return (members ?? []).map((member, index) => {
    const profile = profileMap.get(member.user_id);
    const counts = statMap.get(member.user_id) ?? { exact: 0, winner: 0 };

    return {
      user_id: member.user_id,
      name: profile?.name ?? member.display_name,
      avatar_url: profile?.avatar_url ?? null,
      total_points: member.total_points,
      exact_count: counts.exact,
      winner_count: counts.winner,
      position: index + 1,
    };
  });
}
