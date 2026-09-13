import { nextId } from '@/domain/ids.js'
import { createTeam, sanitizeTeams } from '@/domain/teams.js'
import { useSetupStore } from '@/stores/setup.js'
import { loadRoster, loadTeamName, loadTeams, saveTeams } from './storage.js'

/**
 * Teams and their squads, kept on the device.
 *
 * Every team a coach has added is remembered, and so is the one they were
 * coaching last — the app opens on it, because next Saturday is usually the
 * same team as last Saturday.
 */
export function persistTeams({ store }) {
  if (store.$id !== 'teams') return

  const saved = restorable(loadTeams())
  if (saved.teams.length) store.restore(saved.teams, saved.activeId)

  // The squad in hand belongs to the team being coached: every name added or
  // taken out is written back to it, and the lot is saved.
  useSetupStore().$subscribe(() => store.keepRoster(), { detached: true, flush: 'sync' })

  store.$subscribe(
    (_mutation, state) => saveTeams({ activeId: state.activeId, teams: state.teams }),
    { detached: true, flush: 'sync' },
  )
}

/**
 * What to open with: the saved teams, or — for a coach who had this app before
 * it knew about more than one team — their team and squad turned into the
 * first one, so nothing has to be typed in again.
 */
function restorable(saved) {
  const teams = sanitizeTeams(saved?.teams)
  if (teams.length) {
    return { teams, activeId: Number.isInteger(saved?.activeId) ? saved.activeId : teams[0].id }
  }

  const name = loadTeamName()
  if (!name) return { teams: [], activeId: null }
  const only = createTeam(nextId(), name, loadRoster())
  return { teams: [only], activeId: only.id }
}
