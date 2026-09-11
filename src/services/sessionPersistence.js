import { highestId, nextId } from '@/domain/ids.js'
import { currentLocale, setLocale } from '@/i18n/index.js'
import { PHASES, useAppStore } from '@/stores/app.js'
import { useMatchStore } from '@/stores/match.js'
import { useMatchdayStore } from '@/stores/matchday.js'
import { useSetupStore } from '@/stores/setup.js'
import { clearSession, loadSession, saveSession } from './storage.js'

/**
 * Keeping the matchday across a reload, a closed tab, or a stray swipe back
 * out of the app.
 *
 * Everything the coach would miss is written to this device's own storage as
 * it happens: the match being played, the one just finished, and the day's
 * results so far. Opening the app again puts them back exactly where they were.
 *
 * A saved matchday belongs to its day. Opened on a later date, it is dropped:
 * nobody wants last Saturday's half-played match waiting for them.
 */

/** Bumped whenever the saved shape changes, so an old one is never misread. */
const VERSION = 1

/** From kickoff on, the screen itself is worth coming back to. */
const RESUMABLE_PHASES = [PHASES.LIVE, PHASES.SUMMARY, PHASES.STATS]

function localDay(timestamp) {
  const date = new Date(timestamp)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

function isUsable(saved, now) {
  return (
    saved?.version === VERSION &&
    Number.isFinite(saved.savedAt) &&
    localDay(saved.savedAt) === localDay(now) &&
    Array.isArray(saved.matchday) &&
    Array.isArray(saved.match?.slots) &&
    Array.isArray(saved.match?.players) &&
    typeof saved.setup === 'object'
  )
}

/**
 * Bring back today's matchday, if there is one. Returns true when the coach is
 * put straight back on a match screen rather than the start.
 */
export function resumeSession({ now = Date.now } = {}) {
  const saved = loadSession()
  const at = now()
  if (!isUsable(saved, at)) {
    clearSession()
    return false
  }

  const app = useAppStore()
  const match = useMatchStore()
  const matchday = useMatchdayStore()
  try {
    nextId.skipPast(highestId(saved))
    matchday.$patch({ matches: saved.matchday })
    if (!RESUMABLE_PHASES.includes(saved.phase)) return false

    setLocale(saved.locale)
    useSetupStore().$patch(saved.setup)
    match.restore(saved.match, Math.max(0, Math.floor((at - saved.savedAt) / 1000)))
    app.phase = saved.phase
    return true
  } catch {
    // Something saved that this version cannot read: start clean, not broken.
    clearSession()
    match.reset()
    matchday.clear()
    app.phase = PHASES.SPLASH
    return false
  }
}

/**
 * Save on every change. Changes arrive in bursts — a clock tick credits every
 * player on the field — so they are gathered into one write, made before the
 * browser can do anything else, including unload the page.
 */
export function keepSessionSaved({ now = Date.now } = {}) {
  const app = useAppStore()
  const setup = useSetupStore()
  const match = useMatchStore()
  const matchday = useMatchdayStore()
  let queued = false

  function save() {
    queued = false
    if (!RESUMABLE_PHASES.includes(app.phase) && !matchday.hasMatches) {
      clearSession()
      return
    }
    saveSession({
      version: VERSION,
      savedAt: now(),
      locale: currentLocale(),
      phase: app.phase,
      setup: setup.$state,
      match: match.snapshot(),
      matchday: matchday.matches,
    })
  }

  function schedule() {
    if (queued) return
    queued = true
    queueMicrotask(save)
  }

  ;[app, setup, match, matchday].forEach((store) =>
    store.$subscribe(schedule, { detached: true, flush: 'sync' }),
  )
}
