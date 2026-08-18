import { createFileRoute, Link } from "@tanstack/react-router";
import { Trophy, ListChecks, Users, TrendingUp, Flame, Shield } from "lucide-react";

import logo from "@/assets/logo.png";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Solis-Fantasy — Free-to-Play Sports Betting Leagues" },
      {
        name: "description",
        content:
          "Fantasy-style betting leagues with friends. Place simulated bets, score points on American odds, and win bragging rights. Free to play, 18+.",
      },
      { property: "og:title", content: "Solis-Fantasy — Free-to-Play Sports Betting Leagues" },
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
    body: "Live NFL spreads, moneylines, totals and 15 player prop markets, straight off DraftKings' board.",
  },
  {
    icon: Trophy,
    title: "Points, not cash",
    body: "Hit a +250 parlay, bank 250 points. Miss it and it costs you 250. Nothing ever leaves your wallet.",
  },
  {
    icon: Users,
    title: "Private leagues",
    body: "Weekly bet limits, live standings, and a feed built for bad-beat receipts and victory laps.",
  },
];

const steps = [
  {
    icon: Users,
    title: "Start a league",
    body: "Create one in seconds and send friends the invite code — or join theirs.",
  },
  {
    icon: TrendingUp,
    title: "Build your slip",
    body: "Tap into real NFL lines, stack legs into a parlay, and lock it in before kickoff.",
  },
  {
    icon: Flame,
    title: "Settle the week",
    body: "Standings update automatically. Post the hits, roast the bad beats.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-5 py-5">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Solis-Fantasy logo" width={32} height={32} className="size-8" />
          <span className="font-display text-xl font-extrabold">
            Solis-<span className="text-primary">Fantasy</span>
          </span>
        </div>
        <Button asChild size="sm" variant="ghost">
          <Link to="/auth">Log in</Link>
        </Button>
      </header>

      <main className="mx-auto max-w-3xl px-5 pb-20">
        <section className="relative py-10">
          <div
            className="pointer-events-none absolute -top-24 left-1/2 h-72 w-[36rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl"
            aria-hidden
          />
          <div className="relative">
            <p className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <Flame className="size-3.5" aria-hidden />
              NFL is live · 100% free to play
            </p>
            <h1 className="font-display text-4xl font-extrabold leading-[1.05] sm:text-5xl">
              Fantasy leagues,
              <br />
              <span className="text-primary">sportsbook rules.</span>
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Place simulated bets on tonight's slate, score points off real American odds, and
              settle it in your league standings every week.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" className="font-display text-base font-bold">
                <Link to="/auth" search={{ tab: "signup" }}>
                  Get started free
                </Link>
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Shield className="size-3.5 text-primary" aria-hidden /> No deposits, ever
              </span>
              <span className="flex items-center gap-1.5">
                <TrendingUp className="size-3.5 text-primary" aria-hidden /> Real DraftKings odds
              </span>
            </div>
          </div>
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
            >
              <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="size-4.5 text-primary" aria-hidden />
              </div>
              <h2 className="font-display text-base font-bold">{f.title}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
            </div>
          ))}
        </section>

        <section className="mt-14">
          <h2 className="font-display text-xl font-extrabold">How it works</h2>
          <ol className="mt-4 space-y-3">
            {steps.map((s, i) => (
              <li
                key={s.title}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary font-display text-sm font-extrabold text-primary-foreground">
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-sm font-bold">{s.title}</h3>
                  <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-6 text-center">
          <h2 className="font-display text-xl font-extrabold">Your league is waiting.</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-muted-foreground">
            Free forever. Takes about a minute to set up.
          </p>
          <Button asChild size="lg" className="mt-4 font-display font-bold">
            <Link to="/auth" search={{ tab: "signup" }}>
              Create your league
            </Link>
          </Button>
        </section>

        <p className="mt-10 text-center text-[11px] text-muted-foreground">
          Free to play. No real money wagering. Must be 18+.
        </p>
      </main>
    </div>
  );
}
