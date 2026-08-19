import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Radio, Ticket } from "lucide-react";

import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionUser } from "@/hooks/use-session-user";
import { betsQuery, gamesByIdsQuery, type Bet, type Game } from "@/lib/data";
import { formatOdds, pointsIfLost, pointsIfWon } from "@/lib/odds";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_authenticated/live")({
  head: () => ({
    meta: [
      { title: "Live Tracker — Solis-Fantasy" },
      {
        name: "description",
        content:
          "Sweat your open tickets in real time — leg-by-leg status, kickoff countdowns and points on the line.",
      },
      { property: "og:title", content: "Live Tracker — Solis-Fantasy" },
      {
        property: "og:description",
        content: "Track your open tickets leg by leg while the games play out.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LivePage,
});

const GAME_LENGTH_MS = 3.5 * 3_600_000;

type LegState = "pre" | "live" | "final" | "unknown";

function legState(game: Game | undefined): LegState {
  if (!game) return "unknown";
  const start = new Date(game.start_time).getTime();
  const now = Date.now();
  if (game.status === "final" || now > start + GAME_LENGTH_MS) return "final";
  if (now >= start) return "live";
  return "pre";
}

function countdown(iso: string) {
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "underway";
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `in ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `in ${hrs}h ${mins % 60}m`;
  return `in ${Math.floor(hrs / 24)}d ${hrs % 24}h`;
}

function LivePage() {
  const { user } = useSessionUser();
  const userId = user?.id ?? "";
  const { data: bets = [], isLoading } = useQuery({
    ...betsQuery({ userId }),
    enabled: Boolean(userId),
    refetchInterval: 60_000,
  });

  const pending = bets.filter((b) => b.status === "pending");
  const gameIds = Array.from(
    new Set(pending.flatMap((b) => b.bet_legs.map((l) => (l as { game_id?: string }).game_id ?? ""))),
  ).filter(Boolean);
  const { data: games = [] } = useQuery(gamesByIdsQuery(gameIds));
  const gameById = new Map(games.map((g) => [g.id, g]));

  const atRisk = pending.reduce((sum, b) => sum + pointsIfLost(b.combined_odds), 0);
  const upside = pending.reduce((sum, b) => sum + pointsIfWon(b.combined_odds), 0);

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-2">
        <Radio className="size-5 text-primary" aria-hidden />
        <h1 className="font-display text-xl font-extrabold">Live tracker</h1>
      </header>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Open tickets" value={String(pending.length)} />
        <Stat label="Points on the line" value={`+${upside}`} accent="win" />
        <Stat label="At risk" value={`-${atRisk}`} accent="loss" />
      </dl>

      {isLoading && <Skeleton className="h-32 w-full rounded-xl" />}

      {!isLoading && pending.length === 0 && (
        <EmptyState
          icon={Ticket}
          title="No open tickets"
          body="Build a slip from the slate and come back here to sweat it out."
        />
      )}

      <div className="space-y-3">
        {pending.map((bet) => (
          <LiveTicket key={bet.id} bet={bet} gameById={gameById} />
        ))}
      </div>

      <Link to="/home" className="block text-center text-xs text-muted-foreground hover:text-primary">
        Back to the slate →
      </Link>
    </div>
  );
}

function LiveTicket({ bet, gameById }: { bet: Bet; gameById: Map<string, Game> }) {
  const states = bet.bet_legs.map((leg) => legState(gameById.get((leg as { game_id?: string }).game_id ?? "")));
  const liveCount = states.filter((s) => s === "live").length;
  const finalCount = states.filter((s) => s === "final").length;

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-elevated">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-muted px-3 py-2">
        <span className="font-display text-xs font-bold uppercase tracking-wide">
          {bet.bet_legs.length > 1 ? `${bet.bet_legs.length}-Leg Parlay` : "Straight"} ·{" "}
          {formatOdds(bet.combined_odds)}
        </span>
        <span
          className={cn(
            "flex items-center gap-1.5 text-[11px] font-bold uppercase",
            liveCount > 0 ? "text-primary" : "text-muted-foreground",
          )}
        >
          {liveCount > 0 && (
            <span className="size-2 animate-pulse rounded-full bg-primary" aria-hidden />
          )}
          {liveCount > 0 ? `${liveCount} live` : `${finalCount}/${states.length} played`}
        </span>
      </div>
      <ul className="divide-y divide-border">
        {bet.bet_legs.map((leg, i) => {
          const game = gameById.get((leg as { game_id?: string }).game_id ?? "");
          const state = states[i]!;
          return (
            <li key={leg.id} className="flex items-center gap-2 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{leg.selection}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {leg.market} · {leg.matchup}
                  {game ? ` · ${state === "pre" ? countdown(game.start_time) : state === "live" ? "in progress" : "played"}` : ""}
                </p>
              </div>
              <span
                className={cn(
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase",
                  state === "live" && "bg-primary/15 text-primary",
                  state === "final" && "bg-muted text-muted-foreground",
                  (state === "pre" || state === "unknown") && "bg-muted text-muted-foreground",
                )}
              >
                {state === "live" ? "Live" : state === "final" ? "Played" : "Pre"}
              </span>
              <span className="font-display w-14 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
                {formatOdds(leg.odds)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground">
        <span>Win: +{pointsIfWon(bet.combined_odds)} pts</span>
        <span>Lose: -{pointsIfLost(bet.combined_odds)} pts</span>
      </div>
    </article>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "win" | "loss";
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-2 py-3">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "font-display text-lg font-extrabold tabular-nums",
          accent === "win" && "text-win",
          accent === "loss" && "text-loss",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
