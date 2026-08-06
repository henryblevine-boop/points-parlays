import { supabase } from "@/integrations/supabase/client";

export type Game = {
  id: string;
  sport: string;
  league_label: string;
  home_team: string;
  away_team: string;
  home_abbr: string;
  away_abbr: string;
  start_time: string;
  status: string;
  spread_home: number;
  spread_home_odds: number;
  spread_away_odds: number;
  ml_home: number;
  ml_away: number;
  total_line: number;
  over_odds: number;
  under_odds: number;
  is_featured: boolean;
};

export type PlayerProp = {
  id: string;
  game_id: string;
  player_name: string;
  team_abbr: string;
  market: string;
  line: number;
  over_odds: number;
  under_odds: number;
  is_trending: boolean;
};

export type Profile = {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
};

export type BetLeg = {
  id: string;
  bet_id: string;
  market: string;
  selection: string;
  line: string | null;
  odds: number;
  matchup: string;
};

export type Bet = {
  id: string;
  user_id: string;
  league_id: string | null;
  bet_type: string;
  combined_odds: number;
  status: string;
  points_delta: number;
  week_start: string;
  placed_at: string;
  settled_at: string | null;
  bet_legs: BetLeg[];
};

export type League = {
  id: string;
  name: string;
  invite_code: string;
  commissioner_id: string;
  weekly_bet_limit: number;
  created_at: string;
};

export const gamesQuery = () => ({
  queryKey: ["games"],
  queryFn: async (): Promise<Game[]> => {
    const { data, error } = await supabase
      .from("games")
      .select("*")
      .order("start_time", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Game[];
  },
});

export const gameQuery = (gameId: string) => ({
  queryKey: ["game", gameId],
  queryFn: async (): Promise<Game | null> => {
    const { data, error } = await supabase.from("games").select("*").eq("id", gameId).maybeSingle();
    if (error) throw error;
    return data as Game | null;
  },
});

export const propsQuery = (gameId?: string) => ({
  queryKey: ["props", gameId ?? "all"],
  queryFn: async (): Promise<PlayerProp[]> => {
    let q = supabase.from("player_props").select("*").order("player_name");
    if (gameId) q = q.eq("game_id", gameId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as PlayerProp[];
  },
});

export const profilesQuery = () => ({
  queryKey: ["profiles"],
  queryFn: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, bio")
      .order("username");
    if (error) throw error;
    return (data ?? []) as Profile[];
  },
});

export const profileQuery = (userId: string) => ({
  queryKey: ["profile", userId],
  queryFn: async (): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, bio")
      .eq("id", userId)
      .maybeSingle();
    if (error) throw error;
    return data as Profile | null;
  },
});

export const betsQuery = (opts: { userId?: string; leagueId?: string } = {}) => ({
  queryKey: ["bets", opts.userId ?? "all", opts.leagueId ?? "all"],
  queryFn: async (): Promise<Bet[]> => {
    let q = supabase
      .from("bets")
      .select("*, bet_legs(*)")
      .order("placed_at", { ascending: false });
    if (opts.userId) q = q.eq("user_id", opts.userId);
    if (opts.leagueId) q = q.eq("league_id", opts.leagueId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as Bet[];
  },
});

export const myLeaguesQuery = (userId: string) => ({
  queryKey: ["my-leagues", userId],
  queryFn: async () => {
    const { data: memberships, error } = await supabase
      .from("league_members")
      .select("league_id")
      .eq("user_id", userId);
    if (error) throw error;
    const ids = (memberships ?? []).map((m) => m.league_id);
    if (ids.length === 0) return [] as League[];
    const { data: leagues, error: lErr } = await supabase
      .from("leagues")
      .select("*")
      .in("id", ids)
      .order("created_at");
    if (lErr) throw lErr;
    return (leagues ?? []) as League[];
  },
});

export const leagueQuery = (leagueId: string) => ({
  queryKey: ["league", leagueId],
  queryFn: async (): Promise<League | null> => {
    const { data, error } = await supabase
      .from("leagues")
      .select("*")
      .eq("id", leagueId)
      .maybeSingle();
    if (error) throw error;
    return data as League | null;
  },
});

export const leagueMembersQuery = (leagueId: string) => ({
  queryKey: ["league-members", leagueId],
  queryFn: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from("league_members")
      .select("user_id")
      .eq("league_id", leagueId);
    if (error) throw error;
    return (data ?? []).map((m) => m.user_id);
  },
});

export type FeedPost = {
  id: string;
  user_id: string;
  content: string;
  bet_id: string | null;
  created_at: string;
};

export const postsQuery = () => ({
  queryKey: ["posts"],
  queryFn: async (): Promise<FeedPost[]> => {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []) as FeedPost[];
  },
});

export const likesQuery = () => ({
  queryKey: ["post-likes"],
  queryFn: async () => {
    const { data, error } = await supabase.from("post_likes").select("post_id, user_id");
    if (error) throw error;
    return data ?? [];
  },
});

export const commentsQuery = (postId: string) => ({
  queryKey: ["comments", postId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", postId)
      .order("created_at");
    if (error) throw error;
    return data ?? [];
  },
});

export const commentCountsQuery = () => ({
  queryKey: ["comment-counts"],
  queryFn: async () => {
    const { data, error } = await supabase.from("comments").select("post_id");
    if (error) throw error;
    return data ?? [];
  },
});

export const friendsQuery = (userId: string) => ({
  queryKey: ["friends", userId],
  queryFn: async (): Promise<string[]> => {
    const { data, error } = await supabase
      .from("friendships")
      .select("friend_id")
      .eq("user_id", userId);
    if (error) throw error;
    return (data ?? []).map((f) => f.friend_id);
  },
});
