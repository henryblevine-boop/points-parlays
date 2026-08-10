-- Lets a user pin one bet to their profile as a featured pick (like
-- Instagram's profile highlight). Only one pin per user at a time.
alter table public.bets add column if not exists is_pinned boolean not null default false;

create unique index if not exists bets_one_pinned_per_user
  on public.bets (user_id) where is_pinned;

-- A pinned bet is meant to be shown on a public profile, so it needs to be
-- visible beyond the normal "own bets or shared-league bets" rule.
create policy "pinned_bets_public_read" on public.bets for select to authenticated
  using (is_pinned);
