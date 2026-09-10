import { defineStore } from 'pinia'
import { createMatchRecord, matchdaySummary } from '@/domain/matchday.js'

/**
 * Every finished match of the session. Records are snapshots — nothing here is
 * recomputed from live state, so the history cannot drift.
 */
export const useMatchdayStore = defineStore('matchday', {
  state: () => ({
    matches: [],
  }),

  getters: {
    summary: (state) => matchdaySummary(state.matches),
    hasMatches: (state) => state.matches.length > 0,
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
