import type { Database } from "@/types/database";
import type { MatchWithTeams } from "@/types/match";

export type Prediction = Database["public"]["Tables"]["predictions"]["Row"];
export type PredictionWithMatch = Prediction & {
  match: MatchWithTeams;
};
