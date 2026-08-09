import { Link } from "@tanstack/react-router";
import { ChevronRight, Lock } from "lucide-react";
import { OddsButton } from "./odds-button";
import { useBetSlip } from "@/lib/bet-slip";
import { formatSpread } from "@/lib/odds";
import type { Game } from "@/lib/data";

function timeLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const sameDay = d.toDateString() === today.toDateString();
  const time = d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  if (sameDay) return `Today ${time}`;
  return `${d.toLocaleDateString(undefined, { weekday: "short", month: "numeric", day: "numeric" })} ${time}`;
}

/**
 * DraftKings-style game row: teams stacked on the left, three market columns
 * (Spread / Total / Moneyline) on the right with one cell per team.
 */
export function GameCard({ game }: { game: Game }) {
  const { toggleLeg, hasLeg } = useBetSlip();
  const locked = new Date(game.start_time).getTime() <= Date.now();
  const matchup = `${game.away_abbr} @ ${game.home_abbr}`;

  const add = (market: string, selection: string, odds: number) =>
    toggleLeg({
      key: `game:${game.id}:${market}:${selection}`,
      game_id: game.id,
      market,
      selection,
      line: null,
      odds,
      matchup,
    });

  const awaySpreadSel = `${game.away_abbr} ${formatSpread(-game.spread_home)}`;
  const homeSpreadSel = `${game.home_abbr} ${formatSpread(game.spread_home)}`;

  const teamCell = (abbr: string, name: string) => (
    <div className="flex min-w-0 items-center gap-2">
      <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-[9px] font-bold tracking-tight text-muted-foreground">
        {abbr}
      </span>
      <span className="truncate text-[13px] font-semibold">{name}</span>
    </div>
  );

  return (
    <article className="border-b border-border bg-card px-3 py-2.5 last:border-b-0">
      <header className="mb-1.5 flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {locked ? (
            <>
              <Lock className="size-3" aria-hidden /> Locked
            </>
          ) : (
            timeLabel(game.start_time)
          )}
        </p>
        <div className="grid grid-cols-3 gap-1.5 text-center text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
          <span className="w-[68px]">Spread</span>
          <span className="w-[68px]">Total</span>
          <span className="w-[68px]">Money</span>
        </div>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)_repeat(3,68px)] items-center gap-1.5">
        {/* Away team */}
        {teamCell(game.away_abbr, game.away_team)}
        <OddsButton
          line={formatSpread(-game.spread_home)}
          label={`${awaySpreadSel} spread`}
          odds={game.spread_away_odds}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Spread:${awaySpreadSel}`)}
          onClick={() => add("Spread", awaySpreadSel, game.spread_away_odds)}
        />
        <OddsButton
          line={`O ${game.total_line}`}
          label={`Over ${game.total_line}`}
          odds={game.over_odds}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Total:Over ${game.total_line}`)}
          onClick={() => add("Total", `Over ${game.total_line}`, game.over_odds)}
        />
        <OddsButton
          label={`${game.away_abbr} moneyline`}
          odds={game.ml_away}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Moneyline:${game.away_abbr} ML`)}
          onClick={() => add("Moneyline", `${game.away_abbr} ML`, game.ml_away)}
        />

        {/* Home team */}
        {teamCell(game.home_abbr, game.home_team)}
        <OddsButton
          line={formatSpread(game.spread_home)}
          label={`${homeSpreadSel} spread`}
          odds={game.spread_home_odds}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Spread:${homeSpreadSel}`)}
          onClick={() => add("Spread", homeSpreadSel, game.spread_home_odds)}
        />
        <OddsButton
          line={`U ${game.total_line}`}
          label={`Under ${game.total_line}`}
          odds={game.under_odds}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Total:Under ${game.total_line}`)}
          onClick={() => add("Total", `Under ${game.total_line}`, game.under_odds)}
        />
        <OddsButton
          label={`${game.home_abbr} moneyline`}
          odds={game.ml_home}
          disabled={locked}
          active={hasLeg(`game:${game.id}:Moneyline:${game.home_abbr} ML`)}
          onClick={() => add("Moneyline", `${game.home_abbr} ML`, game.ml_home)}
        />

        {/* Draw (soccer only) */}
        {game.ml_draw != null && (
          <>
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-[9px] font-bold tracking-tight text-muted-foreground">
                —
              </span>
              <span className="truncate text-[13px] font-semibold text-muted-foreground">Draw</span>
            </div>
            <div />
            <div />
            <OddsButton
              label="Draw"
              odds={game.ml_draw}
              disabled={locked}
              active={hasLeg(`game:${game.id}:Moneyline:Draw`)}
              onClick={() => add("Moneyline", "Draw", game.ml_draw as number)}
            />
          </>
        )}
      </div>

      <Link
        to="/game/$gameId"
        params={{ gameId: game.id }}
        className="mt-1.5 flex items-center gap-0.5 text-[11px] font-semibold text-primary"
      >
        More wagers
        <ChevronRight className="size-3" aria-hidden />
      </Link>
    </article>
  );
}
