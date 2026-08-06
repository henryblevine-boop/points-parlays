import { createFileRoute } from "@tanstack/react-router";
import { GameCard } from "@/components/game-card";
import { BetSlipProvider } from "@/lib/bet-slip";
import type { Game } from "@/lib/data";

export const Route = createFileRoute("/dk-preview")({
  component: () => (
    <BetSlipProvider>
      <div className="min-h-screen bg-background py-4">
        {mock.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
      </div>
    </BetSlipProvider>
  ),
});

const mock = [
  {
    id: "1",
    sport: "NFL",
    league_label: "NFL",
    home_team: "Seattle Seahawks",
    away_team: "New England Patriots",
    home_abbr: "SEA",
    away_abbr: "NE",
    start_time: new Date(Date.now() + 3600_000).toISOString(),
    spread_home: -3.5,
    spread_home_odds: -110,
    spread_away_odds: -110,
    ml_home: -192,
    ml_away: 160,
    total_line: 44.5,
    over_odds: -110,
    under_odds: -110,
    is_featured: true,
  },
] as unknown as Game[];
