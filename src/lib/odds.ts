/**
 * American odds helpers. All values are integers like -110 or +250.
 * Points scoring: win at +X => +X points. Win at -Y => +100 points.
 * Lose at +X => -X points. Lose at -Y => -Y points.
 */

export function americanToDecimal(odds: number): number {
  if (odds > 0) return 1 + odds / 100;
  return 1 + 100 / Math.abs(odds);
}

export function decimalToAmerican(decimal: number): number {
  if (decimal >= 2) return Math.round((decimal - 1) * 100);
  return -Math.round(100 / (decimal - 1));
}

export function combineOdds(legs: number[]): number {
  if (legs.length === 0) return 0;
  if (legs.length === 1) return legs[0]!;
  const decimal = legs.reduce((acc, o) => acc * americanToDecimal(o), 1);
  return decimalToAmerican(decimal);
}

/** Points gained if the bet wins. */
export function pointsIfWon(odds: number): number {
  return odds > 0 ? odds : 100;
}

/** Points lost (positive number) if the bet loses. */
export function pointsIfLost(odds: number): number {
  return odds > 0 ? odds : Math.abs(odds);
}

export function formatOdds(odds: number): string {
  return odds > 0 ? `+${odds}` : `${odds}`;
}

export function formatSpread(spread: number): string {
  return spread > 0 ? `+${spread}` : `${spread}`;
}

export function formatPoints(points: number): string {
  return points > 0 ? `+${points}` : `${points}`;
}
