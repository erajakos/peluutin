import { defineStore } from 'pinia'
import { nextId } from '@/domain/ids.js'
import { setLocale } from '@/i18n/index.js'
import { loadTeamName, saveTeamName } from '@/services/storage.js'
import { useMatchStore } from './match.js'
import { useMatchdayStore } from './matchday.js'
import { useSetupStore } from './setup.js'

/**
 * The phases a matchday moves through, in order. Each one is a full screen, and
 * the only way between them is an action on this store — which keeps the flow
 * readable in one place instead of scattered across views.
 *
 * Setting up a match is three steps rather than one long form: who you are
 * playing, how the match is played, and who is available. Each asks one thing,
 * and each can be gone back to without losing the others.
 */
export const PHASES = Object.freeze({
  SPLASH: 'splash',
  INFO: 'info',
  TEAM: 'team',
  OPPONENT: 'opponent',
  SETTINGS: 'settings',
  SQUAD: 'squad',
  LINEUP: 'lineup',
  LIVE: 'live',
  SUMMARY: 'summary',
  STATS: 'stats',
})

export const useAppStore = defineStore('app', {
  state: () => ({
    phase: PHASES.SPLASH,
    /** Where to return to when the info page is closed. */
    previousPhase: PHASES.SPLASH,
    teamName: loadTeamName(),
  }),

  getters: {
    /**
     * Whether leaving the page would lose something the coach cannot get back.
     * A squad typed in, or any match already played, counts; the splash and the
     * team-name screen do not.
     */
    hasWorkToLose(state) {
      if ([PHASES.SPLASH, PHASES.INFO, PHASES.TEAM].includes(state.phase)) return false
      return useSetupStore().roster.length > 0 || useMatchdayStore().hasMatches
    },
  },

  actions: {
    /** The info page is a detour, not a step: it always returns where it came from. */
    openInfo() {
      if (this.phase === PHASES.INFO) return
      this.previousPhase = this.phase
      this.phase = PHASES.INFO
    },

    closeInfo() {
      this.phase = this.previousPhase
    },

    chooseLanguage(code) {
      setLocale(code)
      // Seed the default shape now that we know which language to name it in.
      useSetupStore().resetFormationForLocale()
      // A returning coach has already told us their team; do not ask again.
      this.phase = this.teamName ? PHASES.OPPONENT : PHASES.TEAM
    },

    /** The team name is remembered across visits; the opponent never is. */
    confirmTeamName(name) {
      const trimmed = name.trim()
      if (!trimmed) return false
      this.teamName = trimmed
      saveTeamName(trimmed)
      this.phase = PHASES.OPPONENT
      return true
    },

    editTeamName() {
      this.phase = PHASES.TEAM
    },

    // --- Setting up a match, one question per screen ---------------------
    confirmOpponent(name) {
      const setup = useSetupStore()
      const trimmed = name.trim()
      if (!trimmed) return false
      setup.opponentName = trimmed
      this.phase = PHASES.SETTINGS
      return true
    },

    backToOpponent() {
      this.phase = PHASES.OPPONENT
    },

    openSquad() {
      this.phase = PHASES.SQUAD
    },

    backToSettings() {
      this.phase = PHASES.SETTINGS
    },

    backToSquad() {
      this.phase = PHASES.SQUAD
    },

    /** Setup is complete: build the empty starting lineup and go fill it in. */
    openLineup() {
      const setup = useSetupStore()
      if (!setup.hasEnoughPlayers) return false
      useMatchStore().startLineup(setup.createStartingSlots())
      this.phase = PHASES.LINEUP
      return true
    },

    kickOff() {
      const match = useMatchStore()
      if (!match.lineupComplete) return
      match.kickOff(useSetupStore().roster)
      this.phase = PHASES.LIVE
    },

    /** Stop the clock, file the result, and show the playing-time summary. */
    endMatch() {
      const match = useMatchStore()
      const setup = useSetupStore()
      match.finish()
      useMatchdayStore().record({
        id: nextId(),
        opponent: setup.opponentName,
        usScore: match.usScore,
        opponentScore: match.opponentScore,
        players: match.players.map((player) => ({
          ...player,
          isGoalkeeper: player.id === match.goalkeeperId,
        })),
        goals: match.goals,
        cards: setup.trackCards ? match.cards : [],
      })
      this.phase = PHASES.SUMMARY
    },

    /** Same squad, same format, new fixture — so it starts at the opponent. */
    playAnotherMatch() {
      useMatchStore().reset()
      useSetupStore().prepareNextMatch()
      this.phase = PHASES.OPPONENT
    },

    finishSession() {
      this.phase = PHASES.STATS
    },
  },
})
