-- helpers
CREATE OR REPLACE FUNCTION public.week_start(_ts timestamptz DEFAULT now())
RETURNS date LANGUAGE sql IMMUTABLE AS $$ SELECT (date_trunc('week', _ts))::date $$;

-- profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  avatar_url text,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- games
CREATE TABLE public.games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sport text NOT NULL,
  league_label text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  home_abbr text NOT NULL,
  away_abbr text NOT NULL,
  start_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'scheduled',
  spread_home numeric NOT NULL,
  spread_home_odds int NOT NULL DEFAULT -110,
  spread_away_odds int NOT NULL DEFAULT -110,
  ml_home int NOT NULL,
  ml_away int NOT NULL,
  total_line numeric NOT NULL,
  over_odds int NOT NULL DEFAULT -110,
  under_odds int NOT NULL DEFAULT -110,
  is_featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.games TO anon, authenticated;
GRANT ALL ON public.games TO service_role;
ALTER TABLE public.games ENABLE ROW LEVEL SECURITY;
CREATE POLICY "games_public_read" ON public.games FOR SELECT TO anon, authenticated USING (true);

-- player props
CREATE TABLE public.player_props (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id uuid NOT NULL REFERENCES public.games ON DELETE CASCADE,
  player_name text NOT NULL,
  team_abbr text NOT NULL,
  market text NOT NULL,
  line numeric NOT NULL,
  over_odds int NOT NULL DEFAULT -110,
  under_odds int NOT NULL DEFAULT -110,
  is_trending boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.player_props TO anon, authenticated;
GRANT ALL ON public.player_props TO service_role;
ALTER TABLE public.player_props ENABLE ROW LEVEL SECURITY;
CREATE POLICY "props_public_read" ON public.player_props FOR SELECT TO anon, authenticated USING (true);

-- leagues
CREATE TABLE public.leagues (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  invite_code text NOT NULL UNIQUE,
  commissioner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  weekly_bet_limit int NOT NULL DEFAULT 5,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.leagues TO authenticated;
GRANT ALL ON public.leagues TO service_role;
ALTER TABLE public.leagues ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.league_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id uuid NOT NULL REFERENCES public.leagues ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (league_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.league_members TO authenticated;
GRANT ALL ON public.league_members TO service_role;
ALTER TABLE public.league_members ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_league_member(_league_id uuid, _user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.league_members WHERE league_id = _league_id AND user_id = _user_id)
$$;

CREATE POLICY "leagues_select" ON public.leagues FOR SELECT TO authenticated USING (true);
CREATE POLICY "leagues_insert" ON public.leagues FOR INSERT TO authenticated WITH CHECK (auth.uid() = commissioner_id);
CREATE POLICY "leagues_update_commissioner" ON public.leagues FOR UPDATE TO authenticated USING (auth.uid() = commissioner_id) WITH CHECK (auth.uid() = commissioner_id);

CREATE POLICY "members_select" ON public.league_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_league_member(league_id, auth.uid()));
CREATE POLICY "members_insert_own" ON public.league_members FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "members_delete_own" ON public.league_members FOR DELETE TO authenticated USING (user_id = auth.uid());

-- bets
CREATE TABLE public.bets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  league_id uuid REFERENCES public.leagues ON DELETE SET NULL,
  bet_type text NOT NULL DEFAULT 'straight',
  combined_odds int NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  points_delta int NOT NULL DEFAULT 0,
  week_start date NOT NULL DEFAULT public.week_start(),
  placed_at timestamptz NOT NULL DEFAULT now(),
  settled_at timestamptz
);
GRANT SELECT, INSERT, UPDATE ON public.bets TO authenticated;
GRANT ALL ON public.bets TO service_role;
ALTER TABLE public.bets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bets_select" ON public.bets FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR (league_id IS NOT NULL AND public.is_league_member(league_id, auth.uid())));
CREATE POLICY "bets_insert_own" ON public.bets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "bets_update_own" ON public.bets FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE TABLE public.bet_legs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bet_id uuid NOT NULL REFERENCES public.bets ON DELETE CASCADE,
  game_id uuid REFERENCES public.games ON DELETE SET NULL,
  prop_id uuid REFERENCES public.player_props ON DELETE SET NULL,
  market text NOT NULL,
  selection text NOT NULL,
  line text,
  odds int NOT NULL,
  matchup text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.bet_legs TO authenticated;
GRANT ALL ON public.bet_legs TO service_role;
ALTER TABLE public.bet_legs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "legs_select" ON public.bet_legs FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.bets b WHERE b.id = bet_id));
CREATE POLICY "legs_insert" ON public.bet_legs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.bets b WHERE b.id = bet_id AND b.user_id = auth.uid()));

-- social
CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content text NOT NULL,
  bet_id uuid REFERENCES public.bets ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_select" ON public.posts FOR SELECT TO authenticated USING (true);
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.post_likes (
  post_id uuid NOT NULL REFERENCES public.posts ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, user_id)
);
GRANT SELECT, INSERT, DELETE ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO service_role;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "likes_select" ON public.post_likes FOR SELECT TO authenticated USING (true);
CREATE POLICY "likes_insert_own" ON public.post_likes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "likes_delete_own" ON public.post_likes FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_select" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "comments_insert_own" ON public.comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "comments_delete_own" ON public.comments FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.friendships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  friend_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, friend_id)
);
GRANT SELECT, INSERT, DELETE ON public.friendships TO authenticated;
GRANT ALL ON public.friendships TO service_role;
ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
CREATE POLICY "friends_select" ON public.friendships FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR friend_id = auth.uid());
CREATE POLICY "friends_insert_own" ON public.friendships FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "friends_delete_own" ON public.friendships FOR DELETE TO authenticated USING (user_id = auth.uid());

-- demo slate
INSERT INTO public.games (sport, league_label, home_team, away_team, home_abbr, away_abbr, start_time, spread_home, ml_home, ml_away, total_line, is_featured) VALUES
('NFL','NFL','Kansas City Chiefs','Buffalo Bills','KC','BUF', now() + interval '6 hours', -2.5, -145, 125, 48.5, true),
('NFL','NFL','San Francisco 49ers','Dallas Cowboys','SF','DAL', now() + interval '1 day', -3.5, -180, 155, 45.5, true),
('NFL','NFL','Philadelphia Eagles','Detroit Lions','PHI','DET', now() + interval '2 days', -1.5, -120, 100, 51.5, false),
('NBA','NBA','Boston Celtics','Denver Nuggets','BOS','DEN', now() + interval '5 hours', -4.5, -190, 165, 224.5, true),
('NBA','NBA','Los Angeles Lakers','Golden State Warriors','LAL','GSW', now() + interval '8 hours', 1.5, 110, -130, 232.5, true),
('NBA','NBA','Oklahoma City Thunder','Minnesota Timberwolves','OKC','MIN', now() + interval '1 day 3 hours', -6.5, -260, 215, 219.5, false),
('MLB','MLB','Los Angeles Dodgers','Atlanta Braves','LAD','ATL', now() + interval '7 hours', -1.5, -155, 135, 8.5, false),
('MLB','MLB','New York Yankees','Houston Astros','NYY','HOU', now() + interval '1 day 1 hour', -1.5, -135, 115, 9.0, false),
('NHL','NHL','Colorado Avalanche','Edmonton Oilers','COL','EDM', now() + interval '9 hours', -1.5, -125, 105, 6.5, false),
('NHL','NHL','Florida Panthers','Toronto Maple Leafs','FLA','TOR', now() + interval '1 day 5 hours', -1.5, -140, 120, 6.0, false);

INSERT INTO public.player_props (game_id, player_name, team_abbr, market, line, over_odds, under_odds, is_trending)
SELECT g.id, v.player, v.team, v.market, v.line, v.oo, v.uo, v.trend FROM public.games g
JOIN (VALUES
  ('KC','Patrick Mahomes','KC','Passing Yards',274.5,-115,-105,true),
  ('KC','Travis Kelce','KC','Receiving Yards',68.5,-110,-110,true),
  ('KC','Josh Allen','BUF','Passing Yards',259.5,-110,-110,false),
  ('SF','Christian McCaffrey','SF','Rushing Yards',89.5,-120,100,true),
  ('SF','CeeDee Lamb','DAL','Receptions',6.5,-135,115,false),
  ('BOS','Jayson Tatum','BOS','Points',27.5,-110,-110,true),
  ('BOS','Nikola Jokic','DEN','Rebounds',12.5,-115,-105,true),
  ('LAL','LeBron James','LAL','Points',24.5,-105,-115,false),
  ('LAL','Stephen Curry','GSW','Three Pointers Made',4.5,105,-125,true),
  ('OKC','Shai Gilgeous-Alexander','OKC','Points',31.5,-110,-110,false),
  ('LAD','Shohei Ohtani','LAD','Total Bases',1.5,-140,120,true),
  ('NYY','Aaron Judge','NYY','Home Runs',0.5,175,-215,false),
  ('COL','Nathan MacKinnon','COL','Shots On Goal',4.5,-125,105,false),
  ('FLA','Auston Matthews','TOR','Points',0.5,-160,135,false)
) AS v(home_abbr, player, team, market, line, oo, uo, trend) ON g.home_abbr = v.home_abbr;