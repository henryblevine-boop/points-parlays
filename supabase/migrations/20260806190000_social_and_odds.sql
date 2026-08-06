-- Adds image/meme support to posts, and a public storage bucket for the
-- images. Also widens games/player_props timestamps for odds-refresh
-- bookkeeping.

ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url text;

ALTER TABLE public.games ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE public.player_props ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

-- Storage bucket for post images (memes, bet-slip screenshots, etc).
INSERT INTO storage.buckets (id, name, public)
VALUES ('post-images', 'post-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "post_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "post_images_insert_own" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images' AND owner = auth.uid());

CREATE POLICY "post_images_delete_own" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-images' AND owner = auth.uid());
