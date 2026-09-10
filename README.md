# Melkein suunnitelma

**Fair playing time, without the paperwork.**

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
- **Rotation prompts** — `DUE OFF` for the outfield player with the most
  minutes, `DUE ON` for the least-rested player on the bench. A fixed
  goalkeeper is kept out of the maths entirely.
- **Current stint** — not just total minutes, but how long a player has been
  sitting on the bench *right now*, which is the number a coach actually gets
  asked about.
- **The shape on the pitch** — the lineup drawn as a formation, tap a player to
  pick them for a substitution.
- **Substitutions** — one-for-one applies instantly; multi-player changes ask
  who takes which position, and tapping a player already pencilled in elsewhere
  simply trades the two. When the numbers only allow one answer, it is filled
  in for you.
- **Match rules** — halves, match length, format size, goalkeeper handling,
  re-entry after a substitution, and an optional cap on total substitutions.
- **Score, scorers and cards** — logged against the match clock.
- **Full-time summary** — minutes per player, each measured against the squad
  average, and the spread between the most- and least-played player.
- **Season stats** — record, goals, top scorers, cards and total minutes across
  every match played in the session.

## Privacy

Everything stays on the device. There are no accounts, no servers, no cloud,
no database and no build-time or run-time analytics. Matches, players and stats
live only in the browser tab's memory. The single thing persisted is your team
name, in that browser's own `localStorage`, so you do not retype it every week.

The trade-off is deliberate and worth knowing: **close the tab and the match is
gone.** Keep the app open for the duration of the game.

## Getting started

```bash
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

The build output in `dist/` is fully static — any file host will serve it. The
Vite `base` is `./`, so it also works from a subdirectory.

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
│   ├── pitch.js         Where each position sits on the drawn pitch
│   ├── playingTime.js   Fairness: averages, deltas, spread
│   ├── rotation.js      DUE OFF / DUE ON hints
│   ├── scoring.js       Goals, cards and their tallies
│   ├── season.js        Immutable match records and season aggregation
│   ├── substitutions.js Limits, assignment and the swap rule
│   └── time.js          Formatting and numeric input handling
│
├── services/        Talking to the browser, defensively.
│   ├── storage.js       localStorage that cannot throw
│   └── ticker.js        A clock that measures elapsed time, not callbacks
│
├── stores/          Pinia. State and the transitions between states.
│   ├── app.js           Which screen we are on; the matchday flow
│   ├── setup.js         Format, rules, formation and squad
│   ├── match.js         The match being played right now
│   └── season.js        Finished matches
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

**Phases, not routes.** The app is a linear matchday: splash → team → setup →
lineup → live → summary → stats. All of it is in-memory, so a deep link would
land on an empty match. `stores/app.js` owns the phase and every transition;
`App.vue` is just a lookup table. The info page is the one detour, and it
returns wherever it came from.

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
time fairness, season aggregation, the pitch layout and the catch-up clock.
Components are deliberately thin enough not to need their own tests.

## Contributing and forking

Please do. This is free software under the [MIT licence](LICENSE) — use it,
change it, fork it, ship it, sell it. No warranty, no strings, no attribution
required (though it is always nice).

Good first additions, if you are looking for one: persisting a match across a
page reload, exporting a summary, and more stock formations.

## Credits

Vibe coded during a single practice session, with Claude, on a mobile phone, at
the side of the pitch.

By **Erkki Rajakoski** — [Studio Rajakoski](https://github.com/).

The original single-file prototype is kept in [`legacy/`](legacy/) for
reference; the app in `src/` supersedes it.
