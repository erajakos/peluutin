/**
 * Rotation hints — the "DUE OFF" / "DUE ON" badges.
 *
 * The rule is deliberately blunt so a coach can trust it at a glance: whoever
 * has the most minutes on the field is due off, whoever has the fewest on the
 * bench is due on. Badges are suppressed when everyone is level, since a badge
 * on every player says nothing. A fixed goalkeeper is outside the rotation and
 * never counts towards either extreme.
 */
export function rotationHints({ slots, players, fixedGoalkeeper, allowReentry, outForGood }) {
  const byId = new Map(players.map((player) => [player.id, player]))
  const filled = slots.filter((slot) => slot.playerId !== null)

  const rotatingOnField = filled.filter((slot) => !(slot.isGoalkeeper && fixedGoalkeeper))
  const fieldSeconds = rotatingOnField.map((slot) => byId.get(slot.playerId)?.seconds ?? 0)
  const maxFieldSeconds = fieldSeconds.length ? Math.max(...fieldSeconds) : null
  const fieldVaries = fieldSeconds.length > 0 && Math.min(...fieldSeconds) !== maxFieldSeconds

  const onField = new Set(filled.map((slot) => slot.playerId))
  const eligibleBench = players.filter(
    (player) => !onField.has(player.id) && isEligibleToReturn(player.id, allowReentry, outForGood),
  )
  const benchSeconds = eligibleBench.map((player) => player.seconds)
  const minBenchSeconds = benchSeconds.length ? Math.min(...benchSeconds) : null
  const benchVaries = benchSeconds.length > 0 && Math.max(...benchSeconds) !== minBenchSeconds

  const dueOffSlotIds = new Set(
    fieldVaries
      ? rotatingOnField
          .filter((slot) => byId.get(slot.playerId)?.seconds === maxFieldSeconds)
          .map((slot) => slot.id)
      : [],
  )
  const dueOnPlayerIds = new Set(
    benchVaries
      ? eligibleBench.filter((player) => player.seconds === minBenchSeconds).map((p) => p.id)
      : [],
  )

  return { dueOffSlotIds, dueOnPlayerIds }
}

/** A player who has been subbed off stays off when re-entry is disallowed. */
export function isEligibleToReturn(playerId, allowReentry, outForGood) {
  return allowReentry || !outForGood.has(playerId)
}
