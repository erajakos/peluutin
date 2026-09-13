import { PHASES } from '@/stores/app.js'

/**
 * The address bar, and the browser's own back gesture.
 *
 * Two things are wanted here, and only two. A coach who swipes back — the way
 * anyone leaves a screen on a phone — should move back through the app instead
 * of out of it. And the pages that are only pages, with nothing behind them,
 * should be openable by link: the instructions, what has been played, what the
 * app keeps.
 *
 * What is deliberately not wanted is a route as the source of truth. A match
 * lives in memory and on this device; no URL can conjure one up. So the app
 * says what the address is, never the other way round, and the back gesture
 * asks the app to go back a step rather than trusting where the address landed.
 */

/** Stable, language-independent, and never translated: these are addresses. */
const SLUGS = Object.freeze({
  [PHASES.SPLASH]: '',
  [PHASES.MENU]: 'menu',
  [PHASES.INFO]: 'about',
  [PHASES.HELP]: 'help',
  [PHASES.HISTORY]: 'matches',
  [PHASES.TEAMS]: 'teams',
  [PHASES.TEAM_SQUAD]: 'team',
  [PHASES.CHANGELOG]: 'changes',
  [PHASES.TEAM]: 'team',
  [PHASES.OPPONENT]: 'opponent',
  [PHASES.SETTINGS]: 'settings',
  [PHASES.SQUAD]: 'squad',
  [PHASES.LINEUP]: 'lineup',
  [PHASES.LIVE]: 'match',
  [PHASES.SUMMARY]: 'result',
  [PHASES.STATS]: 'today',
})

/**
 * Screens that stand on their own, and so can be arrived at by link.
 *
 * Everything else — naming a team, the settings, the squad, a lineup, a match,
 * its result, the day's stats — only means anything after the steps that come
 * before it. A link to one of those would open a screen with nothing behind
 * it, so it is refused and the app opens where it always does.
 */
const LINKABLE = [
  PHASES.SPLASH,
  PHASES.MENU,
  PHASES.INFO,
  PHASES.HELP,
  PHASES.HISTORY,
  PHASES.CHANGELOG,
  PHASES.TEAMS,
  PHASES.TEAM_SQUAD,
]

export function slugFor(phase) {
  return SLUGS[phase] ?? ''
}

export function phaseForSlug(slug) {
  const clean = String(slug ?? '')
    .replace(/^#\/?/, '')
    .replace(/\/+$/, '')
  return Object.keys(SLUGS).find((phase) => SLUGS[phase] === clean) ?? null
}

/** The phase a cold start at this address should open on, or null for the usual. */
export function landingPhase(hash) {
  const phase = phaseForSlug(hash)
  return phase && LINKABLE.includes(phase) ? phase : null
}

/**
 * Keep the address in step with the app, and turn the back gesture into a step
 * back inside it.
 *
 * @param {object} app the app store
 * @param {object} [win] the window, for tests
 * @returns {() => void} stops listening
 */
export function installUrlNavigation(app, win = globalThis.window) {
  if (!win?.history?.pushState) return () => {}

  const address = (phase) => `${win.location.pathname}${win.location.search}#/${slugFor(phase)}`

  // Arriving by link. A link to a screen that needs steps before it is not
  // followed — and the address is corrected, so it stops claiming otherwise.
  const landing = landingPhase(win.location.hash)
  if (landing && app.phase === PHASES.SPLASH) app.phase = landing
  win.history.replaceState({ phase: app.phase }, '', address(app.phase))

  let current = app.phase

  // Synchronous, so the address never lags a screen behind what is drawn.
  const stop = app.$subscribe(
    () => {
      if (app.phase === current) return
      current = app.phase
      win.history.pushState({ phase: app.phase }, '', address(app.phase))
    },
    { detached: true, flush: 'sync' },
  )

  /** Put the address back in step with the app, without adding an entry. */
  function pin() {
    current = app.phase
    win.history.replaceState({ phase: app.phase }, '', address(app.phase))
  }

  function onPopState(event) {
    // No state of ours: an address typed, or a link tapped, while the app is
    // open. Followed only from a screen that stands on its own, and only to
    // another — a stale bookmark must not take a coach off the pitch, nor out
    // of a squad half typed in.
    if (!event?.state) {
      const target = landingPhase(win.location.hash)
      const leavable = LINKABLE.includes(app.phase)
      if (target && leavable && target !== app.phase) app.goTo(target)
      pin()
      return
    }

    // Otherwise the back gesture: the app decides what a step back means.
    if (app.goBack()) {
      pin()
      return
    }

    // Nowhere to go — during a match, say. Stay where we are, and put the
    // entry back so the next swipe is not the one that leaves.
    win.history.pushState({ phase: app.phase }, '', address(app.phase))
  }

  win.addEventListener('popstate', onPopState)

  return () => {
    stop()
    win.removeEventListener('popstate', onPopState)
  }
}
