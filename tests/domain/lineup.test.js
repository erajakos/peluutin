import { describe, expect, it } from 'vitest'
import { drawForEmptySlots } from '@/domain/lineup.js'

const roster = [1, 2, 3, 4, 5, 6].map((id) => ({ id, name: `P${id}` }))

function slots(...playerIds) {
  return playerIds.map((playerId, index) => ({ id: 100 + index, playerId }))
}

/** A repeatable sequence standing in for Math.random. */
function seeded(values) {
  let i = 0
  return () => values[i++ % values.length]
}

describe('drawForEmptySlots', () => {
  it('fills every empty position', () => {
    const draw = drawForEmptySlots(slots(null, null, null), roster, seeded([0.1, 0.7, 0.4]))
    expect(draw).toHaveLength(3)
    expect(draw.map((pick) => pick.slotId)).toEqual([100, 101, 102])
  })

  it('never touches a position that already has a player', () => {
    const draw = drawForEmptySlots(slots(3, null, 5), roster, seeded([0.5]))
    expect(draw.map((pick) => pick.slotId)).toEqual([101])
  })

  it('only draws players who are not already placed', () => {
    const draw = drawForEmptySlots(slots(1, 2, null, null), roster, seeded([0.9, 0.2, 0.6]))
    const drawn = draw.map((pick) => pick.playerId)
    expect(drawn).not.toContain(1)
    expect(drawn).not.toContain(2)
  })

  it('never places the same player twice', () => {
    const draw = drawForEmptySlots(slots(null, null, null, null, null), roster, Math.random)
    const drawn = draw.map((pick) => pick.playerId)
    expect(new Set(drawn).size).toBe(drawn.length)
  })

  it('stops when the squad runs out rather than leaving holes filled twice', () => {
    const small = roster.slice(0, 2)
    const draw = drawForEmptySlots(slots(null, null, null), small, seeded([0.3]))
    expect(draw).toHaveLength(2)
  })

  it('produces different lineups for different chances', () => {
    const empty = slots(null, null, null)
    const a = drawForEmptySlots(empty, roster, seeded([0.05, 0.05, 0.05, 0.05, 0.05]))
    const b = drawForEmptySlots(empty, roster, seeded([0.95, 0.95, 0.95, 0.95, 0.95]))
    expect(a.map((pick) => pick.playerId)).not.toEqual(b.map((pick) => pick.playerId))
  })
})
