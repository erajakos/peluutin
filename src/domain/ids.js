/**
 * Sequential ids shared by players, slots, goals and cards.
 *
 * A single sequence keeps ids unique across every entity in a session, which
 * means an id alone is enough to identify a thing without also passing a type.
 */
export function createIdGenerator(start = 1) {
  let next = start
  return () => next++
}

export const nextId = createIdGenerator()
