import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { untyped } from "@/integrations/supabase/untyped";
import { teamAbbreviation } from "./team-abbreviations";

// League label used throughout this app -> The Odds API's sport key.
const SPORT_KEYS: Record<string, string> = {
  NFL: "americanfootball_nfl",
  NBA: "basketball_nba",
  MLB: "baseball_mlb",
  NHL: "icehockey_nhl",
};

interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
}
interface OddsApiMarket {
  key: string;
  outcomes: OddsApiOutcome[];
}
interface OddsApiBookmaker {
  key: string;
  markets: OddsApiMarket[];
}
interface OddsApiGame {
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}

const DAY_MS = 24 * 60 * 60 * 1000;

// Any signed-in user can trigger a refresh -- this is a small friends app,
// not a public service, so we don't need per-role restrictions. It does
// need auth so an anonymous script can't burn the (rate-limited) API key.
export const refreshOdds = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const apiKey = process.env["THE_ODDS_API_KEY"];
    if (!apiKey) {
      throw new Error("THE_ODDS_API_KEY isn't configured. Add it as a secret in Lovable Cloud.");
    }

    const { supabaseAdmin: typedAdmin } = await import("@/integrations/supabase/client.server");
    const supabaseAdmin = untyped(typedAdmin);

    let upserted = 0;
    const errors: string[] = [];

    for (const [league, sportKey] of Object.entries(SPORT_KEYS)) {
      const url =
        `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/` +
        `?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals` +
        `&bookmakers=draftkings&oddsFormat=american`;

      const res = await fetch(url);
      if (!res.ok) {
        errors.push(`${league}: ${res.status} ${await res.text()}`);
        continue;
      }

      const games = (await res.json()) as OddsApiGame[];

      for (const game of games) {
        const dk = game.bookmakers.find((b) => b.key === "draftkings");
        if (!dk) continue;

        const h2h = dk.markets.find((m) => m.key === "h2h");
        const spreads = dk.markets.find((m) => m.key === "spreads");
        const totals = dk.markets.find((m) => m.key === "totals");
        if (!h2h || !spreads || !totals) continue;

        const mlHome = h2h.outcomes.find((o) => o.name === game.home_team)?.price;
        const mlAway = h2h.outcomes.find((o) => o.name === game.away_team)?.price;
        const spreadHome = spreads.outcomes.find((o) => o.name === game.home_team);
        const spreadAway = spreads.outcomes.find((o) => o.name === game.away_team);
        const over = totals.outcomes.find((o) => o.name === "Over");
        const under = totals.outcomes.find((o) => o.name === "Under");

        if (
          mlHome == null ||
          mlAway == null ||
          spreadHome?.point == null ||
          spreadAway?.price == null ||
          over?.point == null ||
          under?.price == null
        ) {
          continue;
        }

        const row = {
          sport: league,
          league_label: league,
          home_team: game.home_team,
          away_team: game.away_team,
          home_abbr: teamAbbreviation(game.home_team),
          away_abbr: teamAbbreviation(game.away_team),
          start_time: game.commence_time,
          spread_home: spreadHome.point,
          spread_home_odds: spreadHome.price,
          spread_away_odds: spreadAway.price,
          ml_home: mlHome,
          ml_away: mlAway,
          total_line: over.point,
          over_odds: over.price,
          under_odds: under.price,
          updated_at: new Date().toISOString(),
        };

        // Match an existing row for the same matchup within a day of this
        // start time so bet legs / props already pointing at this game's id
        // stay valid -- update in place rather than inserting a duplicate.
        const commenceMs = new Date(game.commence_time).getTime();
        const { data: existing } = await supabaseAdmin
          .from("games")
          .select("id")
          .eq("home_team", game.home_team)
          .eq("away_team", game.away_team)
          .gte("start_time", new Date(commenceMs - DAY_MS).toISOString())
          .lte("start_time", new Date(commenceMs + DAY_MS).toISOString())
          .maybeSingle();

        if (existing) {
          const { error } = await supabaseAdmin.from("games").update(row).eq("id", existing.id);
          if (error) errors.push(`${league} ${game.home_team}: ${error.message}`);
        } else {
          const { error } = await supabaseAdmin.from("games").insert(row);
          if (error) errors.push(`${league} ${game.home_team}: ${error.message}`);
        }
        upserted++;
      }
    }

    return { upserted, errors };
  });
