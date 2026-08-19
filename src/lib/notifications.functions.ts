import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/** Sends the welcome email to the currently signed-in user (called right after signup). */
export const sendWelcomeEmail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { sendWelcomeEmailTo } = await import("./notifications.server");
    try {
      await sendWelcomeEmailTo(context.userId);
      return { ok: true };
    } catch (error) {
      console.error("welcome email failed", error);
      return { ok: false };
    }
  });
