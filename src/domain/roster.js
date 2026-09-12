/**
 * Names as they should be shown, given the names as they were typed.
 *
 * Two players called Aino become "Aino 1" and "Aino 2", numbered in the order
 * they were added; a unique name is left alone. Matching ignores case and
 * surrounding spaces, because "aino" and "Aino " are the same child. Numbering
 * is recomputed from scratch every time, so removing one of two Ainos turns the
 * other back into plain "Aino".
 *
 * @param {string[]} typedNames
 * @returns {string[]} display names, in the same order
 */
export function numberDuplicateNames(typedNames) {
  const keyOf = (name) => name.trim().toLocaleLowerCase('fi')

  const totals = new Map()
  typedNames.forEach((name) => totals.set(keyOf(name), (totals.get(keyOf(name)) ?? 0) + 1))

  const seen = new Map()
  return typedNames.map((name) => {
    const key = keyOf(name)
    const clean = name.trim()
    if (totals.get(key) === 1) return clean
    const number = (seen.get(key) ?? 0) + 1
    seen.set(key, number)
    return `${clean} ${number}`
  })
}

/**
 * Who a player is, across squads and matches.
 *
 * The day's stats add a player's minutes up by id, so the same child must keep
 * the same id — even if they are taken out of the squad and typed in again, or
 * the whole squad is cleared and rebuilt. This is the book of names this device
 * has seen, and the id each one was given.
 *
 * Namesakes still get an id each: an id already standing in the squad is not
 * handed out twice, so the second Aino is a second player rather than the first
 * one twice over.
 */
const nameKey = (name) => name.trim().toLocaleLowerCase('fi')

/** The id this name has had before and is not using right now, if there is one. */
export function knownPlayerId(known, name, usedIds) {
  const key = nameKey(name)
  const match = known.find((player) => nameKey(player.name) === key && !usedIds.includes(player.id))
  return match ? match.id : null
}

/** The book with these players written into it, newest last, oldest dropped. */
export function rememberPlayers(known, players, limit = 200) {
  const next = known.filter((entry) => !players.some((player) => player.id === entry.id))
  players.forEach((player) => next.push({ id: player.id, name: player.name.trim() }))
  return next.slice(-limit)
}
