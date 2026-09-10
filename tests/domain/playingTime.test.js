import { describe, expect, it } from 'vitest'
import { fairnessBand, playingTimeRows, playingTimeSpread } from '@/domain/playingTime.js'

const squad = [
  { id: 1, name: 'Keeper', seconds: 2400 },
  { id: 2, name: 'Aino', seconds: 1200 },
  { id: 3, name: 'Bo', seconds: 1200 },
  { id: 4, name: 'Cai', seconds: 600 },
]

describe('fairnessBand', () => {
  it('treats a minute and a half either way as fair', () => {
    expect(fairnessBand(90)).toBe('good')
    expect(fairnessBand(-90)).toBe('good')
  })

  it('escalates as the gap grows', () => {
    expect(fairnessBand(120)).toBe('warn')
    expect(fairnessBand(-300)).toBe('bad')
  })
})

describe('playingTimeRows', () => {
  it('sorts by minutes played, most first', () => {
    const rows = playingTimeRows(squad, 1)
    expect(rows.map((row) => row.name)).toEqual(['Keeper', 'Aino', 'Bo', 'Cai'])
  })

  it('measures each outfield player against the rotating average only', () => {
    // Rotating average is (1200 + 1200 + 600) / 3 = 1000 — the keeper is excluded.
    const rows = playingTimeRows(squad, 1)
    expect(rows.find((row) => row.name === 'Aino').delta).toBe(200)
    expect(rows.find((row) => row.name === 'Cai').delta).toBe(-400)
  })

  it('marks the fixed goalkeeper instead of judging their minutes', () => {
    const keeper = playingTimeRows(squad, 1).find((row) => row.name === 'Keeper')
    expect(keeper.isGoalkeeper).toBe(true)
    expect(keeper.delta).toBe(0)
  })

  it('includes the keeper in the average when they rotate', () => {
    const rows = playingTimeRows(squad, null)
    expect(rows.every((row) => row.isGoalkeeper === false)).toBe(true)
    expect(rows[0].delta).toBe(2400 - 1350)
  })
})

describe('playingTimeSpread', () => {
  it('reports the gap between the most- and least-played rotating player', () => {
    expect(playingTimeSpread(squad, 1)).toBe(600)
  })

  it('has nothing to say about a squad of one', () => {
    expect(playingTimeSpread([{ id: 1, seconds: 100 }], null)).toBe(null)
  })
})
