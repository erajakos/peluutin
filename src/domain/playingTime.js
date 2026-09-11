/**
 * Playing-time fairness.
 *
 * Everything here compares a player against the average of the players who are
 * actually in the rotation. A fixed goalkeeper plays the whole match by design,
 * so including them would drag the average and make every outfield player look
 * short-changed.
 */

/** Seconds away from average at which the delta stops looking fair. */
export const FAIR_SECONDS = 90
export const STRETCHED_SECONDS = 240

export function fairnessBand(deltaSeconds) {
  const distance = Math.abs(deltaSeconds)
  if (distance <= FAIR_SECONDS) return 'good'
  if (distance <= STRETCHED_SECONDS) return 'warn'
  return 'bad'
}

export function rotatingPlayers(players, goalkeeperId) {
  return players.filter((player) => player.id !== goalkeeperId)
}

export function averageSeconds(players) {
  if (!players.length) return 0
  return players.reduce((total, player) => total + player.seconds, 0) / players.length
}

/** One row per player, most minutes first, annotated for the summary table. */
export function playingTimeRows(players, goalkeeperId) {
  const average = averageSeconds(rotatingPlayers(players, goalkeeperId))
  return players
    .slice()
    .sort((a, b) => b.seconds - a.seconds)
    .map((player) => {
      if (player.id === goalkeeperId) {
        return { ...player, isGoalkeeper: true, delta: 0, band: 'good' }
      }
      const delta = player.seconds - average
      return { ...player, isGoalkeeper: false, delta, band: fairnessBand(delta) }
    })
}
