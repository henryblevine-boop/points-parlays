import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { formatOdds, formatPoints } from "@/lib/odds";
import type { Bet } from "@/lib/data";

export function BetSlipCard({
  bet,
  compact,
  className,
  action,
}: {
  bet: Bet;
  compact?: boolean;
  className?: string;
  action?: ReactNode;
}) {
  const won = bet.status === "won";
  const lost = bet.status === "lost";

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border bg-elevated",
        won && "border-win/60",
        lost && "border-loss/60",
        !won && !lost && "border-border",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between gap-2 px-3 py-2 text-xs font-semibold",
          won && "bg-win/15 text-win",
          lost && "bg-loss/15 text-loss",
          !won && !lost && "bg-muted text-muted-foreground",
        )}
      >
        <span className="uppercase tracking-wide">
          {bet.bet_legs.length > 1 ? `${bet.bet_legs.length}-Leg Parlay` : "Straight"} ·{" "}
          {formatOdds(bet.combined_odds)}
        </span>
        <span className="flex items-center gap-2 tabular-nums">
          {won ? "HIT" : lost ? "MISS" : "PENDING"}
          {bet.status !== "pending" ? ` ${formatPoints(bet.points_delta)}` : ""}
          {action}
        </span>
      </div>
      <ul className="divide-y divide-border">
        {bet.bet_legs.slice(0, compact ? 3 : undefined).map((leg) => (
          <li key={leg.id} className="flex items-center gap-2 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{leg.selection}</p>
              <p className="truncate text-xs text-muted-foreground">
                {leg.market} · {leg.matchup}
              </p>
            </div>
            <span className="font-display text-xs tabular-nums text-muted-foreground">
              {formatOdds(leg.odds)}
            </span>
          </li>
        ))}
      </ul>
      {compact && bet.bet_legs.length > 3 && (
        <p className="px-3 py-1.5 text-xs text-muted-foreground">
          +{bet.bet_legs.length - 3} more legs
        </p>
      )}
    </div>
  );
}
