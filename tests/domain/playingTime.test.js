import { describe, expect, it } from 'vitest'
import {
  averageSeconds,
  fairnessBand,
  playingTimeRows,
  rotatingPlayers,
} from '@/domain/playingTime.js'

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

describe('the outfield average', () => {
  it('is what every +/- in the summary is measured against', () => {
    // (1200 + 1200 + 600) / 3 — the fixed keeper stays out of it.
    expect(averageSeconds(rotatingPlayers(squad, 1))).toBe(1000)
  })

  it('includes the keeper once they are part of the rotation', () => {
    expect(averageSeconds(rotatingPlayers(squad, null))).toBe(1350)
  })

  it('is zero rather than NaN for an empty rotation', () => {
    expect(averageSeconds([])).toBe(0)
  })
})
