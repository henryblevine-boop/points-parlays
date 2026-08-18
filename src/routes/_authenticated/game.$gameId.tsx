import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { GameCard } from "@/components/game-card";
import { PropRow } from "@/components/prop-row";
import { gameQuery, propsQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/game/$gameId")({
  head: () => ({
    meta: [
      { title: "Game Markets — Solis-Fantasy" },
      {
        name: "description",
        content: "All spreads, moneylines, totals and player props available for this matchup.",
      },
      { property: "og:title", content: "Game Markets — Solis-Fantasy" },
      {
        property: "og:description",
        content: "All spreads, moneylines, totals and player props for this matchup.",
      },
    ],
  }),
  component: GamePage,
});

function GamePage() {
  const { gameId } = Route.useParams();
  const { data: game } = useQuery(gameQuery(gameId));
  const { data: props = [] } = useQuery(propsQuery(gameId));

  const matchup = game ? `${game.away_abbr} @ ${game.home_abbr}` : "";

  return (
    <div className="space-y-4">
      <Link to="/home" className="text-xs text-muted-foreground hover:text-primary">
        ← Back to slate
      </Link>
      {game ? (
        <>
          <h1 className="font-display text-xl font-extrabold">
            {game.away_team} @ {game.home_team}
          </h1>
          <GameCard game={game} />
          <section className="space-y-2">
            <h2 className="font-display text-lg font-bold">Player props</h2>
            {props.length === 0 && (
              <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
                No props posted for this game.
              </p>
            )}
            {props.map((p) => (
              <PropRow key={p.id} prop={p} matchup={matchup} />
            ))}
          </section>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">Game not found.</p>
      )}
    </div>
  );
}
