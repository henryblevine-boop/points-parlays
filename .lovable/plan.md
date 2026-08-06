# ParlayPals — Free-to-Play Social Betting League

A mobile-first, dark-mode sportsbook-style app where users place simulated bets for points, compete in private leagues, and post about their hits and bad beats. No real money anywhere.

Branding: name **ParlayPals**, generated logo mark, dark charcoal UI with an electric-teal accent, green for wins, red for losses. No sportsbook trademarks.

## Backend (Lovable Cloud)

Email/password auth with an 18+ confirmation checkbox at sign-up. Tables:

- `profiles` — username, avatar, bio, aggregate stats
- `leagues` — name, invite code, weekly bet limit, commissioner
- `league_members` — membership + season/weekly points
- `bets` + `bet_legs` — each bet stores its legs (game/prop, market, line, American odds), combined odds, status (pending / won / lost), points delta
- `games`, `props` — placeholder slate data, shaped so a live odds API can replace it later
- `posts`, `likes`, `comments`, `friendships`
- Storage bucket for avatars

Row-level security throughout: users read league data they belong to, edit only their own bets/posts/profile; league settings editable only by the commissioner. Seeded demo slate (NFL, NBA, MLB, NHL games + player props) and a few demo posts so the app is populated on first load.

## Scoring and bet logic

- Win at +X → +X points; lose → -X points.
- Win at -Y → +100 points; lose → -Y points.
- Parlays: legs converted to decimal, multiplied, converted back to American odds; that combined number drives the points.
- Bets lock once the game start time passes.
- A demo settle control (league commissioner / own bets) marks bets won or lost; a server function applies points to the bet, the user's stats, and league standings atomically.
- Weekly bet limit enforced server-side against the league setting.

## Screens (5 bottom tabs)

1. **Home** — sportsbook slate: sport filter chips, game cards with tappable spread / moneyline / total buttons, trending props row. Tapping odds opens a slide-up bet slip drawer: legs list, straight vs parlay, combined odds, projected points, submit.
2. **Search** — one search field, three tabs: Games (matchup → full game odds page), Users (profile → add friend), Player Props (player → over/under props).
3. **Social Hub** — feed with All / Friends / My Leagues filters, composer that can attach one of your settled or pending bets, rendered as a bet-slip card (green hit / red bad beat), likes and comments.
4. **My Groups** — league list with member count and your rank; league detail with standings table, "bets remaining this week", settings panel (commissioner-editable), recent league activity. Create League and Join by invite code.
5. **Profile** — avatar upload, username, editable bio, stats (total points, W/L, best hit, win %, streak), full bet history, friends list, settings with log out and the disclaimer.

## Routing and technical notes

- Public: `/` marketing-lite landing with sign-in CTA, `/auth`.
- Protected under `_authenticated`: `/home`, `/search`, `/social`, `/groups`, `/groups/$leagueId`, `/profile`, `/profile/$userId`, `/game/$gameId`.
- Persistent bottom tab bar in the authenticated layout; bet slip is global state (context) so any screen can add legs.
- All writes go through TanStack `createServerFn` with auth middleware; odds math lives in a shared pure module with unit-testable helpers.
- Per-route SEO metadata; semantic design tokens in `src/styles.css` (no hardcoded colors).
- Footer/settings disclaimer: "Free to play. No real money wagering. Must be 18+."

## Build order

1. Enable Cloud, schema + RLS + seed data, auth screens with age gate.
2. Design system, tab shell, odds math module.
3. Home + bet slip + game detail.
4. Groups (create/join/standings/settings/limits) + settle-bet demo flow.
5. Social hub, search, profile.
