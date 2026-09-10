import { nextId } from './ids.js'

/**
 * Build the empty starting lineup: one slot per position on the field, with the
 * goalkeeper first when the format has one. Slots own the position, players are
 * assigned into them — that is what lets a coach swap players without losing
 * the shape.
 */
export const GOALKEEPER_KEY = 'Goalkeeper'

export function buildSlots({ hasGoalkeeper, positions, goalkeeperLabel }) {
  const slots = []
  if (hasGoalkeeper) {
    slots.push({
      id: nextId(),
      key: GOALKEEPER_KEY,
      label: goalkeeperLabel,
      isGoalkeeper: true,
      playerId: null,
    })
  }
  positions.forEach(({ key, label }) => {
    slots.push({ id: nextId(), key, label, isGoalkeeper: false, playerId: null })
  })
  return slots
}

/** Ids of every player currently standing on the field. */
export function onFieldPlayerIds(slots) {
  return new Set(slots.map((slot) => slot.playerId).filter((id) => id !== null))
}

/** Everyone not in a slot, least-played first — the order a coach subs from. */
export function benchPlayers(players, slots) {
  const onField = onFieldPlayerIds(slots)
  return players.filter((player) => !onField.has(player.id)).sort((a, b) => a.seconds - b.seconds)
}

/** The lineup is ready to kick off once every slot has a player in it. */
export function isLineupComplete(slots) {
  return slots.length > 0 && slots.every((slot) => slot.playerId !== null)
}

/**
 * Players selectable for a slot: the unassigned ones, plus whoever already
 * holds this slot so the current pick stays visible in the dropdown.
 */
export function availablePlayersForSlot(roster, slots, slot) {
  const taken = onFieldPlayerIds(slots)
  return roster.filter((player) => !taken.has(player.id) || player.id === slot.playerId)
}
