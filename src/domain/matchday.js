import { TEAM_US, cardTally, resultOf, scorerTally } from './scoring.js'

/**
 * Turn a finished match into the immutable record the matchday stats read from.
 * Snapshotting names and minutes here means later roster edits cannot rewrite
 * history.
 */
export function createMatchRecord({
  id,
  opponent,
  usScore,
  opponentScore,
  captainId = null,
  teamId = null,
  teamName = '',
  players,
  goals,
  cards,
}) {
  return {
    id,
    opponent,
    /** Which team played it, and what they were called at the time. */
    teamId,
    teamName,
    usScore,
    opponentScore,
    /** Who wore the armband, so a result can still say so months later. */
    captainId,
    players: players.map((player) => ({ ...player })),
    goals: goals.map((goal) => ({ ...goal })),
    cards: cards.map((card) => ({ ...card })),
  }
}

/** Aggregate every recorded match of the day. */
export function matchdaySummary(matches) {
  const minutes = new Map()
  let wins = 0
  let draws = 0
  let losses = 0
  let goalsFor = 0
  let goalsAgainst = 0

  matches.forEach((match) => {
    goalsFor += match.usScore
    goalsAgainst += match.opponentScore
    const result = resultOf(match.usScore, match.opponentScore)
    if (result === 'win') wins += 1
    else if (result === 'loss') losses += 1
    else draws += 1

    match.players.forEach((player) => {
      const entry = minutes.get(player.id) || { id: player.id, name: player.name, seconds: 0 }
      entry.name = player.name
      entry.seconds += player.seconds
      minutes.set(player.id, entry)
    })
  })

  const resolveName = (playerId) => minutes.get(playerId)?.name ?? '?'
  const allGoals = matches.flatMap((match) => match.goals.filter((goal) => goal.team === TEAM_US))
  const allCards = matches.flatMap((match) => match.cards)

  return {
    played: matches.length,
    wins,
    draws,
    losses,
    goalsFor,
    goalsAgainst,
    minutes: [...minutes.values()].sort((a, b) => b.seconds - a.seconds),
    scorers: scorerTally(allGoals, resolveName),
    cards: cardTally(allCards, resolveName),
  }
}
