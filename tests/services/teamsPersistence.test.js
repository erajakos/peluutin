import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { persistPlayerIdentity } from '@/services/playerIdentity.js'
import { persistTeams } from '@/services/teamsPersistence.js'
import { useSetupStore } from '@/stores/setup.js'
import { useTeamsStore } from '@/stores/teams.js'
import { installStorage } from './storageStub.js'

const KEY = 'peluutinTeams'

/** Opening the app: a fresh Pinia over whatever is stored, as main.js does it. */
function visit() {
  const pinia = createPinia()
  pinia.use(persistPlayerIdentity)
  pinia.use(persistTeams)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const teams = useTeamsStore()
  return { teams, setup: useSetupStore() }
}

describe('teams and their squads', () => {
  let storage

  beforeEach(() => {
    storage = installStorage()
  })

  afterEach(() => {
    delete globalThis.window
  })

  it('brings the team and its squad back on the next visit', () => {
    const first = visit()
    first.teams.add('LPS')
    ;['Aino', 'Bo', 'Aino'].forEach((name) => first.setup.addPlayer(name))
    const ids = first.setup.roster.map((player) => player.id)

    const next = visit()
    expect(next.teams.name).toBe('LPS')
    expect(next.setup.roster.map((player) => player.name)).toEqual(['Aino 1', 'Bo', 'Aino 2'])
    expect(next.setup.roster.map((player) => player.id)).toEqual(ids)
  })

  it("keeps each team's squad to itself", () => {
    const { teams, setup } = visit()
    teams.add('LPS')
    ;['Aino', 'Bo'].forEach((name) => setup.addPlayer(name))

    const other = teams.add('LPS 2')
    expect(setup.roster).toEqual([])
    ;['Cai', 'Dev', 'Eve'].forEach((name) => setup.addPlayer(name))

    const lps = teams.teams[0]
    teams.select(lps.id)
    expect(setup.roster.map((player) => player.name)).toEqual(['Aino', 'Bo'])
    teams.select(other.id)
    expect(setup.roster.map((player) => player.name)).toEqual(['Cai', 'Dev', 'Eve'])
  })

  it('opens on the team last coached', () => {
    const first = visit()
    first.teams.add('LPS')
    const second = first.teams.add('PPJ')
    first.setup.addPlayer('Cai')

    const next = visit()
    expect(next.teams.activeId).toBe(second.id)
    expect(next.setup.roster.map((player) => player.name)).toEqual(['Cai'])
  })

  it('refuses a second team with the same name', () => {
    const { teams } = visit()
    teams.add('LPS')
    expect(teams.add('  lps  ')).toBe(null)
    expect(teams.teams).toHaveLength(1)

    const other = teams.add('LPS Musta')
    expect(other).not.toBe(null)
    expect(teams.rename(other.id, 'LPS')).toBe(false)
    expect(teams.name).toBe('LPS Musta')
  })

  it('takes a team away, and coaches whoever is left', () => {
    const { teams, setup } = visit()
    const lps = teams.add('LPS')
    setup.addPlayer('Aino')
    const ppj = teams.add('PPJ')
    setup.addPlayer('Bo')

    teams.remove(ppj.id)
    expect(teams.activeId).toBe(lps.id)
    expect(setup.roster.map((player) => player.name)).toEqual(['Aino'])

    teams.remove(lps.id)
    expect(teams.hasTeams).toBe(false)
    expect(setup.roster).toEqual([])
  })

  it('turns the team an older version saved into the first of them', () => {
    // What a device that had this app before it knew about teams would hold.
    storage.set('sortOfAPlanTeamName', 'LPS')
    storage.set(
      'peluutinRoster',
      JSON.stringify([
        { id: 4, name: 'Aino' },
        { id: 7, name: 'Bo' },
      ]),
    )

    const { teams, setup } = visit()
    expect(teams.name).toBe('LPS')
    expect(setup.roster.map((player) => player.name)).toEqual(['Aino', 'Bo'])
    expect(setup.roster.map((player) => player.id)).toEqual([4, 7])

    // And from then on it is a team like any other.
    setup.addPlayer('Cai')
    expect(JSON.parse(storage.get(KEY)).teams[0].roster).toHaveLength(3)
  })

  it('ignores teams it cannot read', () => {
    storage.set(KEY, '{not json')
    expect(visit().teams.teams).toEqual([])
    storage.set(KEY, JSON.stringify({ teams: [{ name: 'LPS' }, null, { id: 2, name: '  ' }] }))
    expect(visit().teams.teams).toEqual([])
  })
})
