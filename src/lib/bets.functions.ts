import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { combineOdds, pointsIfLost, pointsIfWon } from "./odds";

const legSchema = z.object({
  game_id: z.string().uuid().nullable().optional(),
  prop_id: z.string().uuid().nullable().optional(),
  market: z.string().min(1).max(60),
  selection: z.string().min(1).max(120),
  line: z.string().max(40).nullable().optional(),
  odds: z.number().int().min(-100000).max(100000),
  matchup: z.string().min(1).max(120),
});

const placeBetSchema = z.object({
  leagueId: z.string().uuid().nullable(),
  legs: z.array(legSchema).min(1).max(12),
});

export const placeBet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => placeBetSchema.parse(data))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context;

    if (data.leagueId) {
      const { data: league, error: lErr } = await supabase
        .from("leagues")
        .select("id, weekly_bet_limit")
        .eq("id", data.leagueId)
        .maybeSingle();
      if (lErr) throw new Error(lErr.message);
      if (!league) throw new Error("League not found");

      const now = new Date();
      const day = (now.getUTCDay() + 6) % 7; // Monday = 0, matches date_trunc('week')
      const monday = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - day),
      );
      const weekStart = monday.toISOString().slice(0, 10);


      const { count, error: cErr } = await supabase
        .from("bets")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("league_id", data.leagueId)
        .eq("week_start", weekStart);
      if (cErr) throw new Error(cErr.message);
      if ((count ?? 0) >= league.weekly_bet_limit) {
        throw new Error("You have used all of your bets in this league for this week.");
      }
    }

    const combined = combineOdds(data.legs.map((l) => l.odds));

    const { data: bet, error } = await supabase
      .from("bets")
      .insert({
        user_id: userId,
        league_id: data.leagueId,
        bet_type: data.legs.length > 1 ? "parlay" : "straight",
        combined_odds: combined,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);

    const { error: legErr } = await supabase.from("bet_legs").insert(
      data.legs.map((l) => ({
        bet_id: bet.id,
        game_id: l.game_id ?? null,
        prop_id: l.prop_id ?? null,
        market: l.market,
        selection: l.selection,
        line: l.line ?? null,
        odds: l.odds,
        matchup: l.matchup,
      })),
    );
    if (legErr) throw new Error(legErr.message);

    return { id: bet.id, combinedOdds: combined };
  });

export const settleBet = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) =>
    z.object({ betId: z.string().uuid(), result: z.enum(["won", "lost"]) }).parse(data),
  )
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: bet, error } = await supabase
      .from("bets")
      .select("id, combined_odds, status")
      .eq("id", data.betId)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!bet) throw new Error("Bet not found");
    if (bet.status !== "pending") throw new Error("This bet has already been settled.");

    const delta =
      data.result === "won" ? pointsIfWon(bet.combined_odds) : -pointsIfLost(bet.combined_odds);

    const { error: uErr } = await supabase
      .from("bets")
      .update({ status: data.result, points_delta: delta, settled_at: new Date().toISOString() })
      .eq("id", bet.id);
    if (uErr) throw new Error(uErr.message);

    try {
      const { sendBetResultEmail } = await import("./notifications.server");
      await sendBetResultEmail(bet.id);
    } catch (mailErr) {
      console.error("bet result email failed", mailErr);
    }

    return { pointsDelta: delta };
  });
