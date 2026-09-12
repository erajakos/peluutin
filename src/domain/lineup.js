import { nextId } from './ids.js'

/**
 * Build the empty starting lineup: one slot per position on the field, with the
 * goalkeeper first when the format has one. Slots own the position, players are
 * assigned into them — that is what lets a coach swap players without losing
 * the shape.
 */
export const GOALKEEPER_KEY = 'Goalkeeper'

export function buildSlots({ positions, goalkeeperLabel }) {
  const slots = [
    {
      id: nextId(),
      key: GOALKEEPER_KEY,
      label: goalkeeperLabel,
      isGoalkeeper: true,
      playerId: null,
    },
  ]
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

/**
 * Fill the empty positions with players drawn at random from those not yet
 * placed. Positions that already hold someone are never touched — that is what
 * lets a coach fix the players they care about and let chance do the rest.
 *
 * `random` is injectable so the draw can be tested; it defaults to Math.random.
 *
 * @returns {Array<{slotId:number, playerId:number}>} one entry per filled slot
 */
export function drawForEmptySlots(slots, roster, random = Math.random) {
  const placed = onFieldPlayerIds(slots)
  const pool = shuffle(
    roster.filter((player) => !placed.has(player.id)),
    random,
  )
  const empty = slots.filter((slot) => slot.playerId === null)
  return empty.slice(0, pool.length).map((slot, index) => ({
    slotId: slot.id,
    playerId: pool[index].id,
  }))
}

/** Fisher–Yates: every ordering equally likely, without mutating the input. */
function shuffle(list, random) {
  const copy = list.slice()
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
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
