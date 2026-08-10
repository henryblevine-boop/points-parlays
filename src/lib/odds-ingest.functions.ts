import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { untyped } from "@/integrations/supabase/untyped";
import { teamAbbreviation } from "./team-abbreviations";
import { PLAYER_PROP_MARKETS } from "./prop-markets";

// Every league this app knows how to ingest -> The Odds API's sport key.
// MVP focus is NFL only (see ACTIVE_LEAGUES below) so the full API quota
// goes toward deep NFL coverage instead of spreading thin across sports.
// The rest stay defined here so re-enabling one later is a one-line change,
// not a rewrite.
const ALL_SPORT_KEYS: Record<string, string> = {
  NFL: "americanfootball_nfl",
  NBA: "basketball_nba",
  MLB: "baseball_mlb",
  NHL: "icehockey_nhl",
  MLS: "soccer_usa_mls",
  "La Liga": "soccer_spain_la_liga",
};

const ALL_FUTURES_SPORT_KEYS: Record<string, string> = {
  NFL: "americanfootball_nfl_super_bowl_winner",
  NBA: "basketball_nba_championship_winner",
  MLB: "baseball_mlb_world_series_winner",
  NHL: "icehockey_nhl_championship_winner",
  "La Liga": "soccer_spain_la_liga_winner",
};

const ACTIVE_LEAGUES = ["NFL"];

const SPORT_KEYS = Object.fromEntries(
  ACTIVE_LEAGUES.filter((l) => l in ALL_SPORT_KEYS).map((l) => [l, ALL_SPORT_KEYS[l]!]),
);
const FUTURES_SPORT_KEYS = Object.fromEntries(
  ACTIVE_LEAGUES.filter((l) => l in ALL_FUTURES_SPORT_KEYS).map((l) => [
    l,
    ALL_FUTURES_SPORT_KEYS[l]!,
  ]),
);

// Soccer leagues get a 3-way moneyline (Home/Draw/Away) instead of 2-way.
const SOCCER_LEAGUES = new Set(["MLS", "La Liga"]);

interface OddsApiOutcome {
  name: string;
  price: number;
  point?: number;
  description?: string;
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
  id: string;
  commence_time: string;
  home_team: string;
  away_team: string;
  bookmakers: OddsApiBookmaker[];
}
interface OddsApiFuturesEvent {
  title?: string;
  bookmakers: OddsApiBookmaker[];
}

const DAY_MS = 24 * 60 * 60 * 1000;
// Cap events queried for props per league -- each event needs its own API
// call, so this keeps a manual refresh from burning through the (limited)
// monthly quota. NFL-only now, so this can afford to cover most of a week's
// slate instead of just a few marquee games.
const MAX_PROP_EVENTS_PER_LEAGUE = 10;

async function ingestGames(
  supabaseAdmin: ReturnType<typeof untyped>,
  apiKey: string,
  errors: string[],
  debug: Array<{ league: string; status: number; fetched: number; upserted: number }>,
): Promise<number> {
  let upserted = 0;
  // Only board games starting inside this window -- The Odds API returns the
  // whole season for some sports, which would otherwise flood the slate.
  const windowEnd = Date.now() + 10 * DAY_MS;

  for (const [league, sportKey] of Object.entries(SPORT_KEYS)) {
    const url =
      `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/` +
      `?apiKey=${apiKey}&regions=us&markets=h2h,spreads,totals` +
      `&bookmakers=draftkings&oddsFormat=american`;

    const res = await fetch(url);
    if (!res.ok) {
      errors.push(`${league}: ${res.status} ${await res.text()}`);
      debug.push({ league, status: res.status, fetched: 0, upserted: 0 });
      continue;
    }

    const all = ((await res.json()) as OddsApiGame[]).sort((a, b) =>
      a.commence_time.localeCompare(b.commence_time),
    );
    let games = all.filter((g) => new Date(g.commence_time).getTime() <= windowEnd);

    // Off-season league (e.g. NFL in August): nothing starts within the
    // window, so board the opening slate -- the first upcoming game plus the
    // following week -- instead of showing an empty board.
    if (games.length === 0 && all.length > 0) {
      const firstMs = new Date(all[0]!.commence_time).getTime();
      games = all.filter((g) => new Date(g.commence_time).getTime() <= firstMs + 7 * DAY_MS);
    }

    let leagueUpserted = 0;
    const isSoccer = SOCCER_LEAGUES.has(league);

    for (const game of games) {
      const dk = game.bookmakers.find((b) => b.key === "draftkings");
      if (!dk) continue;

      const h2h = dk.markets.find((m) => m.key === "h2h");
      const spreads = dk.markets.find((m) => m.key === "spreads");
      const totals = dk.markets.find((m) => m.key === "totals");
      if (!h2h || !spreads || !totals) continue;

      const mlHome = h2h.outcomes.find((o) => o.name === game.home_team)?.price;
      const mlAway = h2h.outcomes.find((o) => o.name === game.away_team)?.price;
      const mlDraw = isSoccer ? h2h.outcomes.find((o) => o.name === "Draw")?.price : undefined;
      const spreadHome = spreads.outcomes.find((o) => o.name === game.home_team);
      const spreadAway = spreads.outcomes.find((o) => o.name === game.away_team);
      const over = totals.outcomes.find((o) => o.name === "Over");
      const under = totals.outcomes.find((o) => o.name === "Under");

      if (
        mlHome == null ||
        mlAway == null ||
        (isSoccer && mlDraw == null) ||
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
        ml_draw: mlDraw ?? null,
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
      leagueUpserted++;
    }

    debug.push({ league, status: res.status, fetched: games.length, upserted: leagueUpserted });
  }

  return upserted;
}

async function ingestFutures(
  supabaseAdmin: ReturnType<typeof untyped>,
  apiKey: string,
  errors: string[],
  debug: Array<{ league: string; status: number; fetched: number; upserted: number }>,
): Promise<number> {
  let upserted = 0;

  for (const [league, sportKey] of Object.entries(FUTURES_SPORT_KEYS)) {
    const url =
      `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/` +
      `?apiKey=${apiKey}&regions=us&markets=outrights&bookmakers=draftkings&oddsFormat=american`;

    const res = await fetch(url);
    if (!res.ok) {
      errors.push(`${league} futures: ${res.status} ${await res.text()}`);
      debug.push({ league: `${league} futures`, status: res.status, fetched: 0, upserted: 0 });
      continue;
    }

    const events = (await res.json()) as OddsApiFuturesEvent[];
    let leagueUpserted = 0;
    let fetchedCount = 0;

    for (const event of events) {
      const dk = event.bookmakers.find((b) => b.key === "draftkings");
      const outrights = dk?.markets.find((m) => m.key === "outrights");
      if (!outrights) continue;

      const title = event.title ?? `${league} Championship`;
      fetchedCount += outrights.outcomes.length;

      for (const outcome of outrights.outcomes) {
        const row = {
          sport: league,
          league_label: league,
          title,
          selection: outcome.name,
          odds: outcome.price,
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabaseAdmin
          .from("futures_markets")
          .upsert(row, { onConflict: "league_label,title,selection" });
        if (error) errors.push(`${league} futures ${outcome.name}: ${error.message}`);
        else {
          upserted++;
          leagueUpserted++;
        }
      }
    }

    debug.push({
      league: `${league} futures`,
      status: res.status,
      fetched: fetchedCount,
      upserted: leagueUpserted,
    });
  }

  return upserted;
}

async function ingestPlayerProps(
  supabaseAdmin: ReturnType<typeof untyped>,
  apiKey: string,
  errors: string[],
  debug: Array<{ league: string; status: number; fetched: number; upserted: number }>,
): Promise<number> {
  let upserted = 0;

  for (const [league, sportKey] of Object.entries(SPORT_KEYS)) {
    const markets = PLAYER_PROP_MARKETS[league];
    if (!markets) continue; // no prop markets configured for this league yet

    // Reuse the cheap h2h listing to find upcoming event ids, then only
    // fetch full props detail for a handful of the soonest games.
    const listUrl =
      `https://api.the-odds-api.com/v4/sports/${sportKey}/odds/` +
      `?apiKey=${apiKey}&regions=us&markets=h2h&bookmakers=draftkings&oddsFormat=american`;
    const listRes = await fetch(listUrl);
    if (!listRes.ok) {
      errors.push(`${league} props: ${listRes.status} ${await listRes.text()}`);
      debug.push({ league: `${league} props`, status: listRes.status, fetched: 0, upserted: 0 });
      continue;
    }

    const upcoming = ((await listRes.json()) as OddsApiGame[])
      .filter((g) => new Date(g.commence_time).getTime() > Date.now())
      .sort((a, b) => a.commence_time.localeCompare(b.commence_time))
      .slice(0, MAX_PROP_EVENTS_PER_LEAGUE);

    let leagueUpserted = 0;
    let fetchedCount = 0;
    const marketKeys = Object.keys(markets).join(",");

    for (const event of upcoming) {
      const propsUrl =
        `https://api.the-odds-api.com/v4/sports/${sportKey}/events/${event.id}/odds` +
        `?apiKey=${apiKey}&regions=us&markets=${marketKeys}&bookmakers=draftkings&oddsFormat=american`;
      const propsRes = await fetch(propsUrl);
      if (!propsRes.ok) {
        errors.push(
          `${league} props ${event.home_team}: ${propsRes.status} ${await propsRes.text()}`,
        );
        continue;
      }

      const detail = (await propsRes.json()) as OddsApiGame;
      const dk = detail.bookmakers.find((b) => b.key === "draftkings");
      if (!dk) continue;

      const { data: gameRow } = await supabaseAdmin
        .from("games")
        .select("id")
        .eq("home_team", event.home_team)
        .eq("away_team", event.away_team)
        .maybeSingle();
      if (!gameRow) continue; // game isn't boarded (yet) -- skip its props

      for (const market of dk.markets) {
        const label = markets[market.key];
        if (!label) continue;

        // Pair each player's Over/Under outcomes (matched by description).
        const byPlayer = new Map<
          string,
          { line?: number | undefined; over?: number | undefined; under?: number | undefined }
        >();
        for (const outcome of market.outcomes) {
          const player = outcome.description;
          if (!player) continue;
          const entry = byPlayer.get(player) ?? {};
          if (outcome.name === "Over") {
            entry.over = outcome.price;
            entry.line = outcome.point;
          } else if (outcome.name === "Under") {
            entry.under = outcome.price;
          }
          byPlayer.set(player, entry);
        }

        for (const [player, vals] of byPlayer) {
          fetchedCount++;
          if (vals.over == null || vals.under == null || vals.line == null) continue;

          const row = {
            game_id: gameRow.id,
            player_name: player,
            team_abbr: null,
            market: label,
            line: vals.line,
            over_odds: vals.over,
            under_odds: vals.under,
            updated_at: new Date().toISOString(),
          };

          const { error } = await supabaseAdmin
            .from("player_props")
            .upsert(row, { onConflict: "game_id,player_name,market" });
          if (error) errors.push(`${league} prop ${player}: ${error.message}`);
          else {
            upserted++;
            leagueUpserted++;
          }
        }
      }
    }

    debug.push({
      league: `${league} props`,
      status: 200,
      fetched: fetchedCount,
      upserted: leagueUpserted,
    });
  }

  return upserted;
}

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

    const errors: string[] = [];
    const debug: Array<{ league: string; status: number; fetched: number; upserted: number }> = [];

    const gamesUpserted = await ingestGames(supabaseAdmin, apiKey, errors, debug);
    const futuresUpserted = await ingestFutures(supabaseAdmin, apiKey, errors, debug);
    const propsUpserted = await ingestPlayerProps(supabaseAdmin, apiKey, errors, debug);

    return {
      upserted: gamesUpserted + futuresUpserted + propsUpserted,
      gamesUpserted,
      futuresUpserted,
      propsUpserted,
      errors,
      debug,
    };
  });
