# Changelog

What changed in each version, in the words the app itself shows under
_Tietoja → Mitä uutta_. Generated from [`src/changelog.js`](src/changelog.js) by
`npm run changelog`; edit that file, not this one.

## 1.9 — A screen to trust

_2026-09-14_

- At half time every player’s current spell starts again, so the change prompts are right from the first minute of the second half.
- A goal logged for the wrong team can be taken back straight after.
- The undo says which change or goal it will undo.
- The phone gives a short buzz when a change is made (Android).

## 1.8 — One move to make a change

_2026-09-14_

- A substitution happens the moment a player is dropped into place — there is no separate confirming any more.
- A change made by mistake can be undone straight after.

## 1.7 — More than one team

_2026-09-13_

- Teams can be added and switched from the Team row on the menu, and each keeps its own players, edited in the same place.
- Setting up a match only asks who turned up. Leaving someone out of a match does not take them out of the team.
- Played matches and stats belong to the team that played them.
- Leaving a scorer unrecorded is said plainly — “Don’t record” rather than “Unknown”.

## 1.6 — Eyes on the game

_2026-09-13_

- Logging a goal no longer leaves the match screen: the buttons sit under the score, and the scorer is tapped on the pitch.
- A goal credited to a substitute is asked about first.
- A player can be dragged straight onto the substitute you want in their place — no more suggestion arriving at the wrong moment.
- The captain wears a C everywhere: in the lineup, on the pitch, in the result, in the day’s stats and in old matches.
- Pages carry a back control at the top as well, and one press is enough to leave.
- The browser’s back gesture moves inside the app rather than out of a match. The instructions and played matches can be opened by link.

## 1.5 — A front door and a memory

_2026-09-13_

- The app opens onto a menu: start a match, played matches, how it works, and about.
- Played matches are kept by date. Open one for its scorers, its cards and everyone’s minutes.
- A short guide explains how a match runs from first whistle to last.
- Everything is kept on the device for as long as the browser allows — including a match still being set up, and the language you use.
- Fixed: a player removed and typed in again became a new person and appeared twice in the stats.
- Fixed: a substitution could send on a different player than the one chosen.

## 1.4 — Changes by dragging

_2026-09-12_

- The pitch and the bench share one view: a change is made by dragging a player from one to the other.
- Changes are planned first and confirmed after — several at once, with nothing happening until you confirm.
- Players walk to their new places once confirmed, so the change can be seen happening.
- A player can come off even when there is nobody on the bench to replace them.
- The goalkeeper questions left the settings: the number of players always counts the keeper.

## 1.3 — Room to be wrong

_2026-09-12_

- The clock can be nudged a minute either way, for when it was started or stopped late.
- A substitution just made can be taken back.
- The goalkeeper can be changed, even one meant to play the whole match.

## 1.2 — On the touchline

_2026-09-12_

- The screen stays awake for as long as the match is on.
- Each shirt shows the current spell: how long that player has been on, or sitting, right now.
- The change prompt follows the current spell rather than total minutes — a player just brought on is never flagged.
- Positions have proper short codes (GK, PM, CB…).

## 1.1 — Nothing is lost

_2026-09-11_

- The squad is remembered from week to week, and can be cleared in one go.
- An interrupted match carries on, even if the app is closed or the browser goes back. A running clock catches up on the time away.
- Wins, draws and losses are told apart by colour and mark.
- Everything kept on the device can be wiped from the privacy page.

## 1.0 — Peluutin

_2026-09-11_

- The app was named Peluutin and rebuilt: the clock, the lineup on the pitch, substitutions and playing time.
- A match can be played in two halves, with the coach deciding when the half turns.
- Goals with their scorers, and yellow and red cards.
- Match settings are remembered for next time.
- It can be installed on a phone and works with no connection.
