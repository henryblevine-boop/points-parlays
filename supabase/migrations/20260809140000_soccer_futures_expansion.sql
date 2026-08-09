-- Adds support for:
-- 1. Soccer's 3-way moneyline (Home / Draw / Away) via a new nullable
--    ml_draw column -- other sports just leave it null.
-- 2. Futures/outright markets (season-long bets not tied to a single game,
--    e.g. "Chiefs to win Super Bowl"), which don't fit the games table.

alter table public.games add column if not exists ml_draw int;

create table if not exists public.futures_markets (
  id uuid primary key default gen_random_uuid(),
  sport text not null,
  league_label text not null,
  title text not null,        -- e.g. "Super Bowl Winner", "La Liga Winner"
  selection text not null,    -- e.g. "Kansas City Chiefs"
  odds int not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.futures_markets to anon, authenticated;
grant all on public.futures_markets to service_role;
alter table public.futures_markets enable row level security;
create policy "futures_public_read" on public.futures_markets for select to anon, authenticated using (true);

create index if not exists futures_markets_league_idx on public.futures_markets (league_label);
create unique index if not exists futures_markets_unique_pick
  on public.futures_markets (league_label, title, selection);

-- Lets player props be upserted cleanly on refresh instead of duplicating.
create unique index if not exists player_props_unique_pick
  on public.player_props (game_id, player_name, market);

-- The odds API's per-event props payload doesn't include the player's team,
-- so this can't always be filled in.
alter table public.player_props alter column team_abbr drop not null;
