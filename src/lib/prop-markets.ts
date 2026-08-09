// The Odds API's per-sport player prop market keys we ask DraftKings for,
// mapped to the human-readable label this app stores/displays.
export const PLAYER_PROP_MARKETS: Record<string, Record<string, string>> = {
  NFL: {
    player_pass_yds: "Passing Yards",
    player_pass_tds: "Passing TDs",
    player_rush_yds: "Rushing Yards",
    player_reception_yds: "Receiving Yards",
    player_receptions: "Receptions",
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
