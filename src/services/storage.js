/**
 * Thin, failure-tolerant wrapper around localStorage.
 *
 * Private browsing and locked-down mobile browsers throw on access rather than
 * returning null, and a coach on the touchline should never see the app die
 * because the team name could not be remembered.
 */
const TEAM_NAME_KEY = 'sortOfAPlanTeamName'

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
