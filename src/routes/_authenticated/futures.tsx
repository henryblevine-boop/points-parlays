import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import { OddsButton } from "@/components/odds-button";
import { Skeleton } from "@/components/ui/skeleton";
import { futuresQuery, type FuturesMarket } from "@/lib/data";
import { useBetSlip } from "@/lib/bet-slip";

export const Route = createFileRoute("/_authenticated/futures")({
  head: () => ({
    meta: [
      { title: "Futures — ParlayPals" },
      {
        name: "description",
        content:
          "Season-long futures: championship winners and more, across every sport on the board.",
      },
    ],
  }),
  component: FuturesPage,
});

function groupMarkets(markets: FuturesMarket[]) {
  const byLeague = new Map<string, Map<string, FuturesMarket[]>>();
  for (const m of markets) {
    const byTitle = byLeague.get(m.league_label) ?? new Map<string, FuturesMarket[]>();
    const list = byTitle.get(m.title) ?? [];
    list.push(m);
    byTitle.set(m.title, list);
    byLeague.set(m.league_label, byTitle);
  }
  return byLeague;
}

function FuturesPage() {
  const { data: markets, isLoading } = useQuery(futuresQuery());
  const { toggleLeg, hasLeg } = useBetSlip();

  const grouped = markets ? groupMarkets(markets) : new Map<string, Map<string, FuturesMarket[]>>();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-xl font-extrabold">Futures</h1>
        <p className="text-sm text-muted-foreground">
          Season-long bets — lock these in before things kick off.
        </p>
      </div>

      {isLoading && [0, 1].map((i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}

      {!isLoading && grouped.size === 0 && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          No futures on the board yet. Try refreshing odds from Home.
        </p>
      )}

      {Array.from(grouped.entries()).map(([league, byTitle]) => (
        <section key={league} className="space-y-3">
          <h2 className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground">
            {league}
          </h2>
          {Array.from(byTitle.entries()).map(([title, options]) => (
            <div key={title} className="overflow-hidden rounded-xl border border-border bg-card">
              <h3 className="border-b border-border px-3 py-2 font-display text-sm font-bold">
                {title}
              </h3>
              {options.map((o) => {
                const key = `futures:${o.id}`;
                return (
                  <div
                    key={o.id}
                    className="flex items-center justify-between gap-2 border-b border-border px-3 py-2 last:border-b-0"
                  >
                    <p className="min-w-0 truncate text-[13px] font-semibold">{o.selection}</p>
                    <div className="w-[68px] shrink-0">
                      <OddsButton
                        label={`${o.selection} — ${title}`}
                        odds={o.odds}
                        active={hasLeg(key)}
                        onClick={() =>
                          toggleLeg({
                            key,
                            market: "Futures",
                            selection: o.selection,
                            odds: o.odds,
                            matchup: `${league} · ${title}`,
                          })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </section>
      ))}
    </div>
  );
}
