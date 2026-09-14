/**
 * A short buzz in the hand when something has happened.
 *
 * Substitutions are made the moment a player is dropped, with no second step,
 * so the phone says so without being looked at. Android honours this; iPhones
 * do not offer vibration to web pages, and there it is simply nothing.
 */
export function buzz(pattern = 30, { navigator = globalThis.navigator } = {}) {
  try {
    if (typeof navigator?.vibrate !== 'function') return false
    return navigator.vibrate(pattern)
  } catch {
    return false
  }
}
