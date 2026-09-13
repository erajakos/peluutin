/**
 * Thin, failure-tolerant wrapper around localStorage.
 *
 * Private browsing and locked-down mobile browsers throw on access rather than
 * returning null, and a coach on the touchline should never see the app die
 * because the team name could not be remembered.
 */
/*
 * These keys predate the app's current name, and must stay as they are:
 * renaming them would silently lose every coach's remembered team and settings.
 */
const TEAM_NAME_KEY = 'sortOfAPlanTeamName'
const MATCH_SETTINGS_KEY = 'sortOfAPlanMatchSettings'
// Newer keys carry the current name; they too must never be renamed.
const ROSTER_KEY = 'peluutinRoster'
const SESSION_KEY = 'peluutinSession'
const DRAG_HINT_KEY = 'peluutinDragHintSeen'
const KNOWN_PLAYERS_KEY = 'peluutinKnownPlayers'
const HISTORY_KEY = 'peluutinHistory'
const LANGUAGE_KEY = 'peluutinLanguage'

function safeGet(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeSet(key, value) {
  try {
    window.localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}

function safeRemove(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Nothing to do: if storage cannot be reached, there is nothing in it either.
  }
}

function loadJson(key) {
  const raw = safeGet(key)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function loadTeamName() {
  return safeGet(TEAM_NAME_KEY) || ''
}

export function saveTeamName(name) {
  return safeSet(TEAM_NAME_KEY, name)
}

/** The raw saved settings, or null. Validation is the caller's job. */
export function loadMatchSettings() {
  return loadJson(MATCH_SETTINGS_KEY)
}

export function saveMatchSettings(settings) {
  return safeSet(MATCH_SETTINGS_KEY, JSON.stringify(settings))
}

/**
 * The squad, as `{ id, name }` with the name as typed. Anything malformed is
 * dropped rather than trusted: this is read before the app has even drawn.
 */
export function loadRoster() {
  const saved = loadJson(ROSTER_KEY)
  if (!Array.isArray(saved)) return []
  return saved.filter(
    (player) =>
      player &&
      Number.isInteger(player.id) &&
      typeof player.name === 'string' &&
      player.name.trim(),
  )
}

export function saveRoster(players) {
  return safeSet(ROSTER_KEY, JSON.stringify(players))
}

/**
 * Every player this device has known, so one taken out of the squad and typed
 * in again comes back as themselves rather than as a stranger with the same
 * name — which would split their minutes across two rows in the day's stats.
 */
export function loadKnownPlayers() {
  const saved = loadJson(KNOWN_PLAYERS_KEY)
  if (!Array.isArray(saved)) return []
  return saved.filter(
    (player) =>
      player &&
      Number.isInteger(player.id) &&
      typeof player.name === 'string' &&
      player.name.trim(),
  )
}

export function saveKnownPlayers(players) {
  return safeSet(KNOWN_PLAYERS_KEY, JSON.stringify(players))
}

/** The saved matchday, or null. Validation is the caller's job. */
export function loadSession() {
  return loadJson(SESSION_KEY)
}

export function saveSession(session) {
  return safeSet(SESSION_KEY, JSON.stringify(session))
}

export function clearSession() {
  safeRemove(SESSION_KEY)
}

/**
 * Every match this device has played, for the list of played games. Anything
 * malformed is dropped: a broken record must not take the list down with it.
 */
export function loadHistory() {
  const saved = loadJson(HISTORY_KEY)
  if (!Array.isArray(saved)) return []
  return saved.filter(
    (entry) =>
      entry &&
      Number.isFinite(entry.playedAt) &&
      typeof entry.opponent === 'string' &&
      Number.isInteger(entry.usScore) &&
      Number.isInteger(entry.opponentScore) &&
      Array.isArray(entry.players),
  )
}

/**
 * Saved oldest-first, so a device that has run out of room loses the matches
 * nobody is looking at any more rather than the list as a whole.
 */
export function saveHistory(entries) {
  let keep = entries
  while (keep.length) {
    if (safeSet(HISTORY_KEY, JSON.stringify(keep))) return true
    // Storage refused it — almost always the quota. Drop the oldest and retry.
    keep = keep.slice(Math.max(1, Math.ceil(keep.length / 10)))
  }
  return safeSet(HISTORY_KEY, '[]')
}

/** The language chosen last time, so the app opens in it. */
export function loadLanguage() {
  return safeGet(LANGUAGE_KEY) || ''
}

export function saveLanguage(code) {
  return safeSet(LANGUAGE_KEY, code)
}

/**
 * Whether the coach has been shown how a change is made. Once is enough: it is
 * an introduction, not advice, and nobody wants it before every match.
 */
export function hasSeenDragHint() {
  return safeGet(DRAG_HINT_KEY) === '1'
}

export function markDragHintSeen() {
  return safeSet(DRAG_HINT_KEY, '1')
}

/** Forget everything this app has ever kept on the device. */
export function clearAllSaved() {
  ;[
    TEAM_NAME_KEY,
    MATCH_SETTINGS_KEY,
    ROSTER_KEY,
    SESSION_KEY,
    DRAG_HINT_KEY,
    KNOWN_PLAYERS_KEY,
    HISTORY_KEY,
    LANGUAGE_KEY,
  ].forEach(safeRemove)
}
