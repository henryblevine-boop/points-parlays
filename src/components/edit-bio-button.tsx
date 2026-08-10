import { useState } from "react";
import { Pencil } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";

export function EditBioButton({
  userId,
  currentBio,
}: {
  userId: string;
  currentBio: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [bio, setBio] = useState(currentBio ?? "");
  const queryClient = useQueryClient();

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ bio: bio.trim() || null })
        .eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile", userId] });
      setOpen(false);
      toast.success("Bio updated");
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't save."),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Pencil className="size-3.5" aria-hidden />
          Edit bio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">Edit bio</DialogTitle>
        </DialogHeader>
        <Textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={160}
          rows={3}
          placeholder="Tell the league about yourself…"
        />
        <DialogFooter>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
