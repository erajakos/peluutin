import { defineStore } from 'pinia'
import { createHistoryEntry, groupByDay, playedBy, trimHistory } from '@/domain/history.js'
import { useTeamsStore } from './teams.js'

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
    /** Only this team's matches count as "what we have played". */
    ours: (state) => {
      const teams = useTeamsStore()
      return playedBy(state.entries, teams.activeId, teams.inheritsOldMatches)
    },

    /** What the team being coached has played, newest day first. */
    days() {
      return groupByDay(this.ours)
    },

    hasEntries() {
      return this.ours.length > 0
    },
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
