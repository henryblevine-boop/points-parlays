import { OddsButton } from "./odds-button";
import { useBetSlip } from "@/lib/bet-slip";
import type { PlayerProp } from "@/lib/data";

export function PropRow({ prop, matchup }: { prop: PlayerProp; matchup: string }) {
  const { toggleLeg, hasLeg } = useBetSlip();
  const market = `${prop.market}`;

  const add = (side: "Over" | "Under", odds: number) =>
    toggleLeg({
      key: `prop:${prop.id}:${side}`,
      prop_id: prop.id,
      game_id: prop.game_id,
      market: `${prop.player_name} ${market}`,
      selection: `${side} ${prop.line}`,
      line: String(prop.line),
      odds,
      matchup,
    });

  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-3">
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-600">{prop.player_name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {prop.team_abbr} · {market} {prop.line}
        </p>
      </div>
      <div className="flex w-32 gap-1.5">
        <OddsButton
          label={`O ${prop.line}`}
          odds={prop.over_odds}
          active={hasLeg(`prop:${prop.id}:Over`)}
          onClick={() => add("Over", prop.over_odds)}
        />
        <OddsButton
          label={`U ${prop.line}`}
          odds={prop.under_odds}
          active={hasLeg(`prop:${prop.id}:Under`)}
          onClick={() => add("Under", prop.under_odds)}
        />
      </div>
    </div>
  );
}
