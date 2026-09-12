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

  it('gives a player typed in again the id they had before', () => {
    const first = visit()
    first.addPlayer('Aino')
    first.addPlayer('Bo')
    const ainoId = first.roster[0].id

    // Taken out of the squad — a no-show, or a clear-out between matches.
    first.removePlayer(ainoId)
    first.addPlayer('Aino')
    expect(first.roster.find((player) => player.typedName === 'Aino').id).toBe(ainoId)

    // And still themselves on a later visit, after the whole squad was cleared.
    const next = visit()
    next.clearRoster()
    next.addPlayer('Aino')
    expect(next.roster[0].id).toBe(ainoId)
  })

  it('gives namesakes an id each, rather than one of them twice', () => {
    const setup = visit()
    setup.addPlayer('Aino')
    setup.addPlayer('Aino')
    const [first, second] = setup.roster
    expect(first.id).not.toBe(second.id)

    const next = visit()
    next.clearRoster()
    next.addPlayer('Aino')
    next.addPlayer('Aino')
    expect(next.roster.map((player) => player.id)).toEqual([first.id, second.id])
  })

  it('keeps the book of names when the squad is cleared, and loses it with everything else', () => {
    const setup = visit()
    setup.addPlayer('Aino')
    const ainoId = setup.roster[0].id
    setup.clearRoster()
    expect(storage.has('peluutinKnownPlayers')).toBe(true)

    const next = visit()
    next.addPlayer('Aino')
    expect(next.roster[0].id).toBe(ainoId)
  })

  it('ignores a saved squad it cannot read', () => {
    storage.set(KEY, '{not json')
    expect(visit().roster).toEqual([])
    storage.set(KEY, JSON.stringify([{ id: 'x', name: 'Aino' }, { id: 3, name: '  ' }, null]))
    expect(visit().roster).toEqual([])
  })
})
