/**
 * Substitution rules.
 *
 * A substitution is confirmed only when the same number of players go off and
 * come on. One-for-one needs no further input; for a multi-player change the
 * coach still has to say which incoming player takes which vacated position,
 * which is what `needsAssignment` and `createAssignment` are for.
 */
export function remainingSubs({ subLimitEnabled, subLimit, subsUsed }) {
  if (!subLimitEnabled) return Number.POSITIVE_INFINITY
  return Math.max(0, subLimit - subsUsed)
}

export function isLimitReached({ subLimitEnabled, subLimit, subsUsed }) {
  return subLimitEnabled && remainingSubs({ subLimitEnabled, subLimit, subsUsed }) <= 0
}

export function canConfirmSubstitution({ offCount, onCount, remaining }) {
  return offCount > 0 && offCount === onCount && offCount <= remaining
}

export function needsAssignment(offSlotIds) {
  return offSlotIds.length > 1
}

/**
 * Seed the position-by-position mapping for a multi-player change by pairing
 * the two selections in the order they were made — usually already right, and
 * a sensible starting point when it is not.
 */
export function createAssignment(offSlotIds, onPlayerIds) {
  const map = {}
  offSlotIds.forEach((slotId, index) => {
    if (onPlayerIds[index] !== undefined) map[slotId] = onPlayerIds[index]
  })
  return { offSlotIds, onPlayerIds, map }
}

/**
 * Put `playerId` into `slotId`, swapping with whoever already had them.
 *
 * Every incoming player stays offerable for every position, so changing your
 * mind is one tap: pick the player you want here and the two simply trade
 * places, instead of having to clear one dropdown before the other will offer
 * the player back.
 */
export function assignPlayer(assignment, slotId, playerId) {
  const map = { ...assignment.map }

  if (!playerId) {
    delete map[slotId]
    return { ...assignment, map }
  }

  const heldBy = Object.keys(map).find(
    (key) => map[key] === playerId && Number(key) !== Number(slotId),
  )
  const displaced = map[slotId]
  map[slotId] = playerId

  if (heldBy !== undefined) {
    if (displaced) map[heldBy] = displaced
    else delete map[heldBy]
  }

  return { ...assignment, map }
}

/** The position an incoming player is currently pencilled in for, if any. */
export function slotAssignedTo(assignment, playerId) {
  const entry = Object.entries(assignment.map).find(([, value]) => value === playerId)
  return entry ? Number(entry[0]) : null
}

export function isAssignmentComplete(assignment) {
  return assignment.offSlotIds.every((slotId) => Boolean(assignment.map[slotId]))
}
