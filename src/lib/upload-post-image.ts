import { supabase } from "@/integrations/supabase/client";

const MAX_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export async function uploadPostImage(file: File, userId: string): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Images must be PNG, JPEG, GIF, or WEBP.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("Image must be under 8MB.");
  }

  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("post-images").upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("post-images").getPublicUrl(path);
  return data.publicUrl;
}
