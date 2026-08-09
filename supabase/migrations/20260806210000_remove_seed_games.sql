-- Removes the original placeholder/demo games from the initial seed data.
-- Once refreshOdds is syncing real DraftKings lines, these fake matchups
-- shouldn't linger and be mistaken for real games -- especially for
-- out-of-season sports (NFL/NBA/NHL right now), where the home page should
-- honestly show "no games on the board" rather than a fabricated slate.
--
-- Matches the exact seeded matchups by team names; player_props and bet_legs
-- referencing these games cascade/null out via existing foreign keys.
delete from public.player_props
where game_id in (
  select id from public.games
  where (home_team, away_team) in (
    ('Kansas City Chiefs', 'Buffalo Bills'),
    ('San Francisco 49ers', 'Dallas Cowboys'),
    ('Philadelphia Eagles', 'Detroit Lions'),
    ('Boston Celtics', 'Denver Nuggets'),
    ('Los Angeles Lakers', 'Golden State Warriors'),
    ('Oklahoma City Thunder', 'Minnesota Timberwolves'),
    ('Los Angeles Dodgers', 'Atlanta Braves'),
    ('New York Yankees', 'Houston Astros'),
    ('Colorado Avalanche', 'Edmonton Oilers'),
    ('Florida Panthers', 'Toronto Maple Leafs')
  )
);

delete from public.games
where (home_team, away_team) in (
  ('Kansas City Chiefs', 'Buffalo Bills'),
  ('San Francisco 49ers', 'Dallas Cowboys'),
  ('Philadelphia Eagles', 'Detroit Lions'),
  ('Boston Celtics', 'Denver Nuggets'),
  ('Los Angeles Lakers', 'Golden State Warriors'),
  ('Oklahoma City Thunder', 'Minnesota Timberwolves'),
  ('Los Angeles Dodgers', 'Atlanta Braves'),
  ('New York Yankees', 'Houston Astros'),
  ('Colorado Avalanche', 'Edmonton Oilers'),
  ('Florida Panthers', 'Toronto Maple Leafs')
);
