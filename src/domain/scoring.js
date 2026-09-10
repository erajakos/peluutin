export const TEAM_US = 'us'
export const TEAM_OPPONENT = 'opponent'

export const CARD_YELLOW = 'yellow'
export const CARD_RED = 'red'

export function countGoals(goals, team) {
  return goals.filter((goal) => goal.team === team).length
}

export function resultOf(usScore, opponentScore) {
  if (usScore > opponentScore) return 'win'
  if (usScore < opponentScore) return 'loss'
  return 'draw'
}

/**
 * Goals per scorer, most prolific first, with unattributed goals counted
 * separately — a coach tapping "goal" mid-attack often cannot name the scorer
 * yet, and we would rather show the gap than guess.
 */
export function scorerTally(goals, resolveName) {
  const counts = new Map()
  let unknown = 0

  goals
    .filter((goal) => goal.team === TEAM_US)
    .forEach((goal) => {
      if (!goal.playerId) {
        unknown += 1
        return
      }
      const entry = counts.get(goal.playerId) || { id: goal.playerId, name: '', count: 0 }
      entry.count += 1
      counts.set(goal.playerId, entry)
    })

  const entries = [...counts.values()]
    .map((entry) => ({ ...entry, name: resolveName(entry.id) }))
    .sort((a, b) => b.count - a.count)

  return { entries, unknown }
}

/** Yellow and red counts per player, for the match summary and season stats. */
export function cardTally(cards, resolveName) {
  const counts = new Map()
  cards.forEach((card) => {
    const entry = counts.get(card.playerId) || { id: card.playerId, yellow: 0, red: 0 }
    if (card.type === CARD_YELLOW) entry.yellow += 1
    else entry.red += 1
    counts.set(card.playerId, entry)
  })
  return [...counts.values()].map((entry) => ({ ...entry, name: resolveName(entry.id) }))
}
