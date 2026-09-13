import { defineStore } from 'pinia'
import { playedBy } from '@/domain/history.js'
import { createMatchRecord, matchdaySummary } from '@/domain/matchday.js'
import { useTeamsStore } from './teams.js'

/**
 * Every finished match of the session. Records are snapshots — nothing here is
 * recomputed from live state, so the history cannot drift.
 */
export const useMatchdayStore = defineStore('matchday', {
  state: () => ({
    matches: [],
  }),

  getters: {
    /** Today's matches for the team being coached; another team's are theirs. */
    ours: (state) => {
      const teams = useTeamsStore()
      return playedBy(state.matches, teams.activeId, teams.inheritsOldMatches)
    },

    summary() {
      return matchdaySummary(this.ours)
    },

    hasMatches() {
      return this.ours.length > 0
    },
  },

  actions: {
    record(match) {
      this.matches.push(createMatchRecord(match))
    },

    clear() {
      this.matches = []
    },
  },
})
