import type { ReactNode } from "react";
import { BarChart3, Radio, Ticket } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BetSlipCard } from "@/components/bet-slip-card";
import { PinBetButton } from "@/components/pin-bet-button";
import { ShareBetButton } from "@/components/share-bet-button";
import { Link } from "@tanstack/react-router";
import { EmptyState } from "@/components/empty-state";
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

  const pinned = bets.find((b) => b.is_pinned);
  const rest = bets.filter((b) => !b.is_pinned);

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
            {profile?.bio ?? (isSelf ? "Add a bio from your league profile." : "Solis-Fantasy member")}
          </p>
        </div>
        {headerAction}
      </header>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Points" value={formatPoints(points)} />
        <Stat label="Record" value={`${wins}-${losses}`} />
        <Stat label="Win rate" value={`${winRate}%`} />
      </dl>

      {isSelf && (
        <div className="grid grid-cols-2 gap-2">
          <Link
            to="/stats"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold hover:border-primary/60"
          >
            <BarChart3 className="size-4 text-primary" aria-hidden /> Season stats
          </Link>
          <Link
            to="/live"
            className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2.5 text-sm font-semibold hover:border-primary/60"
          >
            <Radio className="size-4 text-primary" aria-hidden /> Live tracker
          </Link>
        </div>
      )}

      {pinned && (
        <section className="space-y-2">
          <h2 className="font-display text-lg font-bold">Featured pick</h2>
          <BetSlipCard
            bet={pinned}
            action={
              <span className="flex items-center gap-2">
                <ShareBetButton bet={pinned} username={profile?.username ?? "solis"} />
                {isSelf && <PinBetButton userId={pinned.user_id} betId={pinned.id} isPinned />}
              </span>
            }
          />
        </section>
      )}

      <section className="space-y-2">
        <h2 className="font-display text-lg font-bold">Bet history</h2>
        {rest.length === 0 && (
          <EmptyState
            icon={Ticket}
            title="No bets yet"
            body={isSelf ? "Head to Home and build your first slip." : undefined}
          />
        )}
        {rest.map((bet) => (
          <BetSlipCard
            key={bet.id}
            bet={bet}
            action={
              <span className="flex items-center gap-2">
                <ShareBetButton bet={bet} username={profile?.username ?? "solis"} />
                {isSelf && <PinBetButton userId={bet.user_id} betId={bet.id} isPinned={false} />}
              </span>
            }
          />
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
