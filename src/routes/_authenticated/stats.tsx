import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BarChart3, Ticket } from "lucide-react";

import { BetSlipCard } from "@/components/bet-slip-card";
import { ShareBetButton } from "@/components/share-bet-button";
import { EmptyState } from "@/components/empty-state";
import { useSessionUser } from "@/hooks/use-session-user";
import { betsQuery, profileQuery, type Bet } from "@/lib/data";
import { formatOdds, formatPoints } from "@/lib/odds";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/stats")({
  head: () => ({
    meta: [
      { title: "Season Stats — Solis-Fantasy" },
      {
        name: "description",
        content:
          "Your Solis-Fantasy season in numbers: record, points, longest parlay, best hit, worst beat and most-bet team.",
      },
      { property: "og:title", content: "Season Stats — Solis-Fantasy" },
      {
        property: "og:description",
        content: "Record, best hit, worst beat and most-bet team for your season.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StatsPage,
});

function teamCounts(bets: Bet[]) {
  const counts = new Map<string, number>();
  for (const bet of bets) {
    for (const leg of bet.bet_legs) {
      const abbrs = leg.matchup.split("@").map((s) => s.trim());
      for (const abbr of abbrs) {
        if (!abbr) continue;
        if (leg.selection.toUpperCase().includes(abbr.toUpperCase())) {
          counts.set(abbr, (counts.get(abbr) ?? 0) + 1);
        }
      }
    }
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function StatsPage() {
  const { user } = useSessionUser();
  const userId = user?.id ?? "";
  const { data: bets = [] } = useQuery({ ...betsQuery({ userId }), enabled: Boolean(userId) });
  const { data: profile } = useQuery({ ...profileQuery(userId), enabled: Boolean(userId) });
  const username = profile?.username ?? "solis";

  const settled = bets.filter((b) => b.status !== "pending");
  const wins = settled.filter((b) => b.status === "won");
  const losses = settled.filter((b) => b.status === "lost");
  const points = settled.reduce((sum, b) => sum + b.points_delta, 0);
  const winRate = settled.length ? Math.round((wins.length / settled.length) * 100) : 0;
  const parlays = bets.filter((b) => b.bet_legs.length > 1);
  const longest = bets.reduce((max, b) => Math.max(max, b.bet_legs.length), 0);

  const bestHit = wins.reduce<Bet | null>(
    (best, b) => (!best || b.points_delta > best.points_delta ? b : best),
    null,
  );
  const worstBeat = losses.reduce<Bet | null>(
    (worst, b) => (!worst || b.points_delta < worst.points_delta ? b : worst),
    null,
  );

  const teams = teamCounts(bets);
  const topTeam = teams[0];

  return (
    <div className="space-y-6">
      <header className="flex items-center gap-2">
        <BarChart3 className="size-5 text-primary" aria-hidden />
        <h1 className="font-display text-xl font-extrabold">Season stats</h1>
      </header>

      {bets.length === 0 && (
        <EmptyState
          icon={Ticket}
          title="No bets yet this season"
          body="Place your first slip and your season stats will start filling in."
        />
      )}

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Points" value={formatPoints(points)} />
        <Stat label="Record" value={`${wins.length}-${losses.length}`} />
        <Stat label="Win rate" value={`${winRate}%`} />
        <Stat label="Tickets" value={String(bets.length)} />
        <Stat label="Parlays" value={String(parlays.length)} />
        <Stat label="Longest slip" value={longest ? `${longest} legs` : "—"} />
      </dl>

      {topTeam && (
        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold">Most-bet team</h2>
          <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
            <span className="font-display grid size-12 place-items-center rounded-lg bg-primary/15 text-sm font-extrabold text-primary">
              {topTeam[0]}
            </span>
            <p className="text-sm text-muted-foreground">
              You've backed <span className="font-semibold text-foreground">{topTeam[0]}</span>{" "}
              {topTeam[1]} {topTeam[1] === 1 ? "time" : "times"} this season.
            </p>
          </div>
          {teams.length > 1 && (
            <ul className="space-y-1">
              {teams.slice(1, 6).map(([abbr, count]) => (
                <li
                  key={abbr}
                  className="flex items-center justify-between rounded-lg border border-border bg-elevated px-3 py-1.5 text-xs"
                >
                  <span className="font-semibold">{abbr}</span>
                  <span className="tabular-nums text-muted-foreground">{count} legs</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      {bestHit && (
        <Highlight
          title="Best hit"
          subtitle={`${formatOdds(bestHit.combined_odds)} · ${formatPoints(bestHit.points_delta)} pts`}
          tone="win"
          bet={bestHit}
          username={username}
        />
      )}

      {worstBeat && (
        <Highlight
          title="Worst beat"
          subtitle={`${formatOdds(worstBeat.combined_odds)} · ${formatPoints(worstBeat.points_delta)} pts`}
          tone="loss"
          bet={worstBeat}
          username={username}
        />
      )}
    </div>
  );
}

function Highlight({
  title,
  subtitle,
  tone,
  bet,
  username,
}: {
  title: string;
  subtitle: string;
  tone: "win" | "loss";
  bet: Bet;
  username: string;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-bold">{title}</h2>
        <span
          className={cn(
            "font-display text-sm font-bold tabular-nums",
            tone === "win" ? "text-win" : "text-loss",
          )}
        >
          {subtitle}
        </span>
      </div>
      <BetSlipCard bet={bet} action={<ShareBetButton bet={bet} username={username} />} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-2 py-3">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-display text-lg font-extrabold tabular-nums">{value}</dd>
    </div>
  );
}
