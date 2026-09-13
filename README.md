# Peluutin

A small, offline web app for a youth football coach standing on the touchline.
It tracks how long every player has actually been on the pitch, tells you who
is due off and who is due on, and handles the score, the goals and the cards
along the way — so at full time you can answer "was that fair?" with a number
instead of a shrug.

Finnish and English. No accounts, no servers, no tracking.

---

## What it does

- **Playing-time clock** — per-player minutes, counted only while a player is
  actually in a position on the field.
- **Rotation prompts** — `DUE OFF` for the outfield player who has been on
  longest without a break, `DUE ON` for the bench player with the fewest
  minutes so far. The two sides answer different questions on purpose: who
  needs a rest now, and who is owed minutes. A fixed goalkeeper is kept out of
  the maths entirely, and is never prompted to come off. Changing the keeper is
  possible when the afternoon calls for it, but never suggested: the pitch asks
  once, and only when you reach for them yourself.
- **Current spell** — every shirt, on the pitch and on the touchline, shows how
  long that player has been on — or sitting — *this time*, which is the number
  that says who needs a breather. Match totals belong to the summary, and are
  on each shirt's own tooltip meanwhile.
- **The shape on the pitch** — the lineup drawn as a formation, tap a player to
  pick them for a substitution.
- **A way back** — a substitution can be taken back for a few seconds after it
  is made, spell and allowance included; the offer then goes on its own, so a
  change made on purpose is never nagged at. Tapping the clock opens a minute
  either way, for when it was started late.
- **Substitutions** — one-for-one applies instantly; multi-player changes ask
  who takes which position, and tapping a player already pencilled in elsewhere
  simply trades the two. When the numbers only allow one answer, it is filled
  in for you.
- **Match rules** — match length and whether it is played in halves, how many
  players a side (the keeper among them), re-entry after a substitution, and an
  optional cap on total substitutions.
- **Score, scorers and cards** — logged against the match clock, and logged
  without leaving the pitch: the goal buttons sit under the scoreline, and the
  scorer is named by tapping that player where they already stand.
- **Full-time summary** — the final score, every goal with the scoreline it
  produced, and minutes per player measured against the outfield average.
- **The captain** — named on the lineup screen and marked with an armband
  wherever that player appears: on the pitch, in the result, in the day's
  stats, and in a match read back weeks later.
- **The day's stats** — wins, draws and losses in form-guide colours, goals,
  top scorers, cards and total minutes across every match played that day.
- **Played matches** — every match this device has played, filed by the day it
  was played on. Open one for its scorers, its cards and everyone's minutes.
  Last Saturday is still there next Saturday.
- **The screen stays on during a match** — no unlocking the phone every time
  you want the clock. The browser's wake lock is asked for while the live
  screen is open and released at full time; where a browser does not offer it,
  everything else still works.
- **Nothing lost to a stray swipe** — the squad is remembered from week to
  week, and a match in progress survives a reload, a closed tab or an
  accidental back: open the app again and it is exactly where it was, the
  clock caught up with the time away.

## Privacy

Everything stays on the device. There are no accounts, no servers, no cloud,
no database and no build-time or run-time analytics. What is kept is kept in
that browser's own `localStorage`, and only so you do not re-enter it every
week: your team name, how you play the match (length, halves, format,
formation, rules), your squad's names, the language you use it in, the matches
you have played, and the match in progress — the last one so an interrupted
match, or one still being set up, can pick up where it left off. The app also
asks the browser to keep that storage rather than treat it as something to
clear when the device runs short of room; where the browser refuses, or has
run out of room anyway, the oldest matches are the first to go. Names you have
had in a squad before are remembered with them, so a player typed in again is
the same player and keeps their minutes. A saved
matchday is dropped once the day is over.

*Tietoja & tietosuoja* has a button that wipes all of it and returns the app to
its defaults; the squad screen can clear just the players.

Nothing is fetched from anywhere else either: the fonts are bundled with the
app rather than loaded from a font service, so opening Peluutin makes no
request to any third party.

## Getting started

```bash
git clone git@github.com:erajakos/peluutin.git
cd peluutin
npm install
npm run dev        # http://localhost:5173
```

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the unit tests once |
| `npm run test:watch` | Unit tests in watch mode |
| `npm run lint` | ESLint over the whole project |
| `npm run format` | Prettier over `src/` and `tests/` |
| `npm run generate-pwa-assets` | Regenerate the app icons from `public/icon.svg` |
| `npm run changelog` | Rewrite `CHANGELOG.md` from `src/changelog.js` |

The build output in `dist/` is fully static — any file host will serve it. The
Vite `base` is `./`, so it also works from a subdirectory. It must be served
over HTTPS (or `localhost`) for the app to be installable.

## Installing as an app

Peluutin is a Progressive Web App. Once opened, it can be installed to the
home screen and then works with **no connection** — useful on a pitch with poor
reception.

- **Android / Chrome / Edge:** the start screen shows an *Asenna sovellukseksi*
  button when the browser can install it; the browser menu works too.
- **iPhone / iPad:** open it in Safari, tap *Share*, then *Add to Home Screen*.
  Safari offers no install prompt, so the info page explains this instead.

How it is put together, in [`vite.config.js`](vite.config.js):

- **Everything is precached** by the service worker — code, styles, icons and
  the self-hosted fonts — so an installed app opens fully offline.
- **Updates never reload the page under a coach.** A match would come back
  after a reload, but a lineup half picked would not, and nobody wants the
  screen to blink on the touchline. A new version activates in the background
  as soon as it has downloaded; the page is only reloaded onto it if the coach
  is still on the start screen, and otherwise the next launch simply opens the
  new version.
- **Icons** are generated from one source, [`public/icon.svg`](public/icon.svg),
  by `npm run generate-pwa-assets` ([`pwa-assets.config.js`](pwa-assets.config.js)).
  Maskable and Apple icons get padding and the pitch green behind them, so the
  platforms' own cropping never cuts into the ball.

## Versions

The version this build is, and what every version brought with it, live in one
place: [`src/changelog.js`](src/changelog.js). The app shows it under *Tietoja →
Mitä uutta* in the reader's own language, [`CHANGELOG.md`](CHANGELOG.md) is
generated from it, and a test keeps it in step with `package.json`. Releases are
grouped by what they did for the coach rather than listed change by change.

## How the code is organised

The guiding rule is that **match rules do not know about Vue, and components do
not know about match rules.** Anything that could be argued about on the
touchline — who is due off, whether a substitution is legal, how fair the
minutes were — lives in `src/domain/` as plain functions over plain data, and is
unit tested there.

```
src/
├── domain/          Pure match rules. No Vue, no browser, no side effects.
│   ├── formations.js    Stock formations per outfield count
│   ├── ids.js           One shared id sequence for every entity
│   ├── lineup.js        Building slots and working out the bench
│   ├── history.js       Played matches, gathered into the days they were played
│   ├── pitch.js         Where each position sits on the drawn pitch
│   ├── plan.js          A substitution being put together, before it happens
│   ├── playingTime.js   Fairness: averages and deltas
│   ├── rotation.js      DUE OFF / DUE ON hints
│   ├── scoring.js       Goals, cards and their tallies
│   ├── matchday.js      Immutable match records and the day's aggregation
│   ├── substitutions.js Limits, assignment and the swap rule
│   └── time.js          Formatting and numeric input handling
│
├── services/        Talking to the browser, defensively.
│   ├── storage.js              localStorage that cannot throw
│   ├── settingsPersistence.js  Remembers how the match is played
│   ├── rosterPersistence.js    Remembers the squad
│   ├── historyPersistence.js   Remembers every match played
│   ├── persistentStorage.js    Asks the browser not to clear any of it
│   ├── urlNavigation.js        The address bar, and the back gesture
│   ├── sessionPersistence.js   Brings back today's matches after a reload
│   ├── installPrompt.js        The browser's install offer, kept for later
│   ├── wakeLock.js             Keeps the screen on while a match is on
│   └── ticker.js               A clock that measures elapsed time, not callbacks
│
├── stores/          Pinia. State and the transitions between states.
│   ├── app.js           Which screen we are on; the matchday flow
│   ├── setup.js         Format, rules, formation and squad
│   ├── match.js         The match being played right now
│   ├── matchday.js      Finished matches of the day in progress
│   └── history.js       Every match played, kept between visits
│
├── i18n/            Finnish and English, one file per locale.
│   ├── index.js         `t()`, locale state, position translation
│   ├── positions.js     Position and formation names
│   └── locales/         fi.js, en.js
│
├── components/      Presentation, grouped by the screen they serve.
│   ├── ui/              Buttons, panels, fields, badges
│   ├── setup/  lineup/  live/  summary/  stats/
│
├── views/           One component per phase of the matchday.
└── assets/styles/   Design tokens and the shared global layer.
```

### A few decisions worth knowing

**Phases, not routes.** The app is a linear matchday: splash → menu → team →
setup → lineup → live → summary → stats, with the menu's three other doors —
played matches, how it works, about — as detours that return where they came
from. `stores/app.js` owns the phase; nothing else decides where to go next.

**The address follows the app, never the other way round.** `services/
urlNavigation.js` names each screen in the URL so the browser's back gesture
moves inside the app rather than out of it, and so the pages that stand on
their own — `#/help`, `#/matches`, `#/about`, `#/changes` — can be opened by
link. A link to anything that needs steps before it (a lineup, a match, a
result) is refused and the address corrected: no URL can conjure up a match
that is not being played. During a match, or a squad half typed in, address
changes are refused outright, so a stale bookmark cannot take a coach off the
pitch. A deep link into the middle of it would land
on an empty match, so there are no URLs to link to. `stores/app.js` owns the
phase and every transition; `App.vue` is just a lookup table. The info page is
the one detour, and it returns wherever it came from.

**Saved as it happens.** From kickoff on, every change is written to
`localStorage` (gathered into one write per burst, since a clock tick touches
every player). Opening the app again the same day goes straight back to the
live match, the summary or the day's stats. A clock that was running is caught
up by the time away — the match did not stop because the page did. Saved
players keep their ids, so the same child is the same row in the day's stats.

**Slots own positions, players fill them.** A substitution changes who is in a
slot, never the shape. That is what lets the pitch drawing, the rotation hints
and the minutes all stay consistent through a change.

**Positions have a key and a label.** The key is canonical English
(`Left Back`) and drives the pitch layout; the label is what the coach sees and
can rename freely. Renaming a position never breaks the drawing, and switching
language never overwrites the coach's own wording.

**The clock measures elapsed time.** Browsers throttle or suspend timers in a
backgrounded tab — which is exactly where a phone in a pocket puts this app.
`services/ticker.js` therefore measures wall-clock deltas and catches up on
resume, rather than counting interval callbacks and quietly losing minutes.

**Fairness excludes a fixed goalkeeper.** A keeper who plays the whole match by
design would drag the average down and make every outfield player look
short-changed, so they are reported separately.

## Testing

```bash
npm test
```

The tests cover the domain layer and the match store — the rotation hints, the
substitution rules including limits and re-entry, the swap behaviour, playing-
time fairness, the day's aggregation, the pitch layout and the catch-up clock —
and what is remembered between visits: settings, squad, and a match resumed
after a reload.
Components are deliberately thin enough not to need their own tests.

## Contributing and forking

Please do. This is free software under the [MIT licence](LICENSE) — use it,
change it, fork it, ship it, sell it. No warranty, no strings, no attribution
required (though it is always nice).

Good first additions, if you are looking for one: exporting a summary, and
more stock formations.

## Credits

Vibe coded during my son's football practice, with Claude, on a mobile phone,
at the side of the pitch.

By **Erkki Rajakoski** — [Studio Rajakoski](https://github.com/erajakos).

The best ideas came from the touchline, from coaches using it in real matches:

- **Kristiina (LPS)** — pushed for seeing the lineup on the pitch and making
  changes by dragging, and has found the bugs.
- **Taina (LPS)** — wanted the screen to stay on for the whole match, and
  playing time shown for the current spell rather than the whole game.

