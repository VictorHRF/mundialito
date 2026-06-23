export type RankingRow = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  total_points: number;
  exact_count: number;
  winner_count: number;
  difference_count: number;
  miss_count: number;
  draw_prediction_count: number;
  wildcard_points: number;
  position: number;
};
