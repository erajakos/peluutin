/**
 * Matches kept beyond the day they were played.
 *
 * The matchday stats answer "how was today"; this answers "what have we
 * played". Records are the same immutable snapshots the day's stats read, with
 * the moment they finished written on them, so a squad edited later cannot
 * rewrite what happened.
 */
import { matchdaySummary } from './matchday.js'

/**
 * Several seasons of junior football. The list is bounded so it cannot grow
 * without end, and the storage layer trims further if the device runs short —
 * always from the oldest end.
 */
export const HISTORY_LIMIT = 500

export function createHistoryEntry(record, playedAt) {
  return { ...record, playedAt }
}

/**
 * The local calendar day a match belongs to, as `YYYY-MM-DD`.
 *
 * Local, not UTC: a match that finished at nine in the evening belongs to that
 * evening, whatever the clocks say in Greenwich.
 */
export function dayKey(timestamp) {
  const date = new Date(timestamp)
  const month = `${date.getMonth() + 1}`.padStart(2, '0')
  const day = `${date.getDate()}`.padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/**
 * Matches gathered into days — most recent day first, and within a day in the
 * order they were played, which is the order the coach remembers them in.
 */
export function groupByDay(entries) {
  const days = new Map()
  ;[...entries]
    .sort((a, b) => a.playedAt - b.playedAt)
    .forEach((entry) => {
      const key = dayKey(entry.playedAt)
      if (!days.has(key)) days.set(key, { key, playedAt: entry.playedAt, matches: [] })
      days.get(key).matches.push(entry)
    })

  return [...days.values()]
    .sort((a, b) => b.playedAt - a.playedAt)
    .map((day) => ({ ...day, summary: matchdaySummary(day.matches) }))
}

/** The newest entries, oldest dropped, so storage cannot grow without end. */
export function trimHistory(entries, limit = HISTORY_LIMIT) {
  return [...entries].sort((a, b) => a.playedAt - b.playedAt).slice(-limit)
}
