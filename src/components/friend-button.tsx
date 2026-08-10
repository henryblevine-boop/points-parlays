import { UserPlus, UserCheck } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { friendsQuery } from "@/lib/data";
import { useSessionUser } from "@/hooks/use-session-user";

export function FriendButton({ targetUserId }: { targetUserId: string }) {
  const { user } = useSessionUser();
  const queryClient = useQueryClient();
  const { data: friendIds = [] } = useQuery({
    ...friendsQuery(user?.id ?? ""),
    enabled: Boolean(user),
  });
  const isFriend = friendIds.includes(targetUserId);

  const toggle = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      if (isFriend) {
        const { error } = await supabase
          .from("friendships")
          .delete()
          .eq("user_id", user.id)
          .eq("friend_id", targetUserId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("friendships")
          .insert({ user_id: user.id, friend_id: targetUserId });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["friends", user?.id] });
      toast.success(isFriend ? "Removed friend" : "Added friend");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Something went wrong."),
  });

  if (!user || user.id === targetUserId) return null;

  return (
    <Button
      size="sm"
      variant={isFriend ? "outline" : "default"}
      disabled={toggle.isPending}
      onClick={() => toggle.mutate()}
      className="gap-1.5"
    >
      {isFriend ? (
        <UserCheck className="size-3.5" aria-hidden />
      ) : (
        <UserPlus className="size-3.5" aria-hidden />
      )}
      {isFriend ? "Friends" : "Add Friend"}
    </Button>
  );
}
