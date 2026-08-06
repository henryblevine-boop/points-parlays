import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BetSlipCard } from "@/components/bet-slip-card";
import { PostComposer } from "@/components/post-composer";
import { CommentThread } from "@/components/comment-thread";
import {
  feedQuery,
  friendsQuery,
  leagueCoMembersQuery,
  profileQuery,
  type FeedItem,
} from "@/lib/data";
import { supabase } from "@/integrations/supabase/client";
import { deletePost } from "@/lib/posts.functions";
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

type FeedFilter = "all" | "friends" | "leagues";

function SocialPage() {
  const { user } = useSessionUser();
  const { data: profile } = useQuery({ ...profileQuery(user?.id ?? ""), enabled: !!user });
  const { data: posts, isLoading } = useQuery(feedQuery());
  const { data: friendIds } = useQuery({ ...friendsQuery(user?.id ?? ""), enabled: !!user });
  const { data: leagueMateIds } = useQuery({
    ...leagueCoMembersQuery(user?.id ?? ""),
    enabled: !!user,
  });
  const [filter, setFilter] = useState<FeedFilter>("all");
  const [openComments, setOpenComments] = useState<Set<string>>(new Set());
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

  const remove = useMutation({
    mutationFn: (postId: string) => deletePost({ data: { postId } }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["feed"] }),
  });

  function toggleComments(postId: string) {
    setOpenComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  }

  const visiblePosts = filterPosts(posts, filter, user?.id, friendIds, leagueMateIds);

  return (
    <div className="space-y-3">
      <h1 className="font-display text-xl font-extrabold">Social hub</h1>

      {user && <PostComposer profile={profile} />}

      <Tabs value={filter} onValueChange={(v) => setFilter(v as FeedFilter)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="friends">Friends</TabsTrigger>
          <TabsTrigger value="leagues">My Leagues</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && [0, 1, 2].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}

      {!isLoading && visiblePosts.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          {filter === "all"
            ? "Nothing here yet. Be the first to post."
            : "Nothing here yet from this group."}
        </p>
      )}

      {visiblePosts.map((post) => {
        const liked = post.post_likes.some((l) => l.user_id === user?.id);
        const commentsOpen = openComments.has(post.id);
        const isMine = post.user_id === user?.id;
        return (
          <article key={post.id} className="rounded-xl border border-border bg-card p-3">
            <header className="mb-2 flex items-center justify-between gap-2">
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
              {isMine && (
                <button
                  type="button"
                  onClick={() => remove.mutate(post.id)}
                  className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  aria-label="Delete post"
                >
                  <Trash2 className="size-3.5" />
                </button>
              )}
            </header>

            {post.body && <p className="mb-2 whitespace-pre-wrap text-sm">{post.body}</p>}
            {post.image_url && (
              <img
                src={post.image_url}
                alt=""
                className="mb-2 max-h-80 w-full rounded-lg border border-border object-cover"
              />
            )}
            {post.bets && <BetSlipCard bet={post.bets} compact />}

            <footer className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
              <button
                type="button"
                onClick={() => like.mutate({ postId: post.id, liked })}
                className={
                  liked ? "flex items-center gap-1 text-primary" : "flex items-center gap-1"
                }
                aria-label={liked ? "Unlike post" : "Like post"}
              >
                <Heart className={liked ? "size-4 fill-current" : "size-4"} aria-hidden />
                {post.post_likes.length}
              </button>
              <button
                type="button"
                onClick={() => toggleComments(post.id)}
                className="flex items-center gap-1"
                aria-label="Toggle replies"
              >
                <MessageCircle className="size-4" aria-hidden />
                {post.comments.length}
              </button>
            </footer>

            {commentsOpen && <CommentThread postId={post.id} />}
          </article>
        );
      })}
    </div>
  );
}

function filterPosts(
  posts: FeedItem[] | undefined,
  filter: FeedFilter,
  userId: string | undefined,
  friendIds: string[] | undefined,
  leagueMateIds: string[] | undefined,
): FeedItem[] {
  if (!posts) return [];
  if (filter === "all") return posts;
  if (filter === "friends") {
    const allowed = new Set([...(friendIds ?? []), userId]);
    return posts.filter((p) => allowed.has(p.user_id));
  }
  const allowed = new Set([...(leagueMateIds ?? []), userId]);
  return posts.filter((p) => allowed.has(p.user_id));
}
