import type { ReactNode } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BetSlipCard } from "@/components/bet-slip-card";
import { formatPoints } from "@/lib/odds";
import type { Bet, Profile } from "@/lib/data";

export function ProfileView({
  profile,
  bets,
  isSelf,
  headerAction,
}: {
  profile: Profile | null;
  bets: Bet[];
  isSelf?: boolean;
  headerAction?: ReactNode;
}) {
  const settled = bets.filter((b) => b.status !== "pending");
  const wins = settled.filter((b) => b.status === "won").length;
  const losses = settled.filter((b) => b.status === "lost").length;
  const points = settled.reduce((sum, b) => sum + b.points_delta, 0);
  const winRate = settled.length ? Math.round((wins / settled.length) * 100) : 0;

  return (
    <div className="space-y-5">
      <header className="flex items-center gap-3">
        <Avatar className="size-14">
          <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
          <AvatarFallback>{(profile?.username ?? "??").slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-display text-xl font-extrabold">
            {profile?.username ?? (isSelf ? "You" : "Member")}
          </h1>
          <p className="text-sm text-muted-foreground">
            {profile?.bio ?? (isSelf ? "Add a bio from your league profile." : "ParlayPals member")}
          </p>
        </div>
        {headerAction}
      </header>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Points" value={formatPoints(points)} />
        <Stat label="Record" value={`${wins}-${losses}`} />
        <Stat label="Win rate" value={`${winRate}%`} />
      </dl>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">Bet history</h2>
        {bets.length === 0 && (
          <p className="rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
            No bets yet.
          </p>
        )}
        {bets.map((bet) => (
          <BetSlipCard key={bet.id} bet={bet} />
        ))}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-2 py-3">
      <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="font-display text-lg font-extrabold tabular-nums">{value}</dd>
    </div>
  );
}
