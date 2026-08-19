import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Trophy, CalendarClock, Radio } from "lucide-react";
import { toast } from "sonner";

import { GameCard } from "@/components/game-card";
import { PropRow } from "@/components/prop-row";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { gamesQuery, trendingPropsQuery } from "@/lib/data";
import { refreshOdds } from "@/lib/odds-ingest.functions";
import { cn } from "@/lib/utils";

const REFRESH_COOLDOWN_MS = 60_000;

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Today's Slate — Solis-Fantasy" },
      {
        name: "description",
        content:
          "Browse this week's NFL games and player props, then build your free-to-play bet slip.",
      },
      { property: "og:title", content: "Today's Slate — Solis-Fantasy" },
      {
        property: "og:description",
        content: "Browse NFL games and player props and build your free-to-play bet slip.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { data: games, isLoading } = useQuery(gamesQuery("NFL"));
  const { data: props } = useQuery(trendingPropsQuery());
  const queryClient = useQueryClient();
  const [lastRefreshedAt, setLastRefreshedAt] = useState(0);

  const refresh = useMutation({
    mutationFn: () => refreshOdds(),
    onSuccess: (result) => {
      setLastRefreshedAt(Date.now());
      queryClient.invalidateQueries({ queryKey: ["games"] });
      queryClient.invalidateQueries({ queryKey: ["futures"] });
      queryClient.invalidateQueries({ queryKey: ["trending-props"] });
      toast.success(
        `Odds updated — ${result.gamesUpserted} games, ${result.propsUpserted} props, ` +
          `${result.futuresUpserted} futures synced.`,
      );
      if (result.errors.length > 0) console.warn("[odds refresh]", result.errors);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't refresh odds."),
  });

  const onCooldown = Date.now() - lastRefreshedAt < REFRESH_COOLDOWN_MS;

  const sortedGames = games
    ? [...games].sort((a, b) => {
        if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
        return a.start_time.localeCompare(b.start_time);
      })
    : [];
  const first = sortedGames[0];
  const daysOut = first
    ? Math.ceil((new Date(first.start_time).getTime() - Date.now()) / 86_400_000)
    : 0;

  return (
    <div className="-mx-4 space-y-4">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <h1 className="font-display text-lg font-extrabold uppercase tracking-wide">NFL</h1>
        <button
          type="button"
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending || onCooldown}
          className="flex shrink-0 items-center gap-1.5 text-xs font-semibold text-muted-foreground disabled:opacity-50"
          aria-label="Refresh the latest odds"
        >
          <RefreshCw className={cn("size-3.5", refresh.isPending && "animate-spin")} />
          Odds
        </button>
      </div>

      <div className="px-4">
        <Link
          to="/live"
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:border-primary/50"
        >
          <Radio className="size-4 text-primary" aria-hidden />
          Live tracker — sweat your open tickets
        </Link>
        <Link
          to="/futures"
          className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-semibold text-foreground hover:border-primary/50"
        >
          <Trophy className="size-4 text-primary" aria-hidden />
          Futures — season-long championship bets
        </Link>
      </div>

      <section className="space-y-2">
        <div className="flex items-center justify-between px-4">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
            This week's slate
          </h2>
          {daysOut > 2 && (
            <span className="text-[10px] font-semibold text-muted-foreground">
              Opening slate — first game in {daysOut} days
            </span>
          )}
        </div>
        {isLoading && (
          <div className="space-y-2 px-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}
        {!isLoading && sortedGames.length === 0 && (
          <div className="px-4">
            <EmptyState
              icon={CalendarClock}
              title="No games on the board yet"
              body='Tap "Odds" above to pull the latest lines.'
            />
          </div>
        )}
        {sortedGames.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </section>

      {props && props.length > 0 && (
        <section>
          <div className="border-b border-border bg-elevated px-4 py-1.5">
            <h2 className="font-display text-xs font-bold uppercase tracking-widest">
              Popular player props
            </h2>
          </div>
          <div className="px-4">
            {props.map((p) => (
              <PropRow
                key={p.id}
                prop={p}
                matchup={
                  p.games ? `${p.games.away_abbr} @ ${p.games.home_abbr}` : (p.team_abbr ?? "Prop")
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
