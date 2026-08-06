import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Plus, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { myLeaguesQuery } from "@/lib/data";
import { useSessionUser } from "@/hooks/use-session-user";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/groups/")({
  head: () => ({
    meta: [
      { title: "My Leagues — ParlayPals" },
      {
        name: "description",
        content: "Create or join a private ParlayPals league, set weekly bet limits and track standings.",
      },
      { property: "og:title", content: "My Leagues — ParlayPals" },
      {
        property: "og:description",
        content: "Create or join private leagues and track weekly standings.",
      },
    ],
  }),
  component: GroupsPage,
});

function randomCode() {
  return Array.from({ length: 6 }, () =>
    "ABCDEFGHJKLMNPQRSTUVWXYZ23456789".charAt(Math.floor(Math.random() * 32)),
  ).join("");
}

function GroupsPage() {
  const { user } = useSessionUser();
  const queryClient = useQueryClient();
  const { data: leagues = [] } = useQuery({
    ...myLeaguesQuery(user?.id ?? ""),
    enabled: Boolean(user),
  });

  const [name, setName] = useState("");
  const [limit, setLimit] = useState("5");
  const [code, setCode] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  const create = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      const trimmed = name.trim();
      if (trimmed.length < 3) throw new Error("League name must be at least 3 characters");
      const weekly = Number(limit);
      if (!Number.isInteger(weekly) || weekly < 1 || weekly > 50)
        throw new Error("Weekly bet limit must be between 1 and 50");
      const { data, error } = await supabase
        .from("leagues")
        .insert({
          name: trimmed,
          invite_code: randomCode(),
          commissioner_id: user.id,
          weekly_bet_limit: weekly,
        })
        .select("id")
        .single();
      if (error) throw error;
      const { error: mErr } = await supabase
        .from("league_members")
        .insert({ league_id: data.id, user_id: user.id });
      if (mErr) throw mErr;
    },
    onSuccess: () => {
      toast.success("League created");
      setName("");
      setCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my-leagues"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const join = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in first");
      const { data, error } = await supabase
        .from("leagues")
        .select("id")
        .eq("invite_code", code.trim().toUpperCase())
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error("No league found with that invite code");
      const { error: mErr } = await supabase
        .from("league_members")
        .insert({ league_id: data.id, user_id: user.id });
      if (mErr) throw mErr;
    },
    onSuccess: () => {
      toast.success("You're in!");
      setCode("");
      setJoinOpen(false);
      queryClient.invalidateQueries({ queryKey: ["my-leagues"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-xl font-extrabold">My leagues</h1>

      <div className="flex gap-2">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="flex-1 font-display font-bold">
              <Plus className="size-4" aria-hidden /> Create
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">New league</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="league-name">League name</Label>
                <Input
                  id="league-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="league-limit">Weekly bet limit</Label>
                <Input
                  id="league-limit"
                  type="number"
                  min={1}
                  max={50}
                  value={limit}
                  onChange={(e) => setLimit(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={() => create.mutate()} disabled={create.isPending}>
                Create league
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="flex-1">
              Join with code
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Join a league</DialogTitle>
            </DialogHeader>
            <div className="space-y-1.5">
              <Label htmlFor="invite-code">Invite code</Label>
              <Input
                id="invite-code"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={6}
                placeholder="ABC123"
              />
            </div>
            <DialogFooter>
              <Button onClick={() => join.mutate()} disabled={join.isPending}>
                Join
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {leagues.length === 0 && (
        <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
          You're not in a league yet. Create one and share the invite code with friends.
        </p>
      )}

      <ul className="space-y-2">
        {leagues.map((league) => (
          <li key={league.id}>
            <Link
              to="/groups/$leagueId"
              params={{ leagueId: league.id }}
              className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 hover:border-primary/60"
            >
              <Trophy className="size-5 text-primary" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-sm font-bold">{league.name}</p>
                <p className="text-xs text-muted-foreground">
                  {league.weekly_bet_limit} bets/week · code {league.invite_code}
                </p>
              </div>
              <button
                type="button"
                aria-label="Copy invite code"
                onClick={(e) => {
                  e.preventDefault();
                  void navigator.clipboard.writeText(league.invite_code);
                  toast.success("Invite code copied");
                }}
                className="text-muted-foreground hover:text-primary"
              >
                <Copy className="size-4" aria-hidden />
              </button>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
