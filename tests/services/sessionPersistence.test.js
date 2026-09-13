import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { nextId } from '@/domain/ids.js'
import { TEAM_OPPONENT } from '@/domain/scoring.js'
import { currentLocale, setLocale } from '@/i18n/index.js'
import { persistRoster } from '@/services/rosterPersistence.js'
import { keepSessionSaved, resumeSession } from '@/services/sessionPersistence.js'
import { persistMatchSettings } from '@/services/settingsPersistence.js'
import { PHASES, useAppStore } from '@/stores/app.js'
import { PERIOD, useMatchStore } from '@/stores/match.js'
import { useMatchdayStore } from '@/stores/matchday.js'
import { useSetupStore } from '@/stores/setup.js'
import { installStorage } from './storageStub.js'

const KEY = 'peluutinSession'
const SATURDAY_MORNING = new Date(2026, 8, 12, 10, 0, 0)

/** Opening the app: a fresh Pinia over whatever is stored, as main.js does it. */
function visit() {
  const pinia = createPinia()
  pinia.use(persistMatchSettings)
  pinia.use(persistRoster)
  createApp({}).use(pinia)
  setActivePinia(pinia)
  const resumed = resumeSession()
  keepSessionSaved()
  return {
    resumed,
    app: useAppStore(),
    setup: useSetupStore(),
    match: useMatchStore(),
    matchday: useMatchdayStore(),
  }
}

/** Saves are gathered up and written once the current burst of changes is over. */
const settle = () => new Promise((resolve) => queueMicrotask(resolve))

/** Opponent, squad, lineup, kickoff: straight to the live screen. */
function kickOff({ app, setup, match }) {
  app.confirmOpponent('PPJ')
  ;['Aino', 'Bo', 'Cai', 'Dev', 'Eve', 'Fay'].forEach((name) => setup.addPlayer(name))
  app.openLineup()
  match.drawLineup(setup.roster, () => 0)
  app.kickOff()
}

describe('keeping the matchday across a reload', () => {
  let storage

  beforeEach(() => {
    storage = installStorage()
    vi.useFakeTimers()
    vi.setSystemTime(SATURDAY_MORNING)
    setLocale('fi')
  })

  afterEach(() => {
    useMatchStore().pause()
    vi.useRealTimers()
    delete globalThis.window
  })

  it('saves nothing while the app is still on its own front page', async () => {
    const first = visit()
    first.setup.addPlayer('Aino')
    await settle()
    expect(storage.has(KEY)).toBe(false)
    expect(visit().resumed).toBe(false)
  })

  it('keeps a match still being set up, half-typed squad and all', async () => {
    const first = visit()
    first.app.confirmOpponent('PPJ')
    first.app.openSquad()
    ;['Aino', 'Bo', 'Cai'].forEach((name) => first.setup.addPlayer(name))
    await settle()

    const next = visit()
    expect(next.resumed).toBe(true)
    expect(next.app.phase).toBe(PHASES.SQUAD)
    expect(next.setup.opponentName).toBe('PPJ')
    expect(next.setup.roster.map((player) => player.name)).toEqual(['Aino', 'Bo', 'Cai'])
  })

  it('keeps a starting lineup half picked', async () => {
    const first = visit()
    first.app.confirmOpponent('PPJ')
    ;['Aino', 'Bo', 'Cai', 'Dev', 'Eve', 'Fay'].forEach((name) => first.setup.addPlayer(name))
    first.app.openLineup()
    first.match.assignSlot(first.match.slots[0].id, first.setup.roster[0].id)
    await settle()

    const next = visit()
    expect(next.app.phase).toBe(PHASES.LINEUP)
    expect(next.match.slots[0].playerId).toBe(first.setup.roster[0].id)
    expect(next.match.lineupComplete).toBe(false)
  })

  it('puts a match under way back on the live screen, as it was', async () => {
    const first = visit()
    kickOff(first)
    first.match.start()
    vi.advanceTimersByTime(90_000)
    first.match.addOpponentGoal()
    first.match.pause()
    await settle()
    const bench = first.match.bench.map((player) => player.id)

    const next = visit()
    expect(next.resumed).toBe(true)
    expect(next.app.phase).toBe(PHASES.LIVE)
    expect(next.setup.opponentName).toBe('PPJ')
    expect(next.match.elapsedSeconds).toBe(90)
    expect(next.match.goals.map((goal) => goal.team)).toEqual([TEAM_OPPONENT])
    expect(next.match.bench.map((player) => player.id)).toEqual(bench)
    // Paused when it was left, so paused it stays: nothing counted while away.
    expect(next.match.running).toBe(false)
  })

  it('catches a running clock up by the time the page was gone, and keeps it running', async () => {
    const first = visit()
    kickOff(first)
    first.match.start()
    vi.advanceTimersByTime(60_000)
    await settle()
    const onField = first.match.slots[0].playerId
    // The page is gone for half a minute; the match on the pitch is not.
    vi.setSystemTime(SATURDAY_MORNING.getTime() + 90_000)

    const next = visit()
    expect(next.match.running).toBe(true)
    expect(next.match.elapsedSeconds).toBe(90)
    expect(next.match.players.find((player) => player.id === onField).seconds).toBe(90)
    vi.advanceTimersByTime(10_000)
    expect(next.match.elapsedSeconds).toBe(100)
  })

  it('keeps half time, cards and the players sent off', async () => {
    const first = visit()
    first.setup.setTwoHalves(true)
    first.setup.trackCards = true
    kickOff(first)
    first.match.start()
    vi.advanceTimersByTime(5_000)
    const sentOff = first.match.slots[1].playerId
    first.match.addCard(sentOff, 'red')
    first.match.endFirstHalf()
    await settle()

    const next = visit()
    expect(next.match.period).toBe(PERIOD.HALF_TIME)
    expect(next.match.sentOff.has(sentOff)).toBe(true)
    expect(next.match.cards).toHaveLength(1)
    expect(next.match.canStartSecondHalf).toBe(true)
  })

  it('comes back to the summary after full time, in the language it was played in', async () => {
    const first = visit()
    setLocale('en')
    kickOff(first)
    first.app.endMatch()
    await settle()
    setLocale('fi')

    const next = visit()
    expect(next.app.phase).toBe(PHASES.SUMMARY)
    expect(currentLocale()).toBe('en')
    expect(next.matchday.matches).toHaveLength(1)
  })

  it('comes back to the next match being set up, with the day’s results intact', async () => {
    const first = visit()
    kickOff(first)
    first.app.endMatch()
    first.app.playAnotherMatch()
    await settle()

    const next = visit()
    expect(next.resumed).toBe(true)
    expect(next.app.phase).toBe(PHASES.OPPONENT)
    expect(next.matchday.matches.map((match) => match.opponent)).toEqual(['PPJ'])
  })

  it('never reuses an id that is already in the saved matchday', async () => {
    const first = visit()
    kickOff(first)
    first.app.endMatch()
    await settle()
    const saved = JSON.parse(storage.get(KEY))

    visit()
    const used = JSON.stringify(saved)
      .match(/"id":\d+/g)
      .map((entry) => Number(entry.slice(5)))
    expect(nextId()).toBeGreaterThan(Math.max(...used))
  })

  it('drops a matchday saved on an earlier day', async () => {
    const first = visit()
    kickOff(first)
    await settle()
    vi.setSystemTime(new Date(2026, 8, 13, 9, 0, 0))

    const next = visit()
    expect(next.resumed).toBe(false)
    expect(next.app.phase).toBe(PHASES.SPLASH)
    expect(next.matchday.matches).toEqual([])
    expect(storage.has(KEY)).toBe(false)
  })

  it('starts clean from a saved matchday it cannot read', () => {
    storage.set(KEY, '{broken')
    expect(visit().app.phase).toBe(PHASES.SPLASH)

    storage.set(KEY, JSON.stringify({ version: 1, savedAt: Date.now(), phase: 'live' }))
    const next = visit()
    expect(next.app.phase).toBe(PHASES.SPLASH)
    expect(storage.has(KEY)).toBe(false)
  })

  it('forgets everything on request: team, squad, settings and results', async () => {
    const first = visit()
    first.app.confirmTeamName('LPS')
    first.setup.setFieldSize(7)
    kickOff(first)
    first.app.endMatch()
    await settle()
    expect([...storage.keys()].sort()).toEqual([
      'peluutinKnownPlayers',
      'peluutinRoster',
      'peluutinSession',
      'sortOfAPlanMatchSettings',
      'sortOfAPlanTeamName',
    ])

    first.app.forgetEverything()
    await settle()
    expect(storage.size).toBe(0)
    expect(first.app.phase).toBe(PHASES.SPLASH)
    expect(first.app.teamName).toBe('')
    expect(first.setup.roster).toEqual([])
    expect(first.setup.fieldSize).toBe(5)
    expect(first.matchday.matches).toEqual([])

    const next = visit()
    expect(next.setup.roster).toEqual([])
    expect(next.setup.fieldSize).toBe(5)
    expect(next.matchday.matches).toEqual([])
  })
})
