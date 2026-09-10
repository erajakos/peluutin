import { defineStore } from 'pinia'
import { findFormation, getFormationsFor, outfieldCount } from '@/domain/formations.js'
import { buildSlots } from '@/domain/lineup.js'
import { nextId } from '@/domain/ids.js'
import { t, tPosition } from '@/i18n/index.js'

/** Below this many players on the field, a substitution cap makes no sense. */
const SUB_LIMIT_MIN_FIELD_SIZE = 6

/** Five-a-side with a keeper and a diamond in front: the commonest junior game. */
const DEFAULT_FORMATION = findFormation(4, 'diamond')

/**
 * How the match is played and who is available: format, rules, shape, squad.
 * Everything here survives from one match to the next within a session — only
 * the opponent is cleared, because the squad rarely changes between games.
 */
export const useSetupStore = defineStore('setup', {
  state: () => ({
    opponentName: '',
    gameLength: 40,
    twoHalves: false,
    halfLength: 20,
    fieldSize: 5,
    hasGoalkeeper: true,
    fixedGoalkeeper: true,
    formationId: 'diamond',
    /** `{ key, label }` — the key drives the pitch layout, the label is the
     *  coach's own wording and can be edited freely. */
    positions: DEFAULT_FORMATION.positions.map((key) => ({ key, label: tPosition(key) })),
    allowReentry: true,
    subLimitEnabled: false,
    subLimit: 5,
    trackCards: false,
    roster: [],
  }),

  getters: {
    outfieldCount: (state) => outfieldCount(state.fieldSize, state.hasGoalkeeper),

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
        fixedGoalkeeper: state.hasGoalkeeper && state.fixedGoalkeeper,
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

    setHasGoalkeeper(enabled) {
      this.hasGoalkeeper = enabled
      if (!enabled) this.fixedGoalkeeper = false
      this.syncFormationToFormat()
    },

    /**
     * Changing the format changes how many positions exist, so fall back to the
     * default shape for the new size rather than leaving a stale line-up behind.
     */
    syncFormationToFormat() {
      if (this.positions.length === this.outfieldCount) return
      this.applyFormation(this.formations[0].id)
    },

    applyFormation(id) {
      const formation = findFormation(this.outfieldCount, id)
      this.formationId = formation.id
      this.positions = formation.positions.map((key) => ({ key, label: tPosition(key) }))
    },

    /** Re-seed the default shape in the newly chosen language. */
    resetFormationForLocale() {
      this.applyFormation(this.formations[0].id)
    },

    renamePosition(index, label) {
      this.positions[index].label = label
    },

    addPlayer(name) {
      const trimmed = name.trim()
      if (!trimmed) return false
      this.roster.push({ id: nextId(), name: trimmed })
      return true
    },

    removePlayer(id) {
      this.roster = this.roster.filter((player) => player.id !== id)
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
        hasGoalkeeper: this.hasGoalkeeper,
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
