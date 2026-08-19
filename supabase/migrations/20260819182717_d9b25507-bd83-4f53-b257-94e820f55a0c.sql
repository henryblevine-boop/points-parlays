alter table public.leagues add column if not exists is_public boolean not null default false;
alter table public.leagues add column if not exists description text;

-- Anyone signed in can see who is in a public league (member counts + standings).
drop policy if exists "members_select_public" on public.league_members;
create policy "members_select_public" on public.league_members for select to authenticated
  using (exists (select 1 from public.leagues l where l.id = league_members.league_id and l.is_public));

-- Bets placed in a public league are visible to everyone signed in so public
-- league standings and feeds work for solo users.
drop policy if exists "bets_select_public_league" on public.bets;
create policy "bets_select_public_league" on public.bets for select to authenticated
  using (league_id is not null and exists (select 1 from public.leagues l where l.id = bets.league_id and l.is_public));