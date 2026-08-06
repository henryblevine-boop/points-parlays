import type { Bet } from "./data";

export type StandingRow = {
  userId: string;
  points: number;
  wins: number;
  losses: number;
  pending: number;
};

export function buildStandings(bets: Bet[], memberIds: string[]): StandingRow[] {
  const map = new Map<string, StandingRow>();
  for (const id of memberIds) {
    map.set(id, { userId: id, points: 0, wins: 0, losses: 0, pending: 0 });
  }
  for (const bet of bets) {
    const row =
      map.get(bet.user_id) ??
      ({ userId: bet.user_id, points: 0, wins: 0, losses: 0, pending: 0 } as StandingRow);
    if (bet.status === "won") {
      row.wins += 1;
      row.points += bet.points_delta;
    } else if (bet.status === "lost") {
      row.losses += 1;
      row.points += bet.points_delta;
    } else {
      row.pending += 1;
    }
    map.set(bet.user_id, row);
  }
  return [...map.values()].sort((a, b) => b.points - a.points || b.wins - a.wins);
}
