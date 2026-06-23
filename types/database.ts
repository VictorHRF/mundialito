export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          avatar_url: string | null;
          role: "player" | "admin";
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          avatar_url?: string | null;
          role?: "player" | "admin";
          created_at?: string;
        };
        Update: {
          name?: string;
          avatar_url?: string | null;
          role?: "player" | "admin";
        };
        Relationships: [];
      };
      pools: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          owner_id: string | null;
          invite_code: string;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          owner_id?: string | null;
          invite_code: string;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["pools"]["Insert"]>;
        Relationships: [];
      };
      pool_members: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          display_name: string;
          total_points: number;
          joined_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          user_id: string;
          display_name: string;
          total_points?: number;
          joined_at?: string;
        };
        Update: {
          display_name?: string;
          total_points?: number;
        };
        Relationships: [];
      };
      teams: {
        Row: {
          id: string;
          name: string;
          code: string;
          flag_url: string | null;
          group_name: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          flag_url?: string | null;
          group_name?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["teams"]["Insert"]>;
        Relationships: [];
      };
      matches: {
        Row: {
          id: string;
          match_number: number | null;
          stage: string;
          group_name: string | null;
          home_team_id: string | null;
          away_team_id: string | null;
          home_placeholder: string | null;
          away_placeholder: string | null;
          home_score: number | null;
          away_score: number | null;
          match_date: string;
          stadium: string | null;
          status: "scheduled" | "live" | "finished";
          created_at: string;
        };
        Insert: {
          id?: string;
          match_number?: number | null;
          stage: string;
          group_name?: string | null;
          home_team_id?: string | null;
          away_team_id?: string | null;
          home_placeholder?: string | null;
          away_placeholder?: string | null;
          home_score?: number | null;
          away_score?: number | null;
          match_date: string;
          stadium?: string | null;
          status?: "scheduled" | "live" | "finished";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["matches"]["Insert"]>;
        Relationships: [];
      };
      predictions: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          match_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          predicted_winner_team_id: string | null;
          points_awarded: number;
          result_type: "exact" | "winner" | "difference" | "none" | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          user_id: string;
          match_id: string;
          predicted_home_score: number;
          predicted_away_score: number;
          predicted_winner_team_id?: string | null;
          points_awarded?: number;
          result_type?: "exact" | "winner" | "difference" | "none" | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          predicted_home_score?: number;
          predicted_away_score?: number;
          predicted_winner_team_id?: string | null;
          points_awarded?: number;
          result_type?: "exact" | "winner" | "difference" | "none" | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      daily_wildcards: {
        Row: {
          id: string;
          pool_id: string;
          user_id: string;
          match_id: string;
          match_day: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          pool_id: string;
          user_id: string;
          match_id: string;
          match_day: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          match_id?: string;
          match_day?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
