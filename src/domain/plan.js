/**
 * A substitution being put together.
 *
 * The coach builds the change before any of it happens: this position, that
 * player, and another pair while they are at it — then confirms the lot at
 * once. Until then nothing has moved, so anything can be undone by putting it
 * back, and the pitch still shows the match as it actually stands.
 *
 * A plan is `{ [slotId]: playerId | null }`: which position is being changed,
 * and who is coming into it. A null means the position is set to be emptied
 * with nobody chosen yet — an unfinished thought, not a confirmable change.
 */

/**
 * Pencil `playerId` into `slotId`, taking them off whichever position they
 * were pencilled into before.
 *
 * A player pencilled in twice would be two players at confirmation time, so
 * moving them is the only sane reading of putting them somewhere else — and it
 * makes changing your mind one gesture instead of undo-then-redo.
 */
export function stageChange(plan, slotId, playerId) {
  const next = { ...plan }
  const heldElsewhere = Object.keys(next).find(
    (key) => next[key] === playerId && Number(key) !== Number(slotId),
  )

  if (heldElsewhere !== undefined) {
    // The two trade places if the other position had someone, and is simply
    // left waiting if it did not.
    next[heldElsewhere] = next[slotId] ?? null
  }

  next[slotId] = playerId ?? null
  return next
}

/** Take a position out of the plan entirely. */
export function unstageSlot(plan, slotId) {
  const next = { ...plan }
  delete next[slotId]
  return next
}

/** The position a player is pencilled into, or null. */
export function slotPlannedFor(plan, playerId) {
  const entry = Object.entries(plan).find(([, value]) => value === playerId)
  return entry ? Number(entry[0]) : null
}

export function plannedSlotIds(plan) {
  return Object.keys(plan).map(Number)
}

export function isPlanEmpty(plan) {
  return Object.keys(plan).length === 0
}

/** Every position in the plan has somebody coming into it. */
export function isPlanComplete(plan) {
  const slots = Object.keys(plan)
  return slots.length > 0 && slots.every((slotId) => plan[slotId] !== null)
}

/** Complete, and within what the match's own rules still allow. */
export function canConfirmPlan(plan, remaining) {
  return isPlanComplete(plan) && Object.keys(plan).length <= remaining
}
