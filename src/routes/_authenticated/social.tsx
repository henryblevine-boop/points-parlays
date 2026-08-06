import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { BetSlipCard } from "@/components/bet-slip-card";
import { feedQuery } from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { useSessionUser } from "@/hooks/use-session-user";

export const Route = createFileRoute("/_authenticated/social")({
  head: () => ({
    meta: [
      { title: "Social Hub — ParlayPals" },
      {
        name: "description",
        content: "See what your leaguemates are betting, react to their slips and talk trash.",
      },
      { property: "og:title", content: "Social Hub — ParlayPals" },
      {
        property: "og:description",
        content: "See what your leaguemates are betting and react to their slips.",
      },
    ],
  }),
  component: SocialPage,
});

function SocialPage() {
  const { user } = useSessionUser();
  const { data: posts, isLoading } = useQuery(feedQuery());
  const queryClient = useQueryClient();

  const like = useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      if (!user) throw new Error("Sign in first");
      if (liked) {
        await supabase.from("post_likes").delete().eq("post_id", postId).eq("user_id", user.id);
      } else {
        await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  return (
    <div className="space-y-3">
      <h1 className="font-display text-xl font-extrabold">Social hub</h1>

      {isLoading &&
        [0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}

      {posts?.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          Nothing here yet. Place a bet in a league and it shows up in the feed.
        </p>
      )}

      {posts?.map((post) => {
        const liked = post.post_likes.some((l) => l.user_id === user?.id);
        return (
          <article key={post.id} className="rounded-xl border border-border bg-card p-3">
            <header className="mb-2 flex items-center gap-2">
              <Link
                to="/profile/$userId"
                params={{ userId: post.user_id }}
                className="flex min-w-0 items-center gap-2"
              >
                <Avatar className="size-8">
                  <AvatarImage src={post.profiles?.avatar_url ?? undefined} alt="" />
                  <AvatarFallback>
                    {(post.profiles?.username ?? "??").slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold">
                    {post.profiles?.username ?? "Member"}
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {new Date(post.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </Link>
            </header>

            {post.body && <p className="mb-2 text-sm">{post.body}</p>}
            {post.bets && <BetSlipCard bet={post.bets} compact />}

            <footer className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => like.mutate({ postId: post.id, liked })}
                className={liked ? "flex items-center gap-1 text-primary" : "flex items-center gap-1"}
                aria-label={liked ? "Unlike post" : "Like post"}
              >
                <Heart className={liked ? "size-4 fill-current" : "size-4"} aria-hidden />
                {post.post_likes.length}
              </button>
              <span className="flex items-center gap-1">
                <MessageCircle className="size-4" aria-hidden />
                {post.comments.length}
              </span>
            </footer>
          </article>
        );
      })}
    </div>
  );
}
