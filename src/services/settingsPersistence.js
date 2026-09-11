import { pickMatchSettings, sanitizeMatchSettings } from '@/domain/matchSettings.js'
import { loadMatchSettings, saveMatchSettings } from './storage.js'

/**
 * A Pinia plugin that remembers how the match is played between visits.
 *
 * Kept out of the setup store itself, so the store stays about the setup and
 * this file stays about storage: restore once when the store is created, then
 * save whenever it changes. Only the whitelisted settings are ever written.
 */
export function persistMatchSettings({ store }) {
  if (store.$id !== 'setup') return

  const saved = sanitizeMatchSettings(loadMatchSettings())
  if (Object.keys(saved).length) {
    store.$patch(saved)
    // A remembered shape that no longer fits the remembered format is replaced.
    store.syncFormationToFormat()
  }

  // Written the moment anything changes: a tab closed straight after changing
  // a setting must still remember it.
  store.$subscribe((_mutation, state) => saveMatchSettings(pickMatchSettings(state)), {
    detached: true,
    flush: 'sync',
  })
}
