// The Odds API's per-sport player prop market keys we ask DraftKings for,
// mapped to the human-readable label this app stores/displays.
export const PLAYER_PROP_MARKETS: Record<string, Record<string, string>> = {
  // NFL is the MVP focus -- go as deep as The Odds API's DraftKings feed
  // allows. player_*_alternate variants and single-sided markets (anytime
  // TD, first TD scorer) have a different outcome shape and aren't included
  // here; the ingest expects a clean Over/Under pair per market.
  NFL: {
    player_pass_yds: "Passing Yards",
    player_pass_tds: "Passing TDs",
    player_pass_completions: "Pass Completions",
    player_pass_attempts: "Pass Attempts",
    player_pass_interceptions: "Interceptions Thrown",
    player_pass_longest_completion: "Longest Completion",
    player_rush_yds: "Rushing Yards",
    player_rush_attempts: "Rushing Attempts",
    player_rush_longest: "Longest Rush",
    player_reception_yds: "Receiving Yards",
    player_receptions: "Receptions",
    player_reception_longest: "Longest Reception",
    player_kicking_points: "Kicking Points",
    player_field_goals: "Field Goals Made",
    player_tackles_assists: "Tackles + Assists",
    player_sacks: "Sacks",
  },
  NBA: {
    player_points: "Points",
    player_rebounds: "Rebounds",
    player_assists: "Assists",
    player_threes: "Three-Pointers Made",
  },
  MLB: {
    batter_hits: "Hits",
    batter_home_runs: "Home Runs",
    batter_total_bases: "Total Bases",
    pitcher_strikeouts: "Strikeouts",
  },
  NHL: {
    player_points: "Points",
    player_goals: "Goals",
    player_shots_on_goal: "Shots on Goal",
  },
};
