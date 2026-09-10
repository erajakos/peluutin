import { describe, expect, it } from 'vitest'
import { rotationHints } from '@/domain/rotation.js'

const players = [
  { id: 1, name: 'Keeper', seconds: 600 },
  { id: 2, name: 'Aino', seconds: 500 },
  { id: 3, name: 'Bo', seconds: 300 },
  { id: 4, name: 'Cai', seconds: 100 },
  { id: 5, name: 'Dev', seconds: 200 },
]

const slots = [
  { id: 10, isGoalkeeper: true, playerId: 1 },
  { id: 11, isGoalkeeper: false, playerId: 2 },
  { id: 12, isGoalkeeper: false, playerId: 3 },
]

function hints(overrides = {}) {
  return rotationHints({
    slots,
    players,
    fixedGoalkeeper: true,
    allowReentry: true,
    outForGood: new Set(),
    ...overrides,
  })
}

describe('rotationHints', () => {
  it('flags the outfield player with the most minutes as due off', () => {
    expect([...hints().dueOffSlotIds]).toEqual([11])
  })

  it('never flags a fixed goalkeeper, however many minutes they have', () => {
    expect(hints().dueOffSlotIds.has(10)).toBe(false)
  })

  it('includes the goalkeeper once they are part of the rotation', () => {
    expect([...hints({ fixedGoalkeeper: false }).dueOffSlotIds]).toEqual([10])
  })

  it('flags the least-played bench player as due on', () => {
    expect([...hints().dueOnPlayerIds]).toEqual([4])
  })

  it('skips players who cannot come back on', () => {
    const withSpare = [...players, { id: 6, name: 'Eve', seconds: 400 }]
    const result = hints({ players: withSpare, allowReentry: false, outForGood: new Set([4]) })
    expect(result.dueOnPlayerIds.has(4)).toBe(false)
    expect([...result.dueOnPlayerIds]).toEqual([5])
  })

  it('leaves the last eligible substitute unbadged, having nothing to compare', () => {
    const result = hints({ allowReentry: false, outForGood: new Set([4]) })
    expect(result.dueOnPlayerIds.size).toBe(0)
  })

  it('shows no badges when everyone is level, since that advises nothing', () => {
    const level = players.map((player) => ({ ...player, seconds: 300 }))
    const result = hints({ players: level })
    expect(result.dueOffSlotIds.size).toBe(0)
    expect(result.dueOnPlayerIds.size).toBe(0)
  })

  it('flags every player tied for the most minutes', () => {
    const tied = [
      { id: 1, seconds: 0 },
      { id: 2, seconds: 500 },
      { id: 3, seconds: 500 },
      { id: 4, seconds: 100 },
      { id: 5, seconds: 200 },
    ]
    const threeUp = [...slots, { id: 13, isGoalkeeper: false, playerId: 5 }]
    expect([...hints({ players: tied, slots: threeUp }).dueOffSlotIds]).toEqual([11, 12])
  })
})
