export const TEAM_US = 'us'
export const TEAM_OPPONENT = 'opponent'

export const CARD_YELLOW = 'yellow'
export const CARD_RED = 'red'

export function countGoals(goals, team) {
  return goals.filter((goal) => goal.team === team).length
}

/**
 * The scoreline after each goal, in the order they were scored. It is what a
 * coach reads back afterwards to reconstruct how the match actually went —
 * three goals in a list say much less than 1–0, 1–1, 2–1.
 */
export function runningScores(goals) {
  let us = 0
  let opponent = 0
  return goals.map((goal) => {
    if (goal.team === TEAM_US) us += 1
    else opponent += 1
    return { id: goal.id, us, opponent }
  })
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

/** Yellow and red counts per player, for the match summary and the day's stats. */
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
