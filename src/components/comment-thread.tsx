import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { commentsQuery } from "@/lib/data";
import { createComment } from "@/lib/posts.functions";
import { useSessionUser } from "@/hooks/use-session-user";

export function CommentThread({ postId }: { postId: string }) {
  const { user } = useSessionUser();
  const queryClient = useQueryClient();
  const { data: comments, isLoading } = useQuery(commentsQuery(postId));
  const [draft, setDraft] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      return createComment({ data: { postId, content: draft.trim() } });
    },
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't reply."),
  });

  return (
    <div className="mt-2 space-y-2 border-t border-border pt-2">
      {isLoading && <p className="text-xs text-muted-foreground">Loading replies…</p>}
      {comments?.length === 0 && (
        <p className="text-xs text-muted-foreground">No replies yet — be the first.</p>
      )}
      {comments?.map((c) => (
        <div key={c.id} className="flex items-start gap-2">
          <Avatar className="size-6 shrink-0">
            <AvatarImage src={c.profiles?.avatar_url ?? undefined} alt="" />
            <AvatarFallback className="text-[10px]">
              {(c.profiles?.username ?? "??").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 rounded-lg bg-muted px-2.5 py-1.5">
            <p className="text-xs font-bold">{c.profiles?.username ?? "Member"}</p>
            <p className="break-words text-xs">{c.content}</p>
          </div>
        </div>
      ))}

      {user && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim().length === 0) return;
            submit.mutate();
          }}
          className="flex items-center gap-2 pt-1"
        >
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Reply…"
            maxLength={280}
            className="min-w-0 flex-1 rounded-full border border-border bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={draft.trim().length === 0 || submit.isPending}
            className="flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-40"
          >
            {submit.isPending && <Loader2 className="size-3 animate-spin" />}
            Reply
          </button>
        </form>
      )}
    </div>
  );
}
