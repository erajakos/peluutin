import { describe, expect, it } from 'vitest'
import { createIdGenerator, highestId } from '@/domain/ids.js'

describe('ids', () => {
  it('carry on above ids brought back from storage', () => {
    const next = createIdGenerator()
    next()
    next.skipPast(40)
    expect(next()).toBe(41)
  })

  it('never step backwards when told about a lower id', () => {
    const next = createIdGenerator(10)
    next.skipPast(3)
    expect(next()).toBe(10)
  })

  it('find the highest id anywhere in saved data', () => {
    const saved = {
      roster: [{ id: 2 }, { id: 7 }],
      match: { slots: [{ id: 12, playerId: 99 }], goals: [{ id: 30 }] },
      matchday: [{ id: 21, players: [{ id: 7 }] }],
    }
    // `playerId` is a reference, not an id of its own, so 99 does not count.
    expect(highestId(saved)).toBe(30)
    expect(highestId(null)).toBe(0)
  })
})
