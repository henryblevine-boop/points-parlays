import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { untyped } from "@/integrations/supabase/untyped";

const createPostSchema = z.object({
  content: z.string().trim().min(1).max(280),
  imageUrl: z.string().url().nullable().optional(),
});

export const createPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createPostSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: post, error } = await untyped(supabase)
      .from("posts")
      .insert({
        user_id: userId,
        content: data.content,
        image_url: data.imageUrl ?? null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: post.id };
  });

export const deletePost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => z.object({ postId: z.string().uuid() }).parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { error } = await supabase
      .from("posts")
      .delete()
      .eq("id", data.postId)
      .eq("user_id", userId);
    if (error) throw new Error(error.message);
    return { ok: true };
  });

const createCommentSchema = z.object({
  postId: z.string().uuid(),
  content: z.string().trim().min(1).max(280),
});

export const createComment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => createCommentSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({ post_id: data.postId, user_id: userId, content: data.content })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: comment.id };
  });
