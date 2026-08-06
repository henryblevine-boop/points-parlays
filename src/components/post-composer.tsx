import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { createPost } from "@/lib/posts.functions";
import { uploadPostImage } from "@/lib/upload-post-image";
import { useSessionUser } from "@/hooks/use-session-user";
import type { Profile } from "@/lib/data";

const MAX_LEN = 280;

export function PostComposer({ profile }: { profile: Profile | null | undefined }) {
  const { user } = useSessionUser();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const post = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      let imageUrl: string | null = null;
      if (imageFile) {
        setUploading(true);
        imageUrl = await uploadPostImage(imageFile, user.id);
        setUploading(false);
      }
      return createPost({ data: { content: content.trim(), imageUrl } });
    },
    onSuccess: () => {
      setContent("");
      clearImage();
      queryClient.invalidateQueries({ queryKey: ["feed"] });
    },
    onError: (err) => {
      setUploading(false);
      toast.error(err instanceof Error ? err.message : "Couldn't post that.");
    },
  });

  function clearImage() {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onPickImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  }

  const trimmed = content.trim();
  const canPost = (trimmed.length > 0 || imageFile) && trimmed.length <= MAX_LEN;

  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex gap-3">
        <Avatar className="size-9 shrink-0">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
          <AvatarFallback>{(profile?.username ?? "??").slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's the pick? Post a bad beat, a lock, a meme…"
            maxLength={MAX_LEN}
            rows={2}
            className="resize-none border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
          />

          {imagePreview && (
            <div className="relative w-fit">
              <img
                src={imagePreview}
                alt="Attached"
                className="max-h-52 rounded-lg border border-border object-cover"
              />
              <button
                type="button"
                onClick={clearImage}
                className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-foreground text-background"
                aria-label="Remove image"
              >
                <X className="size-3.5" />
              </button>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex size-8 items-center justify-center rounded-full text-primary hover:bg-primary/10"
                aria-label="Attach an image or meme"
              >
                <ImagePlus className="size-4.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/gif,image/webp"
                onChange={onPickImage}
                className="hidden"
              />
              {trimmed.length > 0 && (
                <span
                  className={
                    trimmed.length > MAX_LEN
                      ? "text-xs font-semibold text-destructive"
                      : "text-xs text-muted-foreground"
                  }
                >
                  {MAX_LEN - trimmed.length}
                </span>
              )}
            </div>

            <button
              type="button"
              disabled={!canPost || post.isPending || uploading}
              onClick={() => post.mutate()}
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground disabled:opacity-40"
            >
              {(post.isPending || uploading) && <Loader2 className="size-3.5 animate-spin" />}
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
