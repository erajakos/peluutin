import { defineStore } from 'pinia'
import { findFormation, getFormationsFor, outfieldCount } from '@/domain/formations.js'
import { buildSlots } from '@/domain/lineup.js'
import { nextId } from '@/domain/ids.js'
import { knownPlayerId, numberDuplicateNames, rememberPlayers } from '@/domain/roster.js'
import { isStockPositionLabel, t, tPosition } from '@/i18n/index.js'

/** Below this many players on the field, a substitution cap makes no sense. */
const SUB_LIMIT_MIN_FIELD_SIZE = 6

/** Five-a-side with a keeper and a diamond in front: the commonest junior game. */
const DEFAULT_FORMATION = findFormation(4, 'diamond')

/**
 * How the match is played and who is available: format, rules, shape, squad.
 * Everything here survives from one match to the next — only the opponent is
 * cleared, because the squad rarely changes between games, or even between
 * weeks. The settings and the squad are remembered across visits too, by the
 * persistence plugins in `services/`.
 */
export const useSetupStore = defineStore('setup', {
  state: () => ({
    opponentName: '',
    gameLength: 30,
    twoHalves: false,
    halfLength: 15,
    /** Counted the way a coach says it: the keeper is one of these. */
    fieldSize: 5,
    formationId: 'diamond',
    /** `{ key, label }` — the key drives the pitch layout, the label is the
     *  coach's own wording and can be edited freely. */
    positions: DEFAULT_FORMATION.positions.map((key) => ({ key, label: tPosition(key) })),
    allowReentry: true,
    subLimitEnabled: false,
    subLimit: 5,
    trackCards: false,
    roster: [],
    /**
     * Everyone this device has had in a squad, and the id they were given. A
     * player taken out and typed in again is the same child, and the day's
     * stats add their minutes up by id — so the id has to come back with them.
     */
    knownPlayers: [],
  }),

  getters: {
    outfieldCount: (state) => outfieldCount(state.fieldSize),

    formations() {
      return getFormationsFor(this.outfieldCount)
    },

    /** The number shown in the length field: a half when split, else the match. */
    periodLength: (state) => (state.twoHalves ? state.halfLength : state.gameLength),

    totalMinutes: (state) => (state.twoHalves ? state.halfLength * 2 : state.gameLength),

    canLimitSubs: (state) => state.fieldSize >= SUB_LIMIT_MIN_FIELD_SIZE,

    hasEnoughPlayers: (state) => state.roster.length >= state.fieldSize,

    /** Rules the live match needs, bundled so the match store stays decoupled. */
    matchRules(state) {
      return {
        allowReentry: state.allowReentry,
        subLimitEnabled: state.canLimitSubs && state.subLimitEnabled,
        subLimit: state.subLimit,
        /**
         * Every match has a keeper, and the keeper is reported apart from the
         * rotation: a player in goal by design would drag the fairness average
         * down and make everyone else look short-changed. Changing who is in
         * goal is a decision the pitch asks about, not a setting.
         */
        fixedGoalkeeper: true,
        trackCards: state.trackCards,
      }
    },
  },

  actions: {
    setTwoHalves(enabled) {
      this.twoHalves = enabled
      if (enabled) {
        this.halfLength = Math.max(1, Math.round(this.gameLength / 2))
        this.gameLength = this.halfLength * 2
      }
    },

    /** Sets the half length when split into halves, the full length otherwise. */
    setPeriodLength(minutes) {
      const value = Math.max(1, minutes)
      if (this.twoHalves) {
        this.halfLength = value
        this.gameLength = value * 2
      } else {
        this.gameLength = value
      }
    },

    setFieldSize(size) {
      this.fieldSize = Math.max(1, size)
      this.syncFormationToFormat()
    },

    /**
     * Changing the format changes how many positions exist, so fall back to the
     * default shape for the new size rather than leaving a stale line-up behind.
     */
    syncFormationToFormat() {
      const known = this.formations.some((formation) => formation.id === this.formationId)
      if (known && this.positions.length === this.outfieldCount) return
      this.applyFormation(this.formations[0].id)
    },

    applyFormation(id) {
      const formation = findFormation(this.outfieldCount, id)
      this.formationId = formation.id
      this.positions = formation.positions.map((key) => ({ key, label: tPosition(key) }))
    },

    /**
     * Name the positions in the newly chosen language. The formation is left
     * alone — it may be one the coach chose and the app remembered — and so is
     * any position the coach renamed themselves.
     */
    relabelPositionsForLocale() {
      this.positions.forEach((position) => {
        if (isStockPositionLabel(position.key, position.label)) {
          position.label = tPosition(position.key)
        }
      })
    },

    renamePosition(index, label) {
      this.positions[index].label = label
    },

    /**
     * Each player keeps the name as typed; `name` is what everything else shows,
     * numbered when two players share one so a coach can tell them apart.
     */
    addPlayer(name) {
      const trimmed = name.trim()
      if (!trimmed) return false
      const used = this.roster.map((player) => player.id)
      const id = knownPlayerId(this.knownPlayers, trimmed, used) ?? nextId()
      this.roster.push({ id, typedName: trimmed, name: trimmed })
      this.rememberRoster()
      this.renumberNames()
      return true
    },

    /** Keep the book of names up to date with whoever is in the squad now. */
    rememberRoster() {
      this.knownPlayers = rememberPlayers(
        this.knownPlayers,
        this.roster.map((player) => ({ id: player.id, name: player.typedName })),
      )
    },

    removePlayer(id) {
      this.roster = this.roster.filter((player) => player.id !== id)
      this.renumberNames()
    },

    /** A different group of players this time: start the squad from nothing. */
    clearRoster() {
      this.roster = []
    },

    /**
     * The squad from a previous visit. Players keep their saved ids, so the
     * same child is the same player in every match of the day's stats.
     */
    restoreRoster(players) {
      players.forEach((player) => nextId.skipPast(player.id))
      this.roster = players.map(({ id, name }) => ({ id, typedName: name, name }))
      this.rememberRoster()
      this.renumberNames()
    },

    /** The book of names from a previous visit. */
    restoreKnownPlayers(players) {
      players.forEach((player) => nextId.skipPast(player.id))
      this.knownPlayers = players.map(({ id, name }) => ({ id, name }))
    },

    renumberNames() {
      const shown = numberDuplicateNames(this.roster.map((player) => player.typedName))
      this.roster.forEach((player, index) => {
        player.name = shown[index]
      })
    },

    /** Positions left blank fall back to a numbered placeholder. */
    normalizePositions() {
      this.positions.forEach((position, index) => {
        position.label = position.label.trim() || `${t('positionFallback')} ${index + 1}`
      })
    },

    createStartingSlots() {
      this.normalizePositions()
      return buildSlots({
        positions: this.positions,
        goalkeeperLabel: t('goalkeeperLabel'),
      })
    },

    /** Keep the squad and the format; only the fixture changes. */
    prepareNextMatch() {
      this.opponentName = ''
    },
  },
})
