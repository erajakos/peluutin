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

/** Forget everything this app has ever kept on the device. */
export function clearAllSaved() {
  ;[TEAM_NAME_KEY, MATCH_SETTINGS_KEY, ROSTER_KEY, SESSION_KEY].forEach(safeRemove)
}
