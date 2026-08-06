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
    <div className="flex items-center gap-2 border-b border-border bg-card px-3 py-2.5 last:border-b-0">
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold">{prop.player_name}</p>
        <p className="truncate text-[11px] text-muted-foreground">
          {prop.team_abbr} · {market}
        </p>
      </div>
      <div className="grid w-[142px] grid-cols-2 gap-1.5">
        <OddsButton
          line={`O ${prop.line}`}
          label={`Over ${prop.line} ${market}`}
          odds={prop.over_odds}
          active={hasLeg(`prop:${prop.id}:Over`)}
          onClick={() => add("Over", prop.over_odds)}
        />
        <OddsButton
          line={`U ${prop.line}`}
          label={`Under ${prop.line} ${market}`}
          odds={prop.under_odds}
          active={hasLeg(`prop:${prop.id}:Under`)}
          onClick={() => add("Under", prop.under_odds)}
        />
      </div>

    </div>
  );
}
