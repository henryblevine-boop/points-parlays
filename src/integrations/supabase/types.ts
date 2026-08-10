export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      bet_legs: {
        Row: {
          bet_id: string
          created_at: string
          game_id: string | null
          id: string
          line: string | null
          market: string
          matchup: string
          odds: number
          prop_id: string | null
          selection: string
        }
        Insert: {
          bet_id: string
          created_at?: string
          game_id?: string | null
          id?: string
          line?: string | null
          market: string
          matchup: string
          odds: number
          prop_id?: string | null
          selection: string
        }
        Update: {
          bet_id?: string
          created_at?: string
          game_id?: string | null
          id?: string
          line?: string | null
          market?: string
          matchup?: string
          odds?: number
          prop_id?: string | null
          selection?: string
        }
        Relationships: [
          {
            foreignKeyName: "bet_legs_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bet_legs_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bet_legs_prop_id_fkey"
            columns: ["prop_id"]
            isOneToOne: false
            referencedRelation: "player_props"
            referencedColumns: ["id"]
          },
        ]
      }
      bets: {
        Row: {
          bet_type: string
          combined_odds: number
          id: string
          league_id: string | null
          placed_at: string
          points_delta: number
          settled_at: string | null
          status: string
          user_id: string
          week_start: string
        }
        Insert: {
          bet_type?: string
          combined_odds: number
          id?: string
          league_id?: string | null
          placed_at?: string
          points_delta?: number
          settled_at?: string | null
          status?: string
          user_id: string
          week_start?: string
        }
        Update: {
          bet_type?: string
          combined_odds?: number
          id?: string
          league_id?: string | null
          placed_at?: string
          points_delta?: number
          settled_at?: string | null
          status?: string
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "bets_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          created_at: string
          friend_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          friend_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          friend_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      futures_markets: {
        Row: {
          created_at: string
          id: string
          league_label: string
          odds: number
          selection: string
          sport: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          league_label: string
          odds: number
          selection: string
          sport: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          league_label?: string
          odds?: number
          selection?: string
          sport?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      games: {
        Row: {
          away_abbr: string
          away_team: string
          created_at: string
          home_abbr: string
          home_team: string
          id: string
          is_featured: boolean
          league_label: string
          ml_away: number
          ml_draw: number | null
          ml_home: number
          over_odds: number
          sport: string
          spread_away_odds: number
          spread_home: number
          spread_home_odds: number
          start_time: string
          status: string
          total_line: number
          under_odds: number
          updated_at: string
        }
        Insert: {
          away_abbr: string
          away_team: string
          created_at?: string
          home_abbr: string
          home_team: string
          id?: string
          is_featured?: boolean
          league_label: string
          ml_away: number
          ml_draw?: number | null
          ml_home: number
          over_odds?: number
          sport: string
          spread_away_odds?: number
          spread_home: number
          spread_home_odds?: number
          start_time: string
          status?: string
          total_line: number
          under_odds?: number
          updated_at?: string
        }
        Update: {
          away_abbr?: string
          away_team?: string
          created_at?: string
          home_abbr?: string
          home_team?: string
          id?: string
          is_featured?: boolean
          league_label?: string
          ml_away?: number
          ml_draw?: number | null
          ml_home?: number
          over_odds?: number
          sport?: string
          spread_away_odds?: number
          spread_home?: number
          spread_home_odds?: number
          start_time?: string
          status?: string
          total_line?: number
          under_odds?: number
          updated_at?: string
        }
        Relationships: []
      }
      league_members: {
        Row: {
          id: string
          joined_at: string
          league_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          league_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          league_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          commissioner_id: string
          created_at: string
          id: string
          invite_code: string
          name: string
          weekly_bet_limit: number
        }
        Insert: {
          commissioner_id: string
          created_at?: string
          id?: string
          invite_code: string
          name: string
          weekly_bet_limit?: number
        }
        Update: {
          commissioner_id?: string
          created_at?: string
          id?: string
          invite_code?: string
          name?: string
          weekly_bet_limit?: number
        }
        Relationships: []
      }
      player_props: {
        Row: {
          created_at: string
          game_id: string
          id: string
          is_trending: boolean
          line: number
          market: string
          over_odds: number
          player_name: string
          team_abbr: string | null
          under_odds: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          game_id: string
          id?: string
          is_trending?: boolean
          line: number
          market: string
          over_odds?: number
          player_name: string
          team_abbr?: string | null
          under_odds?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          game_id?: string
          id?: string
          is_trending?: boolean
          line?: number
          market?: string
          over_odds?: number
          player_name?: string
          team_abbr?: string | null
          under_odds?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_props_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          created_at: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          bet_id: string | null
          content: string
          created_at: string
          id: string
          image_url: string | null
          user_id: string
        }
        Insert: {
          bet_id?: string | null
          content: string
          created_at?: string
          id?: string
          image_url?: string | null
          user_id: string
        }
        Update: {
          bet_id?: string | null
          content?: string
          created_at?: string
          id?: string
          image_url?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_bet_id_fkey"
            columns: ["bet_id"]
            isOneToOne: false
            referencedRelation: "bets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          id?: string
          username?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_league_member: {
        Args: { _league_id: string; _user_id: string }
        Returns: boolean
      }
      week_start: { Args: { _ts?: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
