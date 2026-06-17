import type { Database } from "@/types/database";

export type Team = Database["public"]["Tables"]["teams"]["Row"];
export type Match = Database["public"]["Tables"]["matches"]["Row"];
export type MatchWithTeams = Match & {
  home_team: Team | null;
  away_team: Team | null;
  user_prediction?: {
    id: string;
    predicted_home_score: number;
    predicted_away_score: number;
    points_awarded: number;
  } | null;
};
