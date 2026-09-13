import { defineStore } from 'pinia'
import { nextId } from '@/domain/ids.js'
import { createMatchRecord } from '@/domain/matchday.js'
import { setLocale } from '@/i18n/index.js'
import { clearAllSaved, loadTeamName, saveLanguage, saveTeamName } from '@/services/storage.js'
import { useMatchStore } from './match.js'
import { useHistoryStore } from './history.js'
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
  MENU: 'menu',
  INFO: 'info',
  HELP: 'help',
  CHANGELOG: 'changelog',
  HISTORY: 'history',
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
    /**
     * The screens a page was opened from, innermost last. A stack rather than
     * one remembered screen: the info page opens the list of changes, and
     * coming back from that must not cost the info page its own way out.
     */
    pageStack: [],
    teamName: loadTeamName(),
  }),

  actions: {
    /**
     * The pages off the front screen — what has been played, how the app works,
     * what it keeps — are detours rather than steps: each returns where it came
     * from, so none of them can strand a coach mid-match.
     */
    openPage(phase) {
      if (this.phase === phase) return
      this.pageStack.push(this.phase)
      this.phase = phase
    },

    closePage() {
      this.phase = this.pageStack.pop() ?? PHASES.MENU
    },

    /**
     * A step in the matchday itself, as opposed to a detour off it. The way
     * back through the pages is dropped: it led to screens this match has
     * moved on from.
     */
    goTo(phase) {
      this.pageStack = []
      this.phase = phase
    },

    setLanguage(code) {
      setLocale(code)
      saveLanguage(code)
      // Name the positions in the chosen language, keeping the chosen shape.
      useSetupStore().relabelPositionsForLocale()
    },

    /** The splash asks one question — which language — and then stands aside. */
    chooseLanguage(code) {
      this.setLanguage(code)
      this.goTo(PHASES.MENU)
    },

    /** A returning coach has already told us their team; do not ask again. */
    startNewMatch() {
      this.goTo(this.teamName ? PHASES.OPPONENT : PHASES.TEAM)
    },

    /** The team name is remembered across visits; the opponent never is. */
    confirmTeamName(name) {
      const trimmed = name.trim()
      if (!trimmed) return false
      this.teamName = trimmed
      saveTeamName(trimmed)
      this.goTo(PHASES.OPPONENT)
      return true
    },

    editTeamName() {
      this.goTo(PHASES.TEAM)
    },

    // --- Setting up a match, one question per screen ---------------------
    confirmOpponent(name) {
      const setup = useSetupStore()
      const trimmed = name.trim()
      if (!trimmed) return false
      setup.opponentName = trimmed
      this.goTo(PHASES.SETTINGS)
      return true
    },

    backToOpponent() {
      this.goTo(PHASES.OPPONENT)
    },

    openSquad() {
      this.goTo(PHASES.SQUAD)
    },

    backToSettings() {
      this.goTo(PHASES.SETTINGS)
    },

    backToSquad() {
      this.goTo(PHASES.SQUAD)
    },

    /** Setup is complete: build the empty starting lineup and go fill it in. */
    openLineup() {
      const setup = useSetupStore()
      if (!setup.hasEnoughPlayers) return false
      useMatchStore().startLineup(setup.createStartingSlots())
      this.goTo(PHASES.LINEUP)
      return true
    },

    kickOff() {
      const match = useMatchStore()
      if (!match.lineupComplete) return
      match.kickOff(useSetupStore().roster)
      this.goTo(PHASES.LIVE)
    },

    /** Stop the clock, file the result, and show the playing-time summary. */
    endMatch() {
      const match = useMatchStore()
      const setup = useSetupStore()
      match.finish()
      const record = {
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
      }
      useMatchdayStore().record(record)
      // The same match twice over: today's stats clear tonight, this one keeps.
      useHistoryStore().record(createMatchRecord(record))
      this.goTo(PHASES.SUMMARY)
    },

    /** Same squad, same format, new fixture — so it starts at the opponent. */
    playAnotherMatch() {
      useMatchStore().reset()
      useSetupStore().prepareNextMatch()
      this.goTo(PHASES.OPPONENT)
    },

    finishSession() {
      this.goTo(PHASES.STATS)
    },

    /** Done for now: back to the front, with the day's results still standing. */
    backToMenu() {
      useMatchStore().reset()
      this.goTo(PHASES.MENU)
    },

    /**
     * Start over as if on a new phone: the team, the squad, the settings and
     * the day's results are all forgotten, here and in the device's storage.
     */
    forgetEverything() {
      useMatchStore().reset()
      useMatchdayStore().clear()
      useHistoryStore().clear()
      useSetupStore().$reset()
      // After the resets, which save their now-empty state on the way through.
      clearAllSaved()
      this.teamName = ''
      this.goTo(PHASES.SPLASH)
    },
  },
})
