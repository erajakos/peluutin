import { describe, expect, it } from 'vitest'
import { createMatchRecord, seasonSummary } from '@/domain/season.js'
import { CARD_RED, CARD_YELLOW, TEAM_OPPONENT, TEAM_US } from '@/domain/scoring.js'

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

describe('seasonSummary', () => {
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
    const summary = seasonSummary(matches)
    expect(summary).toMatchObject({ played: 3, wins: 1, draws: 1, losses: 1 })
  })

  it('totals goals for and against', () => {
    expect(seasonSummary(matches)).toMatchObject({ goalsFor: 3, goalsAgainst: 5 })
  })

  it('adds up each player’s minutes across matches, most first', () => {
    expect(seasonSummary(matches).minutes).toEqual([
      { id: 1, name: 'Aino', seconds: 1800 },
      { id: 2, name: 'Bo', seconds: 1300 },
    ])
  })

  it('tallies scorers and keeps unattributed goals separate', () => {
    const { scorers } = seasonSummary(matches)
    expect(scorers.entries).toEqual([
      { id: 1, name: 'Aino', count: 1 },
      { id: 2, name: 'Bo', count: 1 },
    ])
    expect(scorers.unknown).toBe(1)
  })

  it('tallies cards by colour', () => {
    expect(seasonSummary(matches).cards).toEqual([
      { id: 2, name: 'Bo', yellow: 1, red: 0 },
      { id: 1, name: 'Aino', yellow: 0, red: 1 },
    ])
  })

  it('handles a season that has not started', () => {
    expect(seasonSummary([])).toMatchObject({ played: 0, wins: 0, goalsFor: 0, minutes: [] })
  })
})
