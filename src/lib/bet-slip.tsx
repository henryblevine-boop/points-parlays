import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { combineOdds, pointsIfLost, pointsIfWon } from "./odds";

export type SlipLeg = {
  key: string;
  game_id?: string | null;
  prop_id?: string | null;
  market: string;
  selection: string;
  line?: string | null;
  odds: number;
  matchup: string;
};

type BetSlipContextValue = {
  legs: SlipLeg[];
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleLeg: (leg: SlipLeg) => void;
  removeLeg: (key: string) => void;
  clear: () => void;
  hasLeg: (key: string) => boolean;
  combinedOdds: number;
  potentialPoints: number;
  riskPoints: number;
};

const BetSlipContext = createContext<BetSlipContextValue | null>(null);

export function BetSlipProvider({ children }: { children: ReactNode }) {
  const [legs, setLegs] = useState<SlipLeg[]>([]);
  const [open, setOpen] = useState(false);

  const value = useMemo<BetSlipContextValue>(() => {
    const combinedOdds = combineOdds(legs.map((l) => l.odds));
    return {
      legs,
      open,
      setOpen,
      toggleLeg: (leg) =>
        setLegs((prev) => {
          const exists = prev.some((l) => l.key === leg.key);
          if (exists) return prev.filter((l) => l.key !== leg.key);
          // one leg per game/prop market
          const filtered = prev.filter(
            (l) => !(l.matchup === leg.matchup && l.market === leg.market),
          );
          setOpen(true);
          return [...filtered, leg];
        }),
      removeLeg: (key) => setLegs((prev) => prev.filter((l) => l.key !== key)),
      clear: () => {
        setLegs([]);
        setOpen(false);
      },
      hasLeg: (key) => legs.some((l) => l.key === key),
      combinedOdds,
      potentialPoints: legs.length ? pointsIfWon(combinedOdds) : 0,
      riskPoints: legs.length ? pointsIfLost(combinedOdds) : 0,
    };
  }, [legs, open]);

  return <BetSlipContext.Provider value={value}>{children}</BetSlipContext.Provider>;
}

export function useBetSlip() {
  const ctx = useContext(BetSlipContext);
  if (!ctx) throw new Error("useBetSlip must be used inside BetSlipProvider");
  return ctx;
}
