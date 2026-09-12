/**
 * Rotation hints — the "DUE OFF" / "DUE ON" badges.
 *
 * The rule is deliberately blunt so a coach can trust it at a glance: whoever
 * has been on longest without a break is due off, whoever has the fewest
 * minutes on the bench is due on. The two sides ask different questions on
 * purpose — who needs a rest now, and who is owed minutes — which is why one
 * counts the current spell and the other the whole match.
 *
 * Badges are suppressed when everyone is level, since a badge on every player
 * says nothing. A fixed goalkeeper is outside the rotation and never counts
 * towards either extreme.
 */
export function rotationHints({ slots, players, fixedGoalkeeper, availability }) {
  const byId = new Map(players.map((player) => [player.id, player]))
  const filled = slots.filter((slot) => slot.playerId !== null)

  const rotatingOnField = filled.filter((slot) => !(slot.isGoalkeeper && fixedGoalkeeper))
  // The current spell, not the match total: a player just brought on is not
  // due off however many minutes they had earlier in the game.
  const fieldSeconds = rotatingOnField.map((slot) => byId.get(slot.playerId)?.stintSeconds ?? 0)
  const maxFieldSeconds = fieldSeconds.length ? Math.max(...fieldSeconds) : null
  const fieldVaries = fieldSeconds.length > 0 && Math.min(...fieldSeconds) !== maxFieldSeconds

  const onField = new Set(filled.map((slot) => slot.playerId))
  const eligibleBench = players.filter(
    (player) => !onField.has(player.id) && isEligibleToReturn(player.id, availability),
  )
  const benchSeconds = eligibleBench.map((player) => player.seconds)
  const minBenchSeconds = benchSeconds.length ? Math.min(...benchSeconds) : null
  const benchVaries = benchSeconds.length > 0 && Math.max(...benchSeconds) !== minBenchSeconds

  const dueOffSlotIds = new Set(
    fieldVaries
      ? rotatingOnField
          .filter((slot) => byId.get(slot.playerId)?.stintSeconds === maxFieldSeconds)
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

/**
 * Whether a player may take the field again.
 *
 * A sending-off is final and outranks everything: a red card ends that player's
 * match whatever the substitution rules say. Otherwise a player who has been
 * taken off stays off only when the format disallows re-entry.
 */
export function isEligibleToReturn(playerId, { allowReentry, outForGood, sentOff }) {
  if (sentOff.has(playerId)) return false
  return allowReentry || !outForGood.has(playerId)
}
