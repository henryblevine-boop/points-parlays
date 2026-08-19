import { createFileRoute } from "@tanstack/react-router";

/**
 * Weekly league recap dispatcher. Called by a scheduler with the shared secret:
 *   POST /api/public/weekly-recap  with header  x-recap-secret: <WEEKLY_RECAP_SECRET>
 * Optional JSON body: { "weekStart": "YYYY-MM-DD" }
 */
export const Route = createFileRoute("/api/public/weekly-recap")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env["WEEKLY_RECAP_SECRET"];
        if (!secret) {
          return new Response("Not configured", { status: 500 });
        }
        const provided = request.headers.get("x-recap-secret") ?? "";
        if (provided.length !== secret.length || provided !== secret) {
          return new Response("Unauthorized", { status: 401 });
        }

        let weekStart: string | undefined;
        try {
          const body = (await request.json()) as { weekStart?: string };
          if (typeof body?.weekStart === "string" && /^\d{4}-\d{2}-\d{2}$/.test(body.weekStart)) {
            weekStart = body.weekStart;
          }
        } catch {
          // no body — use the previous week
        }

        const { sendWeeklyRecaps } = await import("@/lib/notifications.server");
        const result = await sendWeeklyRecaps(weekStart ? { weekStart } : {});
        return Response.json(result);
      },
    },
  },
});
