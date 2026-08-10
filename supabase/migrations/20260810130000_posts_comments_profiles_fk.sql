-- posts.user_id and comments.user_id reference auth.users, but the app
-- queries them with an embedded `profiles(username, avatar_url)` join to
-- show the poster's name/avatar. PostgREST can't resolve that embed without
-- a direct foreign key between the two tables, so every feed/comment fetch
-- was failing with PGRST200 ("no relationship found") -- silently unnoticed
-- until posts could actually be created.
--
-- Every user_id here is already guaranteed to have a matching profiles row
-- (profiles are created on first authenticated page load, before a user can
-- post or comment), so this is safe to add directly.

alter table public.posts
  add constraint posts_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;

alter table public.comments
  add constraint comments_user_id_profiles_fkey
  foreign key (user_id) references public.profiles (id) on delete cascade;
