import { defineStore } from 'pinia'
import { nextId } from '@/domain/ids.js'
import {
  createTeam,
  findTeam,
  isNameTaken,
  withName,
  withRoster,
  withoutTeam,
} from '@/domain/teams.js'
import { useSetupStore } from './setup.js'

/**
 * Which teams this device knows, and which one is being coached right now.
 *
 * The squad lives with its team: switching teams puts one squad away and takes
 * the other out, so a coach with two age groups is never picking their way
 * through a list of thirty names.
 */
export const useTeamsStore = defineStore('teams', {
  state: () => ({
    teams: [],
    activeId: null,
  }),

  getters: {
    active: (state) => findTeam(state.teams, state.activeId),
    /** The name shown on scoreboards and summaries; empty before the first team. */
    name() {
      return this.active?.name ?? ''
    },
    hasTeams: (state) => state.teams.length > 0,

    /**
     * Whether matches that name no team belong to this one: they do for the
     * first team, which is what an older version's single squad became — and
     * for a device with no teams at all, where there is nobody else to own them.
     */
    inheritsOldMatches: (state) => !state.teams.length || state.teams[0].id === state.activeId,
  },

  actions: {
    /**
     * Add a team and start coaching it. The squad starts empty, as it must, and
     * a name already in the list is refused rather than duplicated.
     */
    add(name) {
      const clean = name.trim()
      if (!clean || isNameTaken(this.teams, clean)) return null
      const team = createTeam(nextId(), clean)
      this.teams.push(team)
      this.select(team.id)
      return team
    },

    rename(id, name) {
      if (isNameTaken(this.teams, name, id)) return false
      this.teams = withName(this.teams, id, name)
      return true
    },

    /**
     * Put this team's squad away and take out the other's. The squad in hand is
     * saved first, so a name typed a second ago is not lost by switching.
     */
    select(id) {
      if (id === this.activeId) return
      this.keepRoster()
      this.activeId = id
      useSetupStore().restoreRoster(findTeam(this.teams, id)?.roster ?? [])
    },

    /** Write the squad in hand back to the team it belongs to. */
    keepRoster() {
      if (this.activeId === null) return
      const setup = useSetupStore()
      this.teams = withRoster(
        this.teams,
        this.activeId,
        setup.roster.map((player) => ({ id: player.id, name: player.typedName })),
      )
    },

    remove(id) {
      const wasActive = id === this.activeId
      this.teams = withoutTeam(this.teams, id)
      if (!wasActive) return
      this.activeId = null
      const next = this.teams[0] ?? null
      if (next) this.select(next.id)
      else useSetupStore().clearRoster()
    },

    /** Teams as they were saved, with the one last coached taken out again. */
    restore(teams, activeId) {
      teams.forEach((team) => {
        nextId.skipPast(team.id)
        team.roster.forEach((player) => nextId.skipPast(player.id))
      })
      this.teams = teams
      this.activeId = findTeam(teams, activeId) ? activeId : (teams[0]?.id ?? null)
      if (this.activeId !== null) {
        useSetupStore().restoreRoster(findTeam(this.teams, this.activeId).roster)
      }
    },
  },
})
