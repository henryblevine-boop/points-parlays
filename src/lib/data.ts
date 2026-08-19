import { supabase } from "@/integrations/supabase/client";
import { untyped } from "@/integrations/supabase/untyped";

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
  ml_draw: number | null;
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
  game_id: string | null;
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
  is_pinned: boolean;
  bet_legs: BetLeg[];
};

export type League = {
  id: string;
  name: string;
  invite_code: string;
  commissioner_id: string;
  weekly_bet_limit: number;
  created_at: string;
  is_public?: boolean;
  description?: string | null;
};

export const gamesQuery = (leagueLabel?: string) => ({
  queryKey: ["games", leagueLabel ?? "all"],
  queryFn: async (): Promise<Game[]> => {
    let q = supabase.from("games").select("*").order("start_time", { ascending: true });
    if (leagueLabel) q = q.eq("league_label", leagueLabel);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as unknown as Game[];
  },
});

export const gameQuery = (gameId: string) => ({
  queryKey: ["game", gameId],
  queryFn: async (): Promise<Game | null> => {
    const { data, error } = await supabase.from("games").select("*").eq("id", gameId).maybeSingle();
    if (error) throw error;
    return data as unknown as Game | null;
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
    let q = supabase.from("bets").select("*, bet_legs(*)").order("placed_at", { ascending: false });
    if (opts.userId) q = q.eq("user_id", opts.userId);
    if (opts.leagueId) q = q.eq("league_id", opts.leagueId);
    const { data, error } = await q;
    if (error) throw error;
    return (data ?? []) as unknown as Bet[];
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
  image_url: string | null;
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

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { username: string; avatar_url: string | null } | null;
};

export const commentsQuery = (postId: string) => ({
  queryKey: ["comments", postId],
  queryFn: async (): Promise<Comment[]> => {
    const { data, error } = await supabase
      .from("comments")
      .select("*, profiles(username, avatar_url)")
      .eq("post_id", postId)
      .order("created_at");
    if (error) throw error;
    return (data ?? []) as unknown as Comment[];
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

export type PropWithGame = PlayerProp & {
  games: { home_abbr: string; away_abbr: string; start_time: string } | null;
};

export const trendingPropsQuery = (limit = 12) => ({
  queryKey: ["trending-props", limit],
  queryFn: async (): Promise<PropWithGame[]> => {
    const { data, error } = await supabase
      .from("player_props")
      .select("*, games(home_abbr, away_abbr, start_time)")
      .order("is_trending", { ascending: false })
      .order("player_name")
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as unknown as PropWithGame[];
  },
});

export const searchProfilesQuery = (term: string) => ({
  queryKey: ["profiles", "search", term],
  enabled: term.length >= 2,
  queryFn: async (): Promise<Profile[]> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, bio")
      .ilike("username", `%${term}%`)
      .order("username")
      .limit(25);
    if (error) throw error;
    return (data ?? []) as Profile[];
  },
});

export type FeedItem = {
  id: string;
  user_id: string;
  body: string | null;
  bet_id: string | null;
  image_url: string | null;
  created_at: string;
  profiles: { username: string; avatar_url: string | null } | null;
  bets: Bet | null;
  post_likes: { user_id: string }[];
  comments: { id: string }[];
};

export const feedQuery = () => ({
  queryKey: ["feed"],
  queryFn: async (): Promise<FeedItem[]> => {
    const { data, error } = await supabase
      .from("posts")
      .select(
        "id, user_id, content, bet_id, image_url, created_at, profiles(username, avatar_url), bets(*, bet_legs(*)), post_likes(user_id), comments(id)",
      )
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    return ((data ?? []) as unknown as (Omit<FeedItem, "body"> & { content: string | null })[]).map(
      ({ content, ...rest }) => ({ ...rest, body: content }),
    );
  },
});

// All user_ids who share at least one league with `userId` (excluding self).
// Used for the "My Leagues" feed filter.
export const leagueCoMembersQuery = (userId: string) => ({
  queryKey: ["league-co-members", userId],
  queryFn: async (): Promise<string[]> => {
    const { data: memberships, error } = await supabase
      .from("league_members")
      .select("league_id")
      .eq("user_id", userId);
    if (error) throw error;
    const leagueIds = (memberships ?? []).map((m) => m.league_id);
    if (leagueIds.length === 0) return [];

    const { data: members, error: mErr } = await supabase
      .from("league_members")
      .select("user_id")
      .in("league_id", leagueIds);
    if (mErr) throw mErr;
    return Array.from(new Set((members ?? []).map((m) => m.user_id))).filter((id) => id !== userId);
  },
});

export type FuturesMarket = {
  id: string;
  sport: string;
  league_label: string;
  title: string;
  selection: string;
  odds: number;
};

export const futuresQuery = () => ({
  queryKey: ["futures"],
  queryFn: async (): Promise<FuturesMarket[]> => {
    const { data, error } = await untyped(supabase)
      .from("futures_markets")
      .select("*")
      .order("league_label")
      .order("title")
      .order("odds", { ascending: true });
    if (error) throw error;
    return (data ?? []) as FuturesMarket[];
  },
});

export type PublicLeague = League & { memberCount: number };

/** Open leagues anyone can join — the landing spot for solo users. */
export const publicLeaguesQuery = () => ({
  queryKey: ["public-leagues"],
  queryFn: async (): Promise<PublicLeague[]> => {
    const { data, error } = await untyped(supabase)
      .from("leagues")
      .select("*")
      .eq("is_public", true)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) throw error;
    const leagues = (data ?? []) as League[];
    if (leagues.length === 0) return [];
    const { data: members, error: mErr } = await supabase
      .from("league_members")
      .select("league_id")
      .in(
        "league_id",
        leagues.map((l) => l.id),
      );
    if (mErr) throw mErr;
    const counts = new Map<string, number>();
    for (const m of members ?? []) counts.set(m.league_id, (counts.get(m.league_id) ?? 0) + 1);
    return leagues.map((l) => ({ ...l, memberCount: counts.get(l.id) ?? 0 }));
  },
});

/** Games referenced by the legs of live (pending) bets, for sweat tracking. */
export const gamesByIdsQuery = (ids: string[]) => ({
  queryKey: ["games-by-ids", [...ids].sort().join(",")],
  enabled: ids.length > 0,
  refetchInterval: 60_000,
  queryFn: async (): Promise<Game[]> => {
    if (ids.length === 0) return [];
    const { data, error } = await supabase.from("games").select("*").in("id", ids);
    if (error) throw error;
    return (data ?? []) as unknown as Game[];
  },
});
