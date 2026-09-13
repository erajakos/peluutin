import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { nextId } from '@/domain/ids.js'
import { persistPlayerIdentity } from '@/services/playerIdentity.js'
import { persistTeams } from '@/services/teamsPersistence.js'
import { useSetupStore } from '@/stores/setup.js'
import { useTeamsStore } from '@/stores/teams.js'
import { installStorage } from './storageStub.js'

function visit() {
  const pinia = createPinia()
  pinia.use(persistPlayerIdentity)
  pinia.use(persistTeams)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const teams = useTeamsStore()
  if (!teams.hasTeams) teams.add('LPS')
  return { teams, setup: useSetupStore() }
}

describe('who a player is', () => {
  let storage

  beforeEach(() => {
    storage = installStorage()
  })

  afterEach(() => {
    delete globalThis.window
  })

  it('gives a player typed in again the id they had before', () => {
    const { setup } = visit()
    setup.addPlayer('Aino')
    setup.addPlayer('Bo')
    const ainoId = setup.roster[0].id

    setup.removePlayer(ainoId)
    setup.addPlayer('Aino')
    expect(setup.roster.find((player) => player.typedName === 'Aino').id).toBe(ainoId)

    const next = visit()
    next.setup.clearRoster()
    next.setup.addPlayer('Aino')
    expect(next.setup.roster[0].id).toBe(ainoId)
  })

  it('keeps a child the same player in another team', () => {
    const { teams, setup } = visit()
    setup.addPlayer('Aino')
    const ainoId = setup.roster[0].id

    teams.add('LPS 2')
    setup.addPlayer('Aino')
    expect(setup.roster[0].id).toBe(ainoId)
  })

  it('gives namesakes an id each, rather than one of them twice', () => {
    const { setup } = visit()
    setup.addPlayer('Aino')
    setup.addPlayer('Aino')
    const [first, second] = setup.roster
    expect(first.id).not.toBe(second.id)

    const next = visit()
    next.setup.clearRoster()
    next.setup.addPlayer('Aino')
    next.setup.addPlayer('Aino')
    expect(next.setup.roster.map((player) => player.id)).toEqual([first.id, second.id])
  })

  it('never hands a new player an id a remembered one already has', () => {
    storage.set('peluutinKnownPlayers', JSON.stringify([{ id: 500, name: 'Aino' }]))
    const { setup } = visit()
    setup.addPlayer('Bo')
    expect(setup.roster[0].id).toBeGreaterThan(500)
    expect(nextId()).toBeGreaterThan(500)
  })

  it('ignores a book it cannot read', () => {
    storage.set('peluutinKnownPlayers', '{not json')
    expect(visit().setup.knownPlayers).toEqual([])
  })
})
