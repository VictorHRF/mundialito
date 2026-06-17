export type RankingRow = {
  user_id: string;
  name: string;
  avatar_url: string | null;
  total_points: number;
  exact_count: number;
  winner_count: number;
  position: number;
};
