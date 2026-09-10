import { defineStore } from 'pinia'
import { createMatchRecord, seasonSummary } from '@/domain/season.js'

/**
 * Every finished match of the session. Records are snapshots — nothing here is
 * recomputed from live state, so the history cannot drift.
 */
export const useSeasonStore = defineStore('season', {
  state: () => ({
    matches: [],
  }),

  getters: {
    summary: (state) => seasonSummary(state.matches),
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
