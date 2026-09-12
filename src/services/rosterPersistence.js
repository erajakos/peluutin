import { loadKnownPlayers, loadRoster, saveKnownPlayers, saveRoster } from './storage.js'

/**
 * A Pinia plugin that remembers the squad between visits: the same children
 * turn up week after week, and typing them in before every match is exactly
 * the chore this app should save.
 *
 * Only the id and the name as typed are kept; the numbering of duplicate names
 * is worked out again on the way back in.
 */
export function persistRoster({ store }) {
  if (store.$id !== 'setup') return

  // The book of names first: the squad is written into it on the way in.
  const known = loadKnownPlayers()
  if (known.length) store.restoreKnownPlayers(known)

  const saved = loadRoster()
  if (saved.length) store.restoreRoster(saved)

  store.$subscribe(
    (_mutation, state) => {
      saveRoster(state.roster.map((player) => ({ id: player.id, name: player.typedName })))
      saveKnownPlayers(state.knownPlayers)
    },
    { detached: true, flush: 'sync' },
  )
}
