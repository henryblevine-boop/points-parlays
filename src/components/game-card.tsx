import { Link } from "@tanstack/react-router";
import { Lock } from "lucide-react";
import { OddsButton } from "./odds-button";
import { useBetSlip } from "@/lib/bet-slip";
import { formatSpread } from "@/lib/odds";
import type { Game } from "@/lib/data";

function timeLabel(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function GameCard({ game }: { game: Game }) {
  const { toggleLeg, hasLeg } = useBetSlip();
  const locked = new Date(game.start_time).getTime() <= Date.now();
  const matchup = `${game.away_abbr} @ ${game.home_abbr}`;

  const add = (market: string, selection: string, odds: number, line?: string) =>
    toggleLeg({
      key: `game:${game.id}:${market}:${selection}`,
      game_id: game.id,
      market,
      selection,
      line: line ?? null,
      odds,
      matchup,
    });

  return (
    <article className="rounded-xl border border-border bg-card p-3">
      <header className="mb-2 flex items-center justify-between gap-2">
        <Link
          to="/game/$gameId"
          params={{ gameId: game.id }}
          className="min-w-0 flex-1 hover:text-primary"
        >
          <p className="truncate font-display text-sm font-600">
            {game.away_team} <span className="text-muted-foreground">@</span> {game.home_team}
          </p>
          <p className="text-xs text-muted-foreground">
            {game.league_label} · {timeLabel(game.start_time)}
          </p>
        </Link>
        {locked && (
          <span className="flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">
            <Lock className="size-3" aria-hidden /> Locked
          </span>
        )}
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,minmax(0,1fr))] gap-1.5 text-xs">
        <div className="flex items-center text-[11px] text-muted-foreground">Spread</div>
        <OddsButton
          label={`${game.away_abbr} ${formatSpread(-game.spread_home)}`}
          odds={game.spread_away_odds}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Spread:${game.away_abbr} ${formatSpread(-game.spread_home)}`)}
          onClick={() =>
            add(
              "Spread",
              `${game.away_abbr} ${formatSpread(-game.spread_home)}`,
              game.spread_away_odds,
            )
          }
        />
        <OddsButton
          label={`${game.home_abbr} ${formatSpread(game.spread_home)}`}
          odds={game.spread_home_odds}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Spread:${game.home_abbr} ${formatSpread(game.spread_home)}`)}
          onClick={() =>
            add(
              "Spread",
              `${game.home_abbr} ${formatSpread(game.spread_home)}`,
              game.spread_home_odds,
            )
          }
        />
        <div />

        <div className="flex items-center text-[11px] text-muted-foreground">Moneyline</div>
        <OddsButton
          label={game.away_abbr}
          odds={game.ml_away}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Moneyline:${game.away_abbr} ML`)}
          onClick={() => add("Moneyline", `${game.away_abbr} ML`, game.ml_away)}
        />
        <OddsButton
          label={game.home_abbr}
          odds={game.ml_home}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Moneyline:${game.home_abbr} ML`)}
          onClick={() => add("Moneyline", `${game.home_abbr} ML`, game.ml_home)}
        />
        <div />

        <div className="flex items-center text-[11px] text-muted-foreground">Total</div>
        <OddsButton
          label={`O ${game.total_line}`}
          odds={game.over_odds}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Total:Over ${game.total_line}`)}
          onClick={() => add("Total", `Over ${game.total_line}`, game.over_odds)}
        />
        <OddsButton
          label={`U ${game.total_line}`}
          odds={game.under_odds}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Total:Under ${game.total_line}`)}
          onClick={() => add("Total", `Under ${game.total_line}`, game.under_odds)}
        />
        <div />
      </div>
    </article>
  );
}
