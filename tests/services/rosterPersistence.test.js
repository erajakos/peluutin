import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { nextId } from '@/domain/ids.js'
import { persistRoster } from '@/services/rosterPersistence.js'
import { useSetupStore } from '@/stores/setup.js'
import { installStorage } from './storageStub.js'

const KEY = 'peluutinRoster'

function visit() {
  const pinia = createPinia()
  pinia.use(persistRoster)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return useSetupStore()
}

describe('remembering the squad', () => {
  let storage

  beforeEach(() => {
    storage = installStorage()
  })

  afterEach(() => {
    delete globalThis.window
  })

  it('brings the same players back on the next visit, with the same ids', () => {
    const first = visit()
    ;['Aino', 'Bo', 'Aino'].forEach((name) => first.addPlayer(name))
    const ids = first.roster.map((player) => player.id)

    const next = visit()
    expect(next.roster.map((player) => player.name)).toEqual(['Aino 1', 'Bo', 'Aino 2'])
    expect(next.roster.map((player) => player.id)).toEqual(ids)
  })

  it('keeps the name as typed, not the numbered one', () => {
    const first = visit()
    first.addPlayer('Aino')
    first.addPlayer('Aino')
    expect(JSON.parse(storage.get(KEY)).map((player) => player.name)).toEqual(['Aino', 'Aino'])
  })

  it('never hands a new player an id a remembered one already has', () => {
    storage.set(KEY, JSON.stringify([{ id: 500, name: 'Aino' }]))
    const setup = visit()
    setup.addPlayer('Bo')
    expect(setup.roster[1].id).toBeGreaterThan(500)
    expect(nextId()).toBeGreaterThan(500)
  })

  it('forgets players removed, and everyone once the squad is cleared', () => {
    const first = visit()
    ;['Aino', 'Bo', 'Cai'].forEach((name) => first.addPlayer(name))
    first.removePlayer(first.roster[1].id)
    expect(visit().roster.map((player) => player.name)).toEqual(['Aino', 'Cai'])

    visit().clearRoster()
    expect(visit().roster).toEqual([])
  })

  it('ignores a saved squad it cannot read', () => {
    storage.set(KEY, '{not json')
    expect(visit().roster).toEqual([])
    storage.set(KEY, JSON.stringify([{ id: 'x', name: 'Aino' }, { id: 3, name: '  ' }, null]))
    expect(visit().roster).toEqual([])
  })
})
