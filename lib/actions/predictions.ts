"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { calculatePoints } from "@/lib/scoring";
import { isPredictionLocked } from "@/lib/utils";
import { matchResultSchema, predictionSchema } from "@/lib/validations/prediction-schema";
import { ensurePoolMembership, getCurrentUser, getProfile } from "@/lib/actions/queries";

export type MutationState = {
  ok: boolean;
  message: string;
};

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

  const supabase = await createClient();
  const user = await getCurrentUser();
  const pool = user ? await ensurePoolMembership() : null;
  if (!user || !pool) return { ok: false, message: "Inicia sesión para pronosticar." };

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

  if (error) return { ok: false, message: "No pudimos guardar el pronóstico." };

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

  await recalculateMatchPoints(parsed.data.matchId);
  revalidatePath("/", "layout");
  return { ok: true, message: "Resultado guardado y puntos recalculados." };
}

export async function recalculateMatchPoints(matchId: string) {
  const supabase = await createClient();
  const { data: match } = await supabase
    .from("matches")
    .select("id, stage, home_score, away_score")
    .eq("id", matchId)
    .single();

  if (!match || match.home_score === null || match.away_score === null) return;

  const { data: predictions } = await supabase
    .from("predictions")
    .select("*")
    .eq("match_id", matchId);

  for (const prediction of predictions ?? []) {
    const result = calculatePoints({
      homeScore: match.home_score,
      awayScore: match.away_score,
      predictedHomeScore: prediction.predicted_home_score,
      predictedAwayScore: prediction.predicted_away_score,
      stage: match.stage,
    });

    await supabase
      .from("predictions")
      .update({
        points_awarded: result.points,
        result_type: result.resultType,
        updated_at: new Date().toISOString(),
      })
      .eq("id", prediction.id);
  }

  const poolIds = Array.from(new Set((predictions ?? []).map((prediction) => prediction.pool_id)));

  for (const poolId of poolIds) {
    const { data: members } = await supabase
      .from("pool_members")
      .select("user_id")
      .eq("pool_id", poolId);

    for (const member of members ?? []) {
      const { data: userPredictions } = await supabase
        .from("predictions")
        .select("points_awarded")
        .eq("pool_id", poolId)
        .eq("user_id", member.user_id);

      const total = (userPredictions ?? []).reduce(
        (sum, prediction) => sum + prediction.points_awarded,
        0,
      );

      await supabase
        .from("pool_members")
        .update({ total_points: total })
        .eq("pool_id", poolId)
        .eq("user_id", member.user_id);
    }
  }
}
