import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { GameCard } from "@/components/game-card";
import { PropRow } from "@/components/prop-row";
import { Skeleton } from "@/components/ui/skeleton";
import { gamesQuery, trendingPropsQuery } from "@/lib/data";
import { cn } from "@/lib/utils";

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

const leagues = ["All", "NFL", "NBA", "MLB", "NHL"] as const;

function HomePage() {
  const [league, setLeague] = useState<(typeof leagues)[number]>("All");
  const { data: games, isLoading } = useQuery(gamesQuery(league === "All" ? undefined : league));
  const { data: props } = useQuery(trendingPropsQuery());

  return (
    <div className="space-y-5">
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
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

      <section className="space-y-2">
        <h1 className="font-display text-xl font-extrabold">Today's slate</h1>
        {isLoading && (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
        )}
        {games?.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No games on the board for {league}.
          </p>
        )}
        {games?.map((game) => (
          <GameCard key={game.id} game={game} />
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
