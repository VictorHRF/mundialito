"use server";

import { revalidatePath } from "next/cache";
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { getSupabasePublishableKey, getSupabaseUrl } from "@/lib/supabase/env";
import { calculatePoints } from "@/lib/scoring";
import { isPredictionLocked } from "@/lib/utils";
import { matchResultSchema, predictionSchema } from "@/lib/validations/prediction-schema";
import type { Database } from "@/types/database";
import {
  getCurrentUser,
  getProfile,
} from "@/lib/actions/queries";
import type { User } from "@supabase/supabase-js";

export type MutationState = {
  ok: boolean;
  message: string;
};

type TypedSupabase = SupabaseClient<Database, "public">;

function createTokenClient(accessToken: string): TypedSupabase {
  return createSupabaseClient<Database, "public">(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    },
  );
}

async function getAuthenticatedClient(formData: FormData) {
  const cookieClient = await createClient();
  const cookieUser = await getCurrentUser();

  if (cookieUser) {
    return { supabase: cookieClient, user: cookieUser };
  }

  const accessToken = String(formData.get("accessToken") ?? "");
  if (!accessToken) return { supabase: cookieClient, user: null };

  const tokenClient = createTokenClient(accessToken);
  const {
    data: { user },
  } = await tokenClient.auth.getUser(accessToken);

  return { supabase: tokenClient, user };
}

async function ensureProfileForClient(supabase: TypedSupabase, user: User) {
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

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
  return data;
}

async function ensurePoolMembershipForClient(supabase: TypedSupabase, user: User) {
  const profile = await ensureProfileForClient(supabase, user);
  if (!profile) return null;

  const { data: pool } = await supabase
    .from("pools")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!pool) return null;

  const { error } = await supabase.from("pool_members").upsert(
    {
      pool_id: pool.id,
      user_id: user.id,
      display_name: profile.name,
    },
    { onConflict: "pool_id,user_id" },
  );

  if (error) return null;
  return pool;
}

export async function savePrediction(
  _state: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const parsed = predictionSchema.safeParse({
    matchId: formData.get("matchId"),
    predictedHomeScore: formData.get("predictedHomeScore"),
    predictedAwayScore: formData.get("predictedAwayScore"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Pronóstico inválido." };
  }

  const { supabase, user } = await getAuthenticatedClient(formData);
  const pool = user ? await ensurePoolMembershipForClient(supabase, user) : null;
  if (!user || !pool) {
    return {
      ok: false,
      message:
        "Inicia sesión para pronosticar. Si ya iniciaste sesión, recarga la página e intenta de nuevo.",
    };
  }

  const { data: match } = await supabase
    .from("matches")
    .select("id, match_date, home_team_id, away_team_id")
    .eq("id", parsed.data.matchId)
    .single();

  if (!match) return { ok: false, message: "No encontramos el partido." };

  if (isPredictionLocked(match.match_date)) {
    return { ok: false, message: "Este pronóstico ya está bloqueado porque el partido inició." };
  }

  const predictedWinnerTeamId =
    parsed.data.predictedHomeScore > parsed.data.predictedAwayScore
      ? match.home_team_id
      : parsed.data.predictedAwayScore > parsed.data.predictedHomeScore
        ? match.away_team_id
        : null;

  const { error } = await supabase.from("predictions").upsert(
    {
      pool_id: pool.id,
      user_id: user.id,
      match_id: parsed.data.matchId,
      predicted_home_score: parsed.data.predictedHomeScore,
      predicted_away_score: parsed.data.predictedAwayScore,
      predicted_winner_team_id: predictedWinnerTeamId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "pool_id,user_id,match_id" },
  );

  if (error) {
    return {
      ok: false,
      message: `No pudimos guardar el pronóstico: ${error.message}`,
    };
  }

  revalidatePath("/matches");
  revalidatePath(`/matches/${parsed.data.matchId}`);
  revalidatePath("/my-predictions");
  return { ok: true, message: "Pronóstico guardado." };
}

export async function updateMatchResult(
  _state: MutationState,
  formData: FormData,
): Promise<MutationState> {
  const parsed = matchResultSchema.safeParse({
    matchId: formData.get("matchId"),
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Resultado inválido." };
  }

  const profile = await getProfile();
  if (profile?.role !== "admin") {
    return { ok: false, message: "Solo un admin puede cargar resultados." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("matches")
    .update({
      home_score: parsed.data.homeScore,
      away_score: parsed.data.awayScore,
      status: "finished",
    })
    .eq("id", parsed.data.matchId);

  if (error) return { ok: false, message: "No pudimos actualizar el resultado." };

  const recalculation = await recalculateMatchPoints(parsed.data.matchId);
  if (!recalculation.ok) {
    return {
      ok: false,
      message: `Resultado guardado, pero falló el recálculo: ${recalculation.message}`,
    };
  }

  revalidatePath("/admin");
  revalidatePath("/ranking");
  revalidatePath("/my-predictions");
  revalidatePath("/predictions");
  revalidatePath("/dashboard");
  revalidatePath("/matches");
  return { ok: true, message: "Resultado guardado y puntos recalculados." };
}

export async function recalculateMatchPoints(matchId: string): Promise<MutationState> {
  const supabase = await createClient();
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select("id, stage, home_score, away_score")
    .eq("id", matchId)
    .single();

  if (matchError || !match) {
    return {
      ok: false,
      message: matchError?.message ?? "No encontramos el partido.",
    };
  }

  if (match.home_score === null || match.away_score === null) {
    return { ok: false, message: "El partido todavía no tiene resultado completo." };
  }

  const { data: predictions, error: predictionsError } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId);

  if (predictionsError) {
    return { ok: false, message: predictionsError.message };
  }

  for (const prediction of predictions ?? []) {
    const result = calculatePoints({
      homeScore: match.home_score,
      awayScore: match.away_score,
      predictedHomeScore: prediction.predicted_home_score,
      predictedAwayScore: prediction.predicted_away_score,
      stage: match.stage,
    });

    const { error: updatePredictionError } = await supabase
      .from("predictions")
      .update({
        points_awarded: result.points,
        result_type: result.resultType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", prediction.id)
      .select("id")
      .single();

    if (updatePredictionError) {
      return {
        ok: false,
        message: `No se pudo actualizar un pronóstico: ${updatePredictionError.message}`,
      };
    }
  }

  const poolIds = Array.from(new Set((predictions ?? []).map((prediction) => prediction.pool_id)));

  for (const poolId of poolIds) {
    const { data: members, error: membersError } = await supabase
      .from("pool_members")
      .select("user_id")
      .eq("pool_id", poolId);

    if (membersError) {
      return { ok: false, message: membersError.message };
    }

    for (const member of members ?? []) {
      const { data: userPredictions, error: totalsError } = await supabase
        .from("predictions")
        .select("points_awarded")
        .eq("pool_id", poolId)
        .eq("user_id", member.user_id);

      if (totalsError) {
        return { ok: false, message: totalsError.message };
      }

      const total = (userPredictions ?? []).reduce(
        (sum, prediction) => sum + prediction.points_awarded,
        0,
      );

      const { error: memberUpdateError } = await supabase
        .from("pool_members")
        .update({ total_points: total })
        .eq("pool_id", poolId)
        .eq("user_id", member.user_id)
        .select("id")
        .single();

      if (memberUpdateError) {
        return {
          ok: false,
          message: `No se pudo actualizar el ranking: ${memberUpdateError.message}`,
        };
      }
    }
  }

  return {
    ok: true,
    message: `${predictions?.length ?? 0} pronósticos recalculados.`,
  };
}
