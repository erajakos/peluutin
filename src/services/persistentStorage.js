/**
 * Asking the browser to keep what this app has stored.
 *
 * Browsers clear "best-effort" site storage when a device runs short of room,
 * and everything this app has is stored that way: the squad, the settings, the
 * matches played. Persistent storage takes it out of that queue, and browsers
 * grant it to sites the person actually uses — an installed app, or one they
 * come back to.
 *
 * It is a request, not a guarantee. Refused, nothing changes and nothing
 * breaks; the answer is only worth having to be able to say so.
 */
export async function askToKeepStorage({ navigator = globalThis.navigator } = {}) {
  try {
    if (!navigator?.storage?.persist) return false
    if (await navigator.storage.persisted?.()) return true
    return await navigator.storage.persist()
  } catch {
    return false
  }
}
