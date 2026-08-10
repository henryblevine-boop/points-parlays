import { Star } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { untyped } from "@/integrations/supabase/untyped";
import { cn } from "@/lib/utils";

export function PinBetButton({
  userId,
  betId,
  isPinned,
}: {
  userId: string;
  betId: string;
  isPinned: boolean;
}) {
  const queryClient = useQueryClient();

  const toggle = useMutation({
    mutationFn: async () => {
      if (!isPinned) {
        // Only one pin per user -- clear any existing one first.
        await untyped(supabase).from("bets").update({ is_pinned: false }).eq("user_id", userId);
      }
      const { error } = await untyped(supabase)
        .from("bets")
        .update({ is_pinned: !isPinned })
        .eq("id", betId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets"] });
      toast.success(isPinned ? "Removed from profile" : "Pinned to your profile");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't update that."),
  });

  return (
    <button
      type="button"
      onClick={() => toggle.mutate()}
      disabled={toggle.isPending}
      aria-label={isPinned ? "Unpin from profile" : "Pin to profile"}
      aria-pressed={isPinned}
      className={cn(
        "flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold transition-colors",
        isPinned ? "text-primary" : "text-muted-foreground hover:text-primary",
      )}
    >
      <Star className={cn("size-3.5", isPinned && "fill-current")} aria-hidden />
      {isPinned ? "Featured" : "Feature this"}
    </button>
  );
}
