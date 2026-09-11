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

export function loadTeamName() {
  return safeGet(TEAM_NAME_KEY) || ''
}

export function saveTeamName(name) {
  return safeSet(TEAM_NAME_KEY, name)
}

/** The raw saved settings, or null. Validation is the caller's job. */
export function loadMatchSettings() {
  const raw = safeGet(MATCH_SETTINGS_KEY)
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function saveMatchSettings(settings) {
  return safeSet(MATCH_SETTINGS_KEY, JSON.stringify(settings))
}
