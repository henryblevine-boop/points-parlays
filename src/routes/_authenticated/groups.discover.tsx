import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Globe2, Users } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useSessionUser } from "@/hooks/use-session-user";
import { supabase } from "@/integrations/supabase/client";
import { myLeaguesQuery, publicLeaguesQuery } from "@/lib/data";

export const Route = createFileRoute("/_authenticated/groups/discover")({
  head: () => ({
    meta: [
      { title: "Public Leagues — Solis-Fantasy" },
      {
        name: "description",
        content:
          "Join an open Solis-Fantasy public league in one tap — no invite code and no friends required.",
      },
      { property: "og:title", content: "Public Leagues — Solis-Fantasy" },
      {
        property: "og:description",
        content: "Open leagues anyone can join — no invite code needed.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DiscoverPage,
});

function DiscoverPage() {
  const { user } = useSessionUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: leagues = [], isLoading } = useQuery(publicLeaguesQuery());
  const { data: mine = [] } = useQuery({
    ...myLeaguesQuery(user?.id ?? ""),
    enabled: Boolean(user),
  });
  const myIds = new Set(mine.map((l) => l.id));

  const join = useMutation({
    mutationFn: async (leagueId: string) => {
      if (!user) throw new Error("Sign in first");
      const { error } = await supabase
        .from("league_members")
        .insert({ league_id: leagueId, user_id: user.id });
      if (error) throw error;
      return leagueId;
    },
    onSuccess: (leagueId) => {
      toast.success("You're in!");
      queryClient.invalidateQueries({ queryKey: ["my-leagues"] });
      queryClient.invalidateQueries({ queryKey: ["public-leagues"] });
      void navigate({ to: "/groups/$leagueId", params: { leagueId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <header>
        <Link to="/groups" className="text-xs text-muted-foreground hover:text-primary">
          ← My leagues
        </Link>
        <h1 className="mt-1 flex items-center gap-2 font-display text-xl font-extrabold">
          <Globe2 className="size-5 text-primary" aria-hidden /> Public leagues
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Open leagues anyone can join. No invite code, no friends required.
        </p>
      </header>

      {isLoading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      )}

      {!isLoading && leagues.length === 0 && (
        <EmptyState
          icon={Globe2}
          title="No public leagues yet"
          body="Create a league and flip on 'Make this league public' so anyone can join it."
        />
      )}

      <ul className="space-y-2">
        {leagues.map((league) => {
          const joined = myIds.has(league.id);
          return (
            <li
              key={league.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold">{league.name}</p>
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Users className="size-3.5" aria-hidden />
                  {league.memberCount} {league.memberCount === 1 ? "member" : "members"} ·{" "}
                  {league.weekly_bet_limit} bets/week
                </p>
                {league.description && (
                  <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                    {league.description}
                  </p>
                )}
              </div>
              {joined ? (
                <Link
                  to="/groups/$leagueId"
                  params={{ leagueId: league.id }}
                  className="text-xs font-semibold text-primary"
                >
                  Open
                </Link>
              ) : (
                <Button
                  size="sm"
                  onClick={() => join.mutate(league.id)}
                  disabled={join.isPending}
                  className="font-display font-bold"
                >
                  Join
                </Button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
