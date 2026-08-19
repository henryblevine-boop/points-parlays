/**
 * Server-only notification helpers. Never import from client components.
 */
import { sendTemplateEmail } from "./email-templates/send-email";
import { buildStandings } from "./standings";
import { formatOdds } from "./odds";

const SITE_URL = "https://solisfantasy.com";

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

/** Look up an auth user's email address (service-role only). */
export async function getUserEmail(userId: string): Promise<string | null> {
  const db = await admin();
  const { data, error } = await db.auth.admin.getUserById(userId);
  if (error) return null;
  return data.user?.email ?? null;
}

async function getUsername(userId: string): Promise<string | undefined> {
  const db = await admin();
  const { data } = await db.from("profiles").select("username").eq("id", userId).maybeSingle();
  return (data as { username?: string } | null)?.username ?? undefined;
}

export async function sendWelcomeEmailTo(userId: string) {
  const email = await getUserEmail(userId);
  if (!email) return { sent: false as const, reason: "no_email" };
  const username = await getUsername(userId);
  return sendTemplateEmail("welcome", email, {
    templateData: { username, siteUrl: SITE_URL },
    idempotencyKey: `welcome-${userId}`,
  });
}

type LegRow = { market: string; selection: string; line: string | null; odds: number; matchup: string };

function legLabel(leg: LegRow) {
  const parts = [leg.selection];
  if (leg.line) parts.push(leg.line);
  parts.push(`(${formatOdds(leg.odds)})`);
  return `${parts.join(" ")} — ${leg.matchup}`;
}

/** Sends the "it cashed / bad beat" email for a settled bet. */
export async function sendBetResultEmail(betId: string) {
  const db = await admin();
  const { data: bet } = await db
    .from("bets")
    .select(
      "id, user_id, league_id, bet_type, combined_odds, status, points_delta, bet_legs(market, selection, line, odds, matchup)",
    )
    .eq("id", betId)
    .maybeSingle();
  if (!bet || (bet.status !== "won" && bet.status !== "lost")) {
    return { sent: false as const, reason: "not_settled" };
  }

  const email = await getUserEmail(bet.user_id);
  if (!email) return { sent: false as const, reason: "no_email" };
  const username = await getUsername(bet.user_id);

  let leagueName: string | null = null;
  if (bet.league_id) {
    const { data: league } = await db
      .from("leagues")
      .select("name")
      .eq("id", bet.league_id)
      .maybeSingle();
    leagueName = (league as { name?: string } | null)?.name ?? null;
  }

  const legs = ((bet.bet_legs ?? []) as LegRow[]).map(legLabel);
  const betType =
    bet.bet_type === "parlay" ? `${legs.length}-leg parlay` : "straight bet";

  return sendTemplateEmail("bet-result", email, {
    templateData: {
      username,
      won: bet.status === "won",
      betType,
      oddsLabel: formatOdds(bet.combined_odds),
      pointsDelta: bet.points_delta,
      legs,
      leagueName,
      siteUrl: SITE_URL,
    },
    idempotencyKey: `bet-result-${bet.id}`,
  });
}

function mondayOf(date: Date) {
  const day = (date.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() - day));
}

/**
 * Sends every member of every league a recap personalized to that league:
 * their rank, record, points, bets used, best hit / worst beat, standings.
 */
export async function sendWeeklyRecaps(opts: { weekStart?: string } = {}) {
  const db = await admin();
  const week = opts.weekStart ?? mondayOf(new Date(Date.now() - 24 * 3600 * 1000))
    .toISOString()
    .slice(0, 10);

  const weekLabel = `week of ${new Date(`${week}T00:00:00Z`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  })}`;

  const { data: leagues, error: lErr } = await db
    .from("leagues")
    .select("id, name, weekly_bet_limit");
  if (lErr) throw new Error(lErr.message);

  let sent = 0;
  let skipped = 0;

  for (const league of (leagues ?? []) as {
    id: string;
    name: string;
    weekly_bet_limit: number;
  }[]) {
    const { data: members } = await db
      .from("league_members")
      .select("user_id")
      .eq("league_id", league.id);
    const memberIds = ((members ?? []) as { user_id: string }[]).map((m) => m.user_id);
    if (!memberIds.length) continue;

    const { data: betRows } = await db
      .from("bets")
      .select(
        "id, user_id, league_id, bet_type, combined_odds, status, points_delta, week_start, placed_at, settled_at, bet_legs(market, selection, line, odds, matchup)",
      )
      .eq("league_id", league.id)
      .eq("week_start", week);
    const bets = (betRows ?? []) as any[];

    if (!bets.length) {
      skipped += memberIds.length;
      continue;
    }

    const standings = buildStandings(bets as any, memberIds);

    const { data: profileRows } = await db
      .from("profiles")
      .select("id, username")
      .in("id", memberIds);
    const names = new Map(
      ((profileRows ?? []) as { id: string; username: string }[]).map((p) => [p.id, p.username]),
    );

    const standingsPayload = standings.map((row) => ({
      username: names.get(row.userId) ?? "player",
      points: row.points,
      wins: row.wins,
      losses: row.losses,
      userId: row.userId,
    }));

    for (let i = 0; i < standings.length; i++) {
      const row = standings[i]!;
      const myBets = bets.filter((b) => b.user_id === row.userId);
      if (!myBets.length) {
        skipped += 1;
        continue;
      }
      const email = await getUserEmail(row.userId);
      if (!email) {
        skipped += 1;
        continue;
      }

      const wonBets = myBets.filter((b) => b.status === "won");
      const lostBets = myBets.filter((b) => b.status === "lost");
      const best = wonBets.sort((a, b) => b.points_delta - a.points_delta)[0];
      const worst = lostBets.sort((a, b) => a.points_delta - b.points_delta)[0];

      const describe = (b: any) => {
        const legs = (b.bet_legs ?? []) as LegRow[];
        const label =
          legs.length > 1 ? `${legs.length}-leg parlay` : (legs[0]?.selection ?? "bet");
        return `${label} ${formatOdds(b.combined_odds)} (${
          b.points_delta > 0 ? "+" : ""
        }${b.points_delta} pts)`;
      };

      try {
        const result = await sendTemplateEmail("weekly-recap", email, {
          templateData: {
            username: names.get(row.userId),
            leagueName: league.name,
            weekLabel,
            yourRank: i + 1,
            memberCount: standings.length,
            yourPoints: row.points,
            yourWins: row.wins,
            yourLosses: row.losses,
            yourPending: row.pending,
            betsUsed: myBets.length,
            betLimit: league.weekly_bet_limit,
            standings: standingsPayload.map((s) => ({
              username: s.username,
              points: s.points,
              wins: s.wins,
              losses: s.losses,
              isYou: s.userId === row.userId,
            })),
            bestBet: best ? describe(best) : null,
            worstBet: worst ? describe(worst) : null,
            siteUrl: SITE_URL,
          },
          idempotencyKey: `recap-${league.id}-${row.userId}-${week}`,
        });
        if (result.sent) sent += 1;
        else skipped += 1;
      } catch (error) {
        console.error("weekly recap send failed", { leagueId: league.id, error });
        skipped += 1;
      }
    }
  }

  return { week, sent, skipped };
}
