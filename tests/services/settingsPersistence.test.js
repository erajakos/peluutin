import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createApp } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { pickMatchSettings, sanitizeMatchSettings } from '@/domain/matchSettings.js'
import { setLocale } from '@/i18n/index.js'
import { persistMatchSettings } from '@/services/settingsPersistence.js'
import { useSetupStore } from '@/stores/setup.js'

const KEY = 'sortOfAPlanMatchSettings'

/** A stand-in for the browser's localStorage, fresh for every test. */
function installStorage() {
  const data = new Map()
  globalThis.window = {
    localStorage: {
      getItem: (key) => (data.has(key) ? data.get(key) : null),
      setItem: (key, value) => data.set(key, String(value)),
    },
  }
  return data
}

/** A new app visit: a fresh Pinia with the plugin, over whatever is stored. */
function visit() {
  const pinia = createPinia()
  pinia.use(persistMatchSettings)
  // Pinia applies plugins only once it is installed into an app, as main.js does.
  createApp({}).use(pinia)
  setActivePinia(pinia)
  return useSetupStore()
}

describe('remembering match settings', () => {
  let storage

  beforeEach(() => {
    storage = installStorage()
    setLocale('fi')
  })

  afterEach(() => {
    delete globalThis.window
  })

  it('brings back how the match is played on the next visit', () => {
    const first = visit()
    first.setTwoHalves(true)
    first.setPeriodLength(20)
    first.setFieldSize(7)
    first.applyFormation('3-2-1')
    first.trackCards = true

    const next = visit()
    expect(next.twoHalves).toBe(true)
    expect(next.halfLength).toBe(20)
    expect(next.gameLength).toBe(40)
    expect(next.fieldSize).toBe(7)
    expect(next.formationId).toBe('3-2-1')
    expect(next.trackCards).toBe(true)
  })

  it('never remembers the squad or the opponent', () => {
    const first = visit()
    first.addPlayer('Aino')
    first.opponentName = 'PPJ'

    const saved = JSON.parse(storage.get(KEY))
    expect(saved).not.toHaveProperty('roster')
    expect(saved).not.toHaveProperty('opponentName')

    const next = visit()
    expect(next.roster).toEqual([])
    expect(next.opponentName).toBe('')
  })

  it('keeps a position the coach renamed', () => {
    const first = visit()
    first.renamePosition(0, 'Kapteeni')

    const next = visit()
    expect(next.positions[0].label).toBe('Kapteeni')
  })

  it('starts from the defaults when nothing has been saved', () => {
    const setup = visit()
    expect(setup.gameLength).toBe(30)
    expect(setup.fieldSize).toBe(5)
  })

  it('ignores storage it cannot read instead of breaking', () => {
    storage.set(KEY, '{not json')
    const setup = visit()
    expect(setup.gameLength).toBe(30)
  })

  it('replaces a remembered shape that no longer fits the format', () => {
    storage.set(
      KEY,
      JSON.stringify({ fieldSize: 7, hasGoalkeeper: true, formationId: 'diamond', positions: [] }),
    )
    const setup = visit()
    // Seven a side with a keeper is six outfield players: a diamond cannot fit.
    expect(setup.positions).toHaveLength(6)
    expect(setup.formations.map((formation) => formation.id)).toContain(setup.formationId)
  })
})

describe('changing language', () => {
  beforeEach(() => {
    installStorage()
    setLocale('fi')
  })

  afterEach(() => {
    delete globalThis.window
    setLocale('fi')
  })

  it('keeps the chosen formation rather than resetting to the default', () => {
    const setup = visit()
    setup.setFieldSize(7)
    setup.applyFormation('3-2-1')
    setLocale('en')
    setup.relabelPositionsForLocale()
    expect(setup.formationId).toBe('3-2-1')
  })

  it("translates stock position names but leaves the coach's own", () => {
    const setup = visit()
    setup.renamePosition(0, 'Kapteeni')
    const stockKey = setup.positions[1].key
    setLocale('en')
    setup.relabelPositionsForLocale()
    expect(setup.positions[0].label).toBe('Kapteeni')
    expect(setup.positions[1].label).toBe(stockKey)
  })
})

describe('sanitizeMatchSettings', () => {
  it('drops values of the wrong type or out of range', () => {
    const clean = sanitizeMatchSettings({
      gameLength: 'thirty',
      fieldSize: 0,
      subLimit: 2.5,
      trackCards: 'yes',
      halfLength: 15,
    })
    expect(clean).toEqual({ halfLength: 15 })
  })

  it('drops keys it does not know, including the squad', () => {
    const clean = sanitizeMatchSettings({ roster: [{ id: 1, name: 'Aino' }], fieldSize: 5 })
    expect(clean).toEqual({ fieldSize: 5 })
  })

  it('refuses malformed positions', () => {
    expect(sanitizeMatchSettings({ positions: [{ key: 'Striker' }] })).toEqual({})
  })

  it('round-trips everything it picks', () => {
    const state = {
      gameLength: 40,
      halfLength: 20,
      fieldSize: 7,
      subLimit: 5,
      twoHalves: true,
      hasGoalkeeper: true,
      fixedGoalkeeper: false,
      allowReentry: true,
      subLimitEnabled: true,
      trackCards: true,
      formationId: '3-2-1',
      positions: [{ key: 'Striker', label: 'Kärki' }],
      roster: [{ id: 1, name: 'Aino' }],
    }
    const picked = pickMatchSettings(state)
    expect(picked).not.toHaveProperty('roster')
    expect(sanitizeMatchSettings(JSON.parse(JSON.stringify(picked)))).toEqual(picked)
  })
})
