# Points & Parlays

Lovable Prompt: Social Sports Betting League App (Free-to-Play)

Build a free-to-play social sports betting app — like fantasy football, but for sports betting. No real money is involved anywhere. Users place simulated bets using American odds, and points are awarded or deducted based on those odds: hitting a +250 parlay earns 250 points; losing it costs 250 points. Users compete in private leagues with weekly standings.

Core Concept

100% free to play. No deposits, no cash prizes, no entry fees. Points and bragging rights only.

Users join or create leagues (like ESPN Fantasy). Each league has a commissioner/manager.

Each league has a weekly bet limit per user (e.g., 5 bets/week), adjustable by the league manager.

Bets can be straight bets or parlays, built from game lines (spread, moneyline, over/under) and player props.

Scoring: win a bet at +X odds → gain X points. Lose it → lose X points. For negative odds (e.g., -150), winning gains 100 points and losing costs 150 points (standard American odds payout logic, expressed in points).

Weekly and season-long standings per league.

Navigation: 5 Bottom Tabs

1. Home

Looks and feels like a sportsbook homepage (DraftKings-style layout, but original branding — do NOT use DraftKings name, logos, or colors).

Shows today's slate of games across major sports (NFL, NBA, MLB, NHL) with tappable odds buttons for spread, moneyline, and total.

Tapping odds adds selections to a bet slip (slide-up drawer) where users can combine legs into a parlay, see combined odds and potential points, and submit the bet.

Featured/trending props section.

Use realistic placeholder odds data structured so a live odds API can be swapped in later.

2. Search

Universal search with three filter tabs: Games, Users, Player Props.

Games: search by team or matchup, tap through to full odds for that game.

Users: search by username, view their profile, add as friend.

Player Props: search by player name, see available props (points, rebounds, passing yards, etc.) with over/under odds.

3. Social Hub

Twitter-style feed where users post about bets.

Users can attach a bet slip (a hit parlay, or a bad beat) to a post — rendered as a styled bet slip card showing the legs, odds, and result (green for hits, red for bad beats).

Posts support text, likes, and comments.

Feed filters: All, Friends, My Leagues.

4. My Groups

List of leagues the user belongs to, each showing league name, member count, and user's current rank.

Tapping a league opens a league detail page with:

Standings table (rank, username, avatar, weekly points, total points, record)

"Bets remaining this week" indicator for the current user

League settings (visible to all, editable only by the manager): weekly bet limit, league name, scoring info

Recent league activity (bets placed by members)

"Create League" and "Join League" (via invite code) buttons.

5. Profile

Profile picture (upload/change), username, editable bio.

Stats: total points, win/loss record, best hit (highest odds won), win %, current streak.

Bet history list (all past bets with legs, odds, result, points gained/lost).

Friends list.

Settings (edit profile, log out).

Additional Requirements

Auth: email/password sign-up and login. Age confirmation checkbox (18+) at sign-up.

Persistent data: users, profiles, leagues, memberships, bets, posts, likes, comments (use Supabase).

Pending bets lock once the game starts; results are settled and points applied when games end (for now, include an admin/demo way to mark bets as won/lost so scoring can be tested).

Bet slip logic must correctly compute combined parlay odds from individual leg odds (American odds).

Clean, modern dark-mode sportsbook aesthetic with green for wins and red for losses. Original branding — invent an app name and logo, no sportsbook trademarks.

Mobile-first responsive design.

Include a small disclaimer in the footer/settings: "Free to play. No real money wagering. Must be 18+."

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/3c74be60-a893-43a5-9771-e230b3ae6dfd).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
