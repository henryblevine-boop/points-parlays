import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Copy } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BetSlipCard } from "@/components/bet-slip-card";
import { betsQuery, leagueQuery, leagueMembersQuery, profilesQuery } from "@/lib/data";
import { buildStandings } from "@/lib/standings";
import { formatPoints } from "@/lib/odds";

export const Route = createFileRoute("/_authenticated/groups/$leagueId")({
  head: () => ({
    meta: [
      { title: "League Standings — ParlayPals" },
      {
        name: "description",
        content: "Weekly standings, member records and recent bet slips for your ParlayPals league.",
      },
      { property: "og:title", content: "League Standings — ParlayPals" },
      {
        property: "og:description",
        content: "Weekly standings, records and recent bet slips for your league.",
      },
    ],
  }),
  component: LeaguePage,
});

function LeaguePage() {
  const { leagueId } = Route.useParams();
  const { data: league } = useQuery(leagueQuery(leagueId));
  const { data: memberIds = [] } = useQuery(leagueMembersQuery(leagueId));
  const { data: bets = [] } = useQuery(betsQuery({ leagueId }));
  const { data: profiles = [] } = useQuery(profilesQuery());

  const standings = buildStandings(bets, memberIds);
  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.username ?? "Member";
  const avatarOf = (id: string) => profiles.find((p) => p.id === id)?.avatar_url ?? undefined;

  return (
    <div className="space-y-5">
      <header>
        <Link to="/groups" className="text-xs text-muted-foreground hover:text-primary">
          ← All leagues
        </Link>
        <h1 className="mt-1 font-display text-xl font-extrabold">{league?.name ?? "League"}</h1>
        {league && (
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(league.invite_code);
              toast.success("Invite code copied");
            }}
            className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary"
          >
            <Copy className="size-3.5" aria-hidden /> Invite code {league.invite_code} ·{" "}
            {league.weekly_bet_limit} bets/week
          </button>
        )}
      </header>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">Standings</h2>
        <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {standings.map((row, i) => (
            <li key={row.userId} className="flex items-center gap-3 px-3 py-2.5">
              <span className="w-5 font-display text-sm font-bold text-muted-foreground">
                {i + 1}
              </span>
              <Avatar className="size-8">
                <AvatarImage src={avatarOf(row.userId)} alt="" />
                <AvatarFallback>{nameOf(row.userId).slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <Link
                  to="/profile/$userId"
                  params={{ userId: row.userId }}
                  className="truncate font-display text-sm font-bold hover:text-primary"
                >
                  {nameOf(row.userId)}
                </Link>
                <p className="text-xs text-muted-foreground">
                  {row.wins}-{row.losses} · {row.pending} pending
                </p>
              </div>
              <span
                className={
                  row.points > 0
                    ? "font-display font-bold tabular-nums text-win"
                    : row.points < 0
                      ? "font-display font-bold tabular-nums text-loss"
                      : "font-display font-bold tabular-nums text-muted-foreground"
                }
              >
                {formatPoints(row.points)}
              </span>
            </li>
          ))}
          {standings.length === 0 && (
            <li className="px-3 py-4 text-sm text-muted-foreground">No members yet.</li>
          )}
        </ol>
      </section>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">League activity</h2>
        {bets.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No bets placed in this league yet.
          </p>
        )}
        {bets.slice(0, 20).map((bet) => (
          <div key={bet.id} className="space-y-1">
            <p className="text-xs text-muted-foreground">{nameOf(bet.user_id)}</p>
            <BetSlipCard bet={bet} compact />
          </div>
        ))}
      </section>
    </div>
  );
}
