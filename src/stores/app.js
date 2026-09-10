import { defineStore } from 'pinia'
import { nextId } from '@/domain/ids.js'
import { setLocale } from '@/i18n/index.js'
import { loadTeamName, saveTeamName } from '@/services/storage.js'
import { useMatchStore } from './match.js'
import { useSeasonStore } from './season.js'
import { useSetupStore } from './setup.js'

/**
 * The phases a matchday moves through, in order. Each one is a full screen, and
 * the only way between them is an action on this store — which keeps the flow
 * readable in one place instead of scattered across views.
 */
export const PHASES = Object.freeze({
  SPLASH: 'splash',
  INFO: 'info',
  TEAM: 'team',
  SETUP: 'setup',
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
      this.phase = PHASES.TEAM
    },

    /** The team name is remembered across visits; the opponent never is. */
    confirmTeamName(name) {
      const trimmed = name.trim()
      if (!trimmed) return false
      this.teamName = trimmed
      saveTeamName(trimmed)
      this.phase = PHASES.SETUP
      return true
    },

    editTeamName() {
      this.phase = PHASES.TEAM
    },

    /** Setup is complete: build the empty starting lineup and go fill it in. */
    openLineup() {
      useMatchStore().startLineup(useSetupStore().createStartingSlots())
      this.phase = PHASES.LINEUP
    },

    backToSetup() {
      this.phase = PHASES.SETUP
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
      useSeasonStore().record({
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

    /** Same squad, same format, new fixture. */
    playAnotherMatch() {
      useMatchStore().reset()
      useSetupStore().prepareNextMatch()
      this.phase = PHASES.SETUP
    },

    finishSession() {
      this.phase = PHASES.STATS
    },
  },
})
