import { loadKnownPlayers, saveKnownPlayers } from './storage.js'

/**
 * Who a player is, kept between visits.
 *
 * The squads themselves belong to their teams and are saved with them; this is
 * the book of names and the id each was given, which outlives any one squad so
 * that a player moved between teams, or typed in again, is the same player.
 */
export function persistPlayerIdentity({ store }) {
  if (store.$id !== 'setup') return

  const known = loadKnownPlayers()
  if (known.length) store.restoreKnownPlayers(known)

  store.$subscribe((_mutation, state) => saveKnownPlayers(state.knownPlayers), {
    detached: true,
    flush: 'sync',
  })
}
