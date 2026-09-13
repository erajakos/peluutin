import { describe, expect, it } from 'vitest'
import { createHistoryEntry, dayKey, groupByDay, trimHistory } from '@/domain/history.js'

const at = (...args) => new Date(...args).getTime()
const match = (id, opponent, us, them, playedAt) =>
  createHistoryEntry(
    { id, opponent, usScore: us, opponentScore: them, players: [], goals: [], cards: [] },
    playedAt,
  )

describe('matches kept beyond the day', () => {
  it('files a match under the local day it finished, not the UTC one', () => {
    expect(dayKey(at(2026, 8, 12, 21, 30))).toBe('2026-09-12')
    expect(dayKey(at(2026, 0, 5, 0, 15))).toBe('2026-01-05')
  })

  it('gathers matches into days, newest day first', () => {
    const days = groupByDay([
      match(1, 'PPJ', 2, 1, at(2026, 8, 12, 10, 0)),
      match(2, 'HJK', 0, 3, at(2026, 8, 12, 12, 0)),
      match(3, 'KäPa', 1, 1, at(2026, 8, 19, 10, 0)),
    ])

    expect(days.map((day) => day.key)).toEqual(['2026-09-19', '2026-09-12'])
    // Within a day, in the order they were played.
    expect(days[1].matches.map((entry) => entry.opponent)).toEqual(['PPJ', 'HJK'])
  })

  it("sums each day up the way the day's own stats do", () => {
    const [day] = groupByDay([
      match(1, 'PPJ', 2, 1, at(2026, 8, 12, 10, 0)),
      match(2, 'HJK', 0, 3, at(2026, 8, 12, 12, 0)),
    ])
    expect(day.summary.played).toBe(2)
    expect(day.summary.wins).toBe(1)
    expect(day.summary.losses).toBe(1)
    expect(day.summary.goalsFor).toBe(2)
    expect(day.summary.goalsAgainst).toBe(4)
  })

  it('keeps the newest and drops the oldest', () => {
    const many = Array.from({ length: 8 }, (_, i) => match(i, 'PPJ', 0, 0, at(2026, 0, i + 1)))
    const kept = trimHistory(many, 3)
    expect(kept.map((entry) => entry.id)).toEqual([5, 6, 7])
  })

  it('has nothing to group when nothing has been played', () => {
    expect(groupByDay([])).toEqual([])
  })
})
