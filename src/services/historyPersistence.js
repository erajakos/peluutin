import { loadHistory, saveHistory } from './storage.js'

/**
 * A Pinia plugin that keeps the played matches on the device.
 *
 * Unlike the matchday, this survives the night: the whole point of the list is
 * that last Saturday is still there next Saturday.
 */
export function persistHistory({ store }) {
  if (store.$id !== 'history') return

  const saved = loadHistory()
  if (saved.length) store.restore(saved)

  store.$subscribe((_mutation, state) => saveHistory(state.entries), {
    detached: true,
    flush: 'sync',
  })
}
