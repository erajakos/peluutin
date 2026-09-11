/**
 * Sequential ids shared by players, slots, goals and cards.
 *
 * A single sequence keeps ids unique across every entity in a session, which
 * means an id alone is enough to identify a thing without also passing a type.
 */
export function createIdGenerator(start = 1) {
  let next = start
  const generate = () => next++

  /**
   * Things brought back from storage keep the ids they were saved with, so the
   * sequence must carry on above every one of them rather than hand one out twice.
   */
  generate.skipPast = (usedId) => {
    if (Number.isInteger(usedId)) next = Math.max(next, usedId + 1)
  }

  return generate
}

export const nextId = createIdGenerator()

/** The highest `id` anywhere in a piece of saved data, or 0 if there is none. */
export function highestId(value) {
  if (Array.isArray(value)) return value.reduce((max, item) => Math.max(max, highestId(item)), 0)
  if (!value || typeof value !== 'object') return 0
  return Object.entries(value).reduce((max, [key, item]) => {
    const own = key === 'id' && Number.isInteger(item) ? item : 0
    return Math.max(max, own, highestId(item))
  }, 0)
}
