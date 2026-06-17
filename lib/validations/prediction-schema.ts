import { z } from "zod";

export const predictionSchema = z.object({
  matchId: z.string().uuid(),
  predictedHomeScore: z.coerce
    .number()
    .int("Usa números enteros.")
    .min(0, "No se permiten goles negativos."),
  predictedAwayScore: z.coerce
    .number()
    .int("Usa números enteros.")
    .min(0, "No se permiten goles negativos."),
});

export const matchResultSchema = z.object({
  matchId: z.string().uuid(),
  homeScore: z.coerce.number().int().min(0, "No se permiten goles negativos."),
  awayScore: z.coerce.number().int().min(0, "No se permiten goles negativos."),
});

export type PredictionInput = z.infer<typeof predictionSchema>;
export type MatchResultInput = z.infer<typeof matchResultSchema>;
