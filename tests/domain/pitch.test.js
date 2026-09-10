import { describe, expect, it } from 'vitest'
import { pitchLayout } from '@/domain/pitch.js'

function slotsFor(keys) {
  return keys.map((key, index) => ({
    id: index + 1,
    key,
    isGoalkeeper: key === 'Goalkeeper',
  }))
}

function layoutOf(keys) {
  return pitchLayout(slotsFor(keys))
}

describe('pitchLayout', () => {
  it('returns one spot per slot, in the order given', () => {
    const keys = ['Goalkeeper', 'Left Back', 'Right Back', 'Attacker']
    const spots = layoutOf(keys)
    expect(spots).toHaveLength(4)
    expect(spots.map((spot) => spot.slotId)).toEqual([1, 2, 3, 4])
  })

  it('puts the goalkeeper at the bottom and the attacker at the top', () => {
    const [keeper, , , attacker] = layoutOf(['Goalkeeper', 'Left Back', 'Right Back', 'Attacker'])
    expect(keeper.y).toBeGreaterThan(80)
    expect(attacker.y).toBeLessThan(20)
    expect(keeper.x).toBeCloseTo(50)
  })

  it('spreads players who want the same spot symmetrically about it', () => {
    const [left, right] = layoutOf(['Centre Back', 'Centre Back'])
    expect(left.x).toBeLessThan(50)
    expect(right.x).toBeGreaterThan(50)
    expect(left.x + right.x).toBeCloseTo(100)
  })

  it('keeps a back four in order, symmetric and on one line', () => {
    const spots = layoutOf(['Left Back', 'Centre Back', 'Centre Back', 'Right Back'])
    const xs = spots.map((spot) => spot.x)
    expect(xs).toEqual([...xs].sort((a, b) => a - b))
    expect(xs[0] + xs[3]).toBeCloseTo(100)
    expect(new Set(spots.map((spot) => spot.y)).size).toBe(1)
  })

  it('leaves a deliberately lopsided shape where the coach put it', () => {
    const [wing] = layoutOf(['Left Wing'])
    expect(wing.x).toBeLessThan(30)
  })

  it('keeps every player inside the pitch, however crowded the line', () => {
    const spots = layoutOf(Array.from({ length: 8 }, () => 'Centre Midfielder'))
    spots.forEach((spot) => {
      expect(spot.x).toBeGreaterThanOrEqual(0)
      expect(spot.x).toBeLessThanOrEqual(100)
    })
  })

  it('parks unknown or renamed positions in midfield rather than dropping them', () => {
    const spots = layoutOf(['Position 1', 'Position 2', 'Position 3'])
    expect(spots).toHaveLength(3)
    expect(new Set(spots.map((spot) => spot.x)).size).toBe(3)
  })
})
