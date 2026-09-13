import { describe, expect, it } from 'vitest'
import { createMatchRecord, matchdaySummary } from '@/domain/matchday.js'
import {
  CARD_RED,
  CARD_YELLOW,
  TEAM_OPPONENT,
  TEAM_US,
  isSentOffByCards,
  runningScores,
} from '@/domain/scoring.js'

function match({ id, usScore, opponentScore, players, goals = [], cards = [] }) {
  return createMatchRecord({
    id,
    opponent: `Team ${id}`,
    usScore,
    opponentScore,
    players,
    goals,
    cards,
  })
}

describe('createMatchRecord', () => {
  it('remembers who wore the armband, and nobody when there was none', () => {
    const players = [{ id: 1, name: 'Aino', seconds: 900 }]
    expect(
      createMatchRecord({
        id: 1,
        opponent: 'PPJ',
        usScore: 1,
        opponentScore: 0,
        captainId: 1,
        players,
        goals: [],
        cards: [],
      }).captainId,
    ).toBe(1)
    expect(match({ id: 2, usScore: 0, opponentScore: 0, players }).captainId).toBe(null)
  })

  it('snapshots players so later roster edits cannot rewrite history', () => {
    const players = [{ id: 1, name: 'Aino', seconds: 600 }]
    const record = createMatchRecord({
      id: 1,
      opponent: 'FC Example',
      usScore: 1,
      opponentScore: 0,
      players,
      goals: [],
      cards: [],
    })
    players[0].name = 'Renamed'
    expect(record.players[0].name).toBe('Aino')
  })
})

describe('matchdaySummary', () => {
  const matches = [
    match({
      id: 1,
      usScore: 2,
      opponentScore: 1,
      players: [
        { id: 1, name: 'Aino', seconds: 600 },
        { id: 2, name: 'Bo', seconds: 400 },
      ],
      goals: [
        { id: 90, team: TEAM_US, playerId: 1 },
        { id: 91, team: TEAM_US, playerId: null },
        { id: 92, team: TEAM_OPPONENT, playerId: null },
      ],
      cards: [{ id: 93, playerId: 2, type: CARD_YELLOW }],
    }),
    match({
      id: 2,
      usScore: 0,
      opponentScore: 3,
      players: [{ id: 1, name: 'Aino', seconds: 1200 }],
      cards: [{ id: 94, playerId: 1, type: CARD_RED }],
    }),
    match({
      id: 3,
      usScore: 1,
      opponentScore: 1,
      players: [{ id: 2, name: 'Bo', seconds: 900 }],
      goals: [{ id: 95, team: TEAM_US, playerId: 2 }],
    }),
  ]

  it('counts the record', () => {
    const summary = matchdaySummary(matches)
    expect(summary).toMatchObject({ played: 3, wins: 1, draws: 1, losses: 1 })
  })

  it('totals goals for and against', () => {
    expect(matchdaySummary(matches)).toMatchObject({ goalsFor: 3, goalsAgainst: 5 })
  })

  it('adds up each player’s minutes across matches, most first', () => {
    expect(matchdaySummary(matches).minutes).toEqual([
      { id: 1, name: 'Aino', seconds: 1800 },
      { id: 2, name: 'Bo', seconds: 1300 },
    ])
  })

  it('tallies scorers and keeps unattributed goals separate', () => {
    const { scorers } = matchdaySummary(matches)
    expect(scorers.entries).toEqual([
      { id: 1, name: 'Aino', count: 1 },
      { id: 2, name: 'Bo', count: 1 },
    ])
    expect(scorers.unknown).toBe(1)
  })

  it('tallies cards by colour', () => {
    expect(matchdaySummary(matches).cards).toEqual([
      { id: 2, name: 'Bo', yellow: 1, red: 0 },
      { id: 1, name: 'Aino', yellow: 0, red: 1 },
    ])
  })

  it('handles a day with no matches played yet', () => {
    expect(matchdaySummary([])).toMatchObject({ played: 0, wins: 0, goalsFor: 0, minutes: [] })
  })
})

describe('runningScores', () => {
  it('reports the scoreline each goal produced, not the final one', () => {
    const goals = [
      { id: 1, team: TEAM_US },
      { id: 2, team: TEAM_OPPONENT },
      { id: 3, team: TEAM_US },
      { id: 4, team: TEAM_US },
    ]
    expect(runningScores(goals)).toEqual([
      { id: 1, us: 1, opponent: 0 },
      { id: 2, us: 1, opponent: 1 },
      { id: 3, us: 2, opponent: 1 },
      { id: 4, us: 3, opponent: 1 },
    ])
  })

  it('stays aligned with the goals it was given', () => {
    const goals = [{ id: 9, team: TEAM_OPPONENT }]
    expect(runningScores(goals)).toEqual([{ id: 9, us: 0, opponent: 1 }])
  })

  it('has nothing to say about a goalless match', () => {
    expect(runningScores([])).toEqual([])
  })
})

describe('isSentOffByCards', () => {
  it('sends off for a red card', () => {
    expect(isSentOffByCards({ yellow: 0, red: 1 })).toBe(true)
  })

  it('sends off for a second yellow', () => {
    expect(isSentOffByCards({ yellow: 2, red: 0 })).toBe(true)
  })

  it('lets a single yellow play on', () => {
    expect(isSentOffByCards({ yellow: 1, red: 0 })).toBe(false)
  })
})
