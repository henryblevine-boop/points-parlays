alter table public.bets add column if not exists is_pinned boolean not null default false;

create unique index if not exists bets_one_pinned_per_user
  on public.bets (user_id) where is_pinned;

create policy "pinned_bets_public_read" on public.bets for select to authenticated
  using (is_pinned);