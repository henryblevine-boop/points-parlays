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
    <div className="space-y-5">
      <div className="-mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
        <button
          type="button"
          onClick={() => refresh.mutate()}
          disabled={refresh.isPending || onCooldown}
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground disabled:opacity-50"
          aria-label="Refresh odds from DraftKings"
        >
          <RefreshCw className={cn("size-3.5", refresh.isPending && "animate-spin")} />
          Odds
        </button>
        {leagues.map((l) => (
          <button
            key={l}
            type="button"
            onClick={() => setLeague(l)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors",
              league === l
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground",
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <section className="space-y-4">
        <h1 className="font-display text-xl font-extrabold">Today's slate</h1>
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        )}
        {!isLoading && sections.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No games on the board for {league}.
          </p>
        )}
        {sections.map(({ league: sectionLeague, games: sectionGames }) => (
          <div key={sectionLeague} className="space-y-2">
            {league === "All" && (
              <div className="flex items-center gap-2">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  {sectionLeague}
                </h2>
                <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                  {sectionGames.length}
                </span>
              </div>
            )}
            <div className="space-y-2">
              {sectionGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </div>
        ))}
      </section>

      {props && props.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold">Trending props</h2>
          {props.map((p) => (
            <PropRow
              key={p.id}
              prop={p}
              matchup={
                p.games ? `${p.games.away_abbr} @ ${p.games.home_abbr}` : (p.team_abbr ?? "Prop")
              }
            />
          ))}
        </section>
      )}
    </div>
  );
}
