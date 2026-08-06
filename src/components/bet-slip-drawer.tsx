import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Trash2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBetSlip } from "@/lib/bet-slip";
import { formatOdds } from "@/lib/odds";
import { myLeaguesQuery } from "@/lib/data";
import { placeBet } from "@/lib/bets.functions";

export function BetSlipDrawer({ userId }: { userId: string }) {
  const { legs, open, setOpen, removeLeg, clear, combinedOdds, potentialPoints, riskPoints } =
    useBetSlip();
  const [leagueId, setLeagueId] = useState<string>("none");
  const queryClient = useQueryClient();
  const { data: leagues = [] } = useQuery(myLeaguesQuery(userId));
  const submit = useServerFn(placeBet);

  const mutation = useMutation({
    mutationFn: () =>
      submit({
        data: {
          leagueId: leagueId === "none" ? null : leagueId,
          legs: legs.map(({ key: _key, ...leg }) => leg),
        },
      }),
    onSuccess: () => {
      toast.success("Bet placed", { description: `${formatOdds(combinedOdds)} · pending` });
      clear();
      queryClient.invalidateQueries({ queryKey: ["bets"] });
    },
    onError: (error: Error) => toast.error(error.message || "Could not place that bet"),
  });

  return (
    <>
      {legs.length > 0 && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed inset-x-3 bottom-[4.75rem] z-40 flex items-center justify-between rounded-xl bg-primary px-4 py-3 text-primary-foreground shadow-lg"
        >
          <span className="font-display text-sm font-bold">
            {legs.length} {legs.length === 1 ? "selection" : "selections"}
          </span>
          <span className="font-display text-sm font-bold tabular-nums">
            {formatOdds(combinedOdds)} · +{potentialPoints} pts
          </span>
        </button>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="border-border bg-card">
          <DrawerHeader className="flex-row items-center justify-between">
            <DrawerTitle className="font-display">Bet Slip</DrawerTitle>
            {legs.length > 0 && (
              <button
                type="button"
                onClick={clear}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-loss"
              >
                <Trash2 className="size-3.5" aria-hidden /> Clear
              </button>
            )}
          </DrawerHeader>

          <div className="max-h-[45vh] overflow-y-auto px-4">
            {legs.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Tap any odds to start building a bet.
              </p>
            ) : (
              <ul className="space-y-2">
                {legs.map((leg) => (
                  <li
                    key={leg.key}
                    className="flex items-center gap-2 rounded-lg border border-border bg-elevated px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{leg.selection}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {leg.market} · {leg.matchup}
                      </p>
                    </div>
                    <span className="font-display text-sm tabular-nums">
                      {formatOdds(leg.odds)}
                    </span>
                    <button
                      type="button"
                      aria-label="Remove leg"
                      onClick={() => removeLeg(leg.key)}
                      className="text-muted-foreground hover:text-loss"
                    >
                      <X className="size-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <DrawerFooter className="gap-3">
            {legs.length > 0 && (
              <>
                <div className="flex items-center justify-between rounded-lg bg-elevated px-3 py-2 text-sm">
                  <span className="text-muted-foreground">
                    {legs.length > 1 ? `${legs.length}-leg parlay` : "Straight bet"}
                  </span>
                  <span className="font-display font-bold tabular-nums">
                    {formatOdds(combinedOdds)}
                  </span>
                </div>
                <div className="flex gap-2 text-center text-xs">
                  <div className="flex-1 rounded-lg bg-win/10 px-2 py-2 text-win">
                    Win <span className="block font-display text-base font-bold">+{potentialPoints}</span>
                  </div>
                  <div className="flex-1 rounded-lg bg-loss/10 px-2 py-2 text-loss">
                    Lose <span className="block font-display text-base font-bold">-{riskPoints}</span>
                  </div>
                </div>
                <Select value={leagueId} onValueChange={setLeagueId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a league" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Practice bet (no league)</SelectItem>
                    {leagues.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full font-display font-bold"
                  disabled={mutation.isPending}
                  onClick={() => mutation.mutate()}
                >
                  {mutation.isPending ? "Placing…" : "Place bet"}
                </Button>
                <p className="text-center text-[11px] text-muted-foreground">
                  Free to play. No real money wagering. Must be 18+.
                </p>
              </>
            )}
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}
