import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { persistHistory } from '@/services/historyPersistence.js'
import { useHistoryStore } from '@/stores/history.js'
import { installStorage } from './storageStub.js'

const KEY = 'peluutinHistory'
const record = (id, opponent, us, them) => ({
  id,
  opponent,
  usScore: us,
  opponentScore: them,
  players: [{ id: 1, name: 'Aino', seconds: 900 }],
  goals: [],
  cards: [],
})

function visit() {
  const pinia = createPinia()
  pinia.use(persistHistory)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return useHistoryStore()
}

describe('keeping played matches', () => {
  let storage

  beforeEach(() => {
    storage = installStorage()
  })

  afterEach(() => {
    delete globalThis.window
  })

  it('still has last Saturday next Saturday', () => {
    const saturday = new Date(2026, 8, 12, 11, 0).getTime()
    const first = visit()
    first.record(record(1, 'PPJ', 3, 1), saturday)

    const nextWeek = visit()
    expect(nextWeek.entries).toHaveLength(1)
    expect(nextWeek.days[0].key).toBe('2026-09-12')
    expect(nextWeek.days[0].matches[0].opponent).toBe('PPJ')
  })

  it('files matches under the day they were played', () => {
    const store = visit()
    store.record(record(1, 'PPJ', 1, 0), new Date(2026, 8, 12, 10, 0).getTime())
    store.record(record(2, 'HJK', 2, 2), new Date(2026, 8, 12, 13, 0).getTime())
    store.record(record(3, 'KäPa', 0, 1), new Date(2026, 8, 19, 10, 0).getTime())

    expect(visit().days.map((day) => day.matches.length)).toEqual([1, 2])
  })

  it('forgets everything when the list is cleared', () => {
    const store = visit()
    store.record(record(1, 'PPJ', 1, 0))
    store.clear()
    expect(JSON.parse(storage.get(KEY))).toEqual([])
    expect(visit().entries).toEqual([])
  })

  it('ignores saved matches it cannot read', () => {
    storage.set(KEY, '{not json')
    expect(visit().entries).toEqual([])
    storage.set(KEY, JSON.stringify([{ opponent: 'PPJ' }, null, { playedAt: 'soon' }]))
    expect(visit().entries).toEqual([])
  })
})
