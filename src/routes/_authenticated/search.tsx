import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search as SearchIcon } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GameCard } from "@/components/game-card";
import { PropRow } from "@/components/prop-row";
import { gamesQuery, trendingPropsQuery, searchProfilesQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/search")({
  head: () => ({
    meta: [
      { title: "Search Games, Props & Players — ParlayPals" },
      {
        name: "description",
        content: "Find games, player props and other ParlayPals members to follow and compete with.",
      },
      { property: "og:title", content: "Search — ParlayPals" },
      {
        property: "og:description",
        content: "Find games, player props and other members across ParlayPals.",
      },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const { data: games = [] } = useQuery(gamesQuery());
  const { data: props = [] } = useQuery(trendingPropsQuery(100));
  const { data: users = [] } = useQuery(searchProfilesQuery(term));

  const matchedGames = games.filter((g) =>
    `${g.home_team} ${g.away_team} ${g.home_abbr} ${g.away_abbr} ${g.league_label}`
      .toLowerCase()
      .includes(term),
  );
  const matchedProps = props.filter((p) =>
    `${p.player_name} ${p.market} ${p.team_abbr ?? ""}`.toLowerCase().includes(term),
  );

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-extrabold">Search</h1>
      <div className="relative">
        <SearchIcon
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden
        />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Teams, players, users…"
          maxLength={60}
          className="pl-9"
          aria-label="Search games, users and props"
        />
      </div>

      <Tabs defaultValue="games">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="games">Games</TabsTrigger>
          <TabsTrigger value="props">Props</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
        </TabsList>

        <TabsContent value="games" className="space-y-2 pt-3">
          {matchedGames.length === 0 && <Empty label="No games matched." />}
          {matchedGames.map((g) => (
            <GameCard key={g.id} game={g} />
          ))}
        </TabsContent>

        <TabsContent value="props" className="space-y-2 pt-3">
          {matchedProps.length === 0 && <Empty label="No props matched." />}
          {matchedProps.map((p) => (
            <PropRow
              key={p.id}
              prop={p}
              matchup={
                p.games ? `${p.games.away_abbr} @ ${p.games.home_abbr}` : (p.team_abbr ?? "Prop")
              }
            />
          ))}
        </TabsContent>

        <TabsContent value="users" className="space-y-2 pt-3">
          {term.length < 2 && <Empty label="Type at least 2 characters to find users." />}
          {term.length >= 2 && users.length === 0 && <Empty label="No users matched." />}
          {users.map((u) => (
            <Link
              key={u.id}
              to="/profile/$userId"
              params={{ userId: u.id }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/60"
            >
              <Avatar className="size-9">
                <AvatarImage src={u.avatar_url ?? undefined} alt="" />
                <AvatarFallback>{u.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate font-display text-sm font-bold">{u.username}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {u.bio ?? "ParlayPals member"}
                </p>
              </div>
            </Link>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
      {label}
    </p>
  );
}
