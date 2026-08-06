import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { GameCard } from "@/components/game-card";
import { PropRow } from "@/components/prop-row";
import { Skeleton } from "@/components/ui/skeleton";
import { gamesQuery, trendingPropsQuery, type Game } from "@/lib/data";
import { refreshOdds } from "@/lib/odds-ingest.functions";
import { cn } from "@/lib/utils";

const REFRESH_COOLDOWN_MS = 60_000;

export const Route = createFileRoute("/_authenticated/home")({
  head: () => ({
    meta: [
      { title: "Today's Slate — ParlayPals" },
      {
        name: "description",
        content: "Browse tonight's games and player props, then build your free-to-play bet slip.",
      },
      { property: "og:title", content: "Today's Slate — ParlayPals" },
      {
        property: "og:description",
        content: "Browse games and player props and build your free-to-play bet slip.",
      },
    ],
  }),
  component: HomePage,
});

const LEAGUE_ORDER = ["NFL", "NBA", "MLB", "NHL"] as const;
const leagues = ["All", ...LEAGUE_ORDER] as const;

function groupByLeague(games: Game[]): { league: string; games: Game[] }[] {
  const bySport = new Map<string, Game[]>();
  for (const game of games) {
    const list = bySport.get(game.league_label) ?? [];
    list.push(game);
    bySport.set(game.league_label, list);
  }
  for (const list of bySport.values()) {
    list.sort((a, b) => {
      if (a.is_featured !== b.is_featured) return a.is_featured ? -1 : 1;
      return a.start_time.localeCompare(b.start_time);
    });
  }

  const known = LEAGUE_ORDER.filter((l) => bySport.has(l)).map((l) => ({
    league: l,
    games: bySport.get(l)!,
  }));
  const rest = Array.from(bySport.keys())
    .filter((l) => !(LEAGUE_ORDER as readonly string[]).includes(l))
    .sort()
    .map((l) => ({ league: l, games: bySport.get(l)! }));
  return [...known, ...rest];
}

function HomePage() {
  const [league, setLeague] = useState<(typeof leagues)[number]>("All");
  const { data: games, isLoading } = useQuery(gamesQuery(league === "All" ? undefined : league));
  const { data: props } = useQuery(trendingPropsQuery());
  const queryClient = useQueryClient();
  const [lastRefreshedAt, setLastRefreshedAt] = useState(0);

  const refresh = useMutation({
    mutationFn: () => refreshOdds(),
    onSuccess: (result) => {
      setLastRefreshedAt(Date.now());
      queryClient.invalidateQueries({ queryKey: ["games"] });
      toast.success(`Odds updated — ${result.upserted} games synced from DraftKings.`);
      if (result.errors.length > 0) console.warn("[odds refresh]", result.errors);
    },
    onError: (err) => toast.error(err instanceof Error ? err.message : "Couldn't refresh odds."),
  });

  const onCooldown = Date.now() - lastRefreshedAt < REFRESH_COOLDOWN_MS;
  const sections = games ? groupByLeague(games) : [];

  return (
    <div className="-mx-4 space-y-4">
      {/* DraftKings-style sport tab bar */}
      <div className="sticky top-0 z-10 border-b border-border bg-background">
        <div className="flex items-center gap-4 overflow-x-auto px-4">
          {leagues.map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLeague(l)}
              className={cn(
                "shrink-0 border-b-2 px-1 pb-2.5 pt-3 text-sm font-bold uppercase tracking-wide transition-colors",
                league === l
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground",
              )}
            >
              {l}
            </button>
          ))}
          <button
            type="button"
            onClick={() => refresh.mutate()}
            disabled={refresh.isPending || onCooldown}
            className="ml-auto flex shrink-0 items-center gap-1.5 py-2 text-xs font-semibold text-muted-foreground disabled:opacity-50"
            aria-label="Refresh odds from DraftKings"
          >
            <RefreshCw className={cn("size-3.5", refresh.isPending && "animate-spin")} />
            Odds
          </button>
        </div>
      </div>

      <section className="space-y-3">
        <h1 className="px-4 font-display text-lg font-extrabold uppercase tracking-wide">
          Today's slate
        </h1>
        {isLoading && (
          <div className="space-y-2 px-4">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        )}
        {!isLoading && sections.length === 0 && (
          <p className="mx-4 rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            No games on the board for {league}.
          </p>
        )}
        {sections.map(({ league: sectionLeague, games: sectionGames }) => {
          const first = sectionGames[0];
          const daysOut = first
            ? Math.ceil((new Date(first.start_time).getTime() - Date.now()) / 86_400_000)
            : 0;
          return (
            <div key={sectionLeague}>
              <div className="flex items-center justify-between border-b border-border bg-elevated px-4 py-1.5">
                <h2 className="font-display text-xs font-bold uppercase tracking-widest text-foreground">
                  {sectionLeague}
                </h2>
                <span className="text-[10px] font-semibold text-muted-foreground">
                  {daysOut > 2
                    ? `Opening slate — first game in ${daysOut} days`
                    : `${sectionGames.length} games`}
                </span>
              </div>
              {sectionGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          );
        })}

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
