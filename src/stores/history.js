import { defineStore } from 'pinia'
import { createHistoryEntry, groupByDay, trimHistory } from '@/domain/history.js'

/**
 * Every match this device has played, not just today's.
 *
 * The matchday store is about the afternoon in progress and is cleared when a
 * new day starts; this one keeps going, so a coach can look back at a match
 * from three weeks ago and see who played how long.
 */
export const useHistoryStore = defineStore('history', {
  state: () => ({
    entries: [],
  }),

  getters: {
    /** Newest day first, each with the matches played in it and their totals. */
    days: (state) => groupByDay(state.entries),
    hasEntries: (state) => state.entries.length > 0,
  },

  actions: {
    record(match, playedAt = Date.now()) {
      this.entries = trimHistory([...this.entries, createHistoryEntry(match, playedAt)])
    },

    restore(entries) {
      this.entries = trimHistory(entries)
    },

    clear() {
      this.entries = []
    },
  },
})
