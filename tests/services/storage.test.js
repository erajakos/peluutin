import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  clearAllSaved,
  loadHistory,
  loadLanguage,
  saveHistory,
  saveLanguage,
} from '@/services/storage.js'
import { installStorage } from './storageStub.js'

const entry = (id) => ({
  id,
  playedAt: id,
  opponent: 'PPJ',
  usScore: 1,
  opponentScore: 0,
  players: [],
  goals: [],
  cards: [],
})

describe('what the device keeps', () => {
  beforeEach(() => {
    installStorage()
  })

  afterEach(() => {
    delete globalThis.window
  })

  it('remembers the language the app was last used in', () => {
    expect(loadLanguage()).toBe('')
    saveLanguage('en')
    expect(loadLanguage()).toBe('en')
  })

  it('forgets everything, language included, when asked to', () => {
    saveLanguage('en')
    saveHistory([entry(1)])
    clearAllSaved()
    expect(loadLanguage()).toBe('')
    expect(loadHistory()).toEqual([])
  })

  it('keeps the newest matches when the device has no room for them all', () => {
    // A storage that refuses anything beyond a few hundred characters, the way
    // a full device refuses a write once the quota is reached.
    const limit = 400
    const data = new Map()
    globalThis.window = {
      localStorage: {
        getItem: (key) => (data.has(key) ? data.get(key) : null),
        setItem: (key, value) => {
          if (String(value).length > limit) throw new Error('QuotaExceededError')
          data.set(key, String(value))
        },
        removeItem: (key) => data.delete(key),
      },
    }

    const many = Array.from({ length: 40 }, (_, i) => entry(i + 1))
    expect(saveHistory(many)).toBe(true)

    const kept = loadHistory()
    expect(kept.length).toBeGreaterThan(0)
    expect(kept.length).toBeLessThan(many.length)
    // The ones that survive are the most recent.
    expect(kept.at(-1).id).toBe(40)
  })
})
