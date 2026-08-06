import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ListChecks, Users } from "lucide-react";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "ParlayPals — Free-to-Play Sports Betting Leagues" },
      {
        name: "description",
        content:
          "Fantasy-style betting leagues with friends. Place simulated bets, score points on American odds, and win bragging rights. Free to play, 18+.",
      },
      { property: "og:title", content: "ParlayPals — Free-to-Play Sports Betting Leagues" },
      {
        property: "og:description",
        content:
          "Fantasy-style betting leagues with friends. Simulated bets, real odds, points and bragging rights only.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: ListChecks,
    title: "Build real parlays",
    body: "Spreads, moneylines, totals and player props across NFL, NBA, MLB and NHL.",
  },
  {
    icon: Trophy,
    title: "Points, not cash",
    body: "Hit a +250 parlay, bank 250 points. Miss it and it costs you 250.",
  },
  {
    icon: Users,
    title: "Private leagues",
    body: "Weekly bet limits, live standings, and a feed built for bad-beat receipts.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <img src={logo} alt="ParlayPals logo" width={32} height={32} className="size-8" />
          <span className="font-display text-xl font-extrabold">
            Parlay<span className="text-primary">Pals</span>
          </span>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link to="/auth">Log in</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-16">
        <section className="py-10">
          <p className="mb-3 inline-flex rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            100% free to play · No deposits ever
          </p>
          <h1 className="font-display text-4xl font-extrabold leading-tight sm:text-5xl">
            Fantasy leagues,
            <br />
            <span className="text-primary">sportsbook rules.</span>
          </h1>
          <p className="mt-4 max-w-md text-muted-foreground">
            Place simulated bets on tonight's slate, score points off American odds, and settle it
            in your league standings every week.
          </p>
          <div className="mt-6 flex gap-3">
            <Button asChild className="font-display font-bold">
              <Link to="/auth">Create your league</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth">I have an account</Link>
            </Button>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {features.map((f) => (
            <div key={f.title} className="rounded-xl border border-border bg-card p-4">
              <f.icon className="mb-3 size-5 text-primary" aria-hidden />
              <h2 className="font-display text-base font-bold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <p className="mt-10 text-center text-[11px] text-muted-foreground">
          Free to play. No real money wagering. Must be 18+.
        </p>
      </main>
    </div>
  );
}
