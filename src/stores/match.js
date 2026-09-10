import { defineStore } from 'pinia'
import { nextId } from '@/domain/ids.js'
import { benchPlayers, isLineupComplete } from '@/domain/lineup.js'
import { rotationHints, isEligibleToReturn } from '@/domain/rotation.js'
import {
  assignPlayer,
  canConfirmSubstitution,
  createAssignment,
  isAssignmentComplete,
  isLimitReached,
  needsAssignment,
  remainingSubs,
} from '@/domain/substitutions.js'
import { TEAM_OPPONENT, TEAM_US, countGoals } from '@/domain/scoring.js'
import { minutesToSeconds } from '@/domain/time.js'
import { createSecondTicker } from '@/services/ticker.js'
import { useSetupStore } from './setup.js'

/**
 * The clock lives outside the store state on purpose: it is a live timer, not
 * data, and Pinia has no business tracking it reactively.
 */
let ticker = null

function emptyMatch() {
  return {
    slots: [],
    players: [],
    elapsedSeconds: 0,
    running: false,
    currentHalf: 1,
    selectedOffSlotIds: new Set(),
    selectedOnPlayerIds: new Set(),
    outForGood: new Set(),
    subsUsed: 0,
    pendingAssignment: null,
    /** True while the bench selection was made for the coach, not by them. */
    autoSelectedOn: false,
    goals: [],
    pendingGoal: false,
    cards: [],
    confirmingEnd: false,
  }
}

/** Everything that is true only about the match currently being played. */
export const useMatchStore = defineStore('match', {
  state: emptyMatch,

  getters: {
    rules: () => useSetupStore().matchRules,

    playersById: (state) => new Map(state.players.map((player) => [player.id, player])),

    filledSlots: (state) => state.slots.filter((slot) => slot.playerId !== null),

    bench: (state) => benchPlayers(state.players, state.slots),

    /** Bench players actually allowed back on under this match's rules. */
    availableBench(state) {
      return this.bench.filter((player) =>
        isEligibleToReturn(player.id, this.rules.allowReentry, state.outForGood),
      )
    },

    lineupComplete: (state) => isLineupComplete(state.slots),

    /** The fixed goalkeeper, who sits outside the rotation and the fairness maths. */
    goalkeeperId(state) {
      if (!this.rules.fixedGoalkeeper) return null
      return state.slots.find((slot) => slot.isGoalkeeper)?.playerId ?? null
    },

    hints(state) {
      return rotationHints({
        slots: state.slots,
        players: state.players,
        fixedGoalkeeper: this.rules.fixedGoalkeeper,
        allowReentry: this.rules.allowReentry,
        outForGood: state.outForGood,
      })
    },

    remainingSubs(state) {
      return remainingSubs({ ...this.rules, subsUsed: state.subsUsed })
    },

    limitReached(state) {
      return isLimitReached({ ...this.rules, subsUsed: state.subsUsed })
    },

    canConfirmSub(state) {
      return canConfirmSubstitution({
        offCount: state.selectedOffSlotIds.size,
        onCount: state.selectedOnPlayerIds.size,
        remaining: this.remainingSubs,
      })
    },

    totalSeconds: () => minutesToSeconds(useSetupStore().totalMinutes),

    isFullTime(state) {
      return state.elapsedSeconds >= this.totalSeconds
    },

    /** First half played out, second half not started — time for the talk. */
    atHalfTime(state) {
      const setup = useSetupStore()
      return (
        setup.twoHalves &&
        state.currentHalf === 1 &&
        state.elapsedSeconds >= minutesToSeconds(setup.halfLength)
      )
    },

    usScore: (state) => countGoals(state.goals, TEAM_US),
    opponentScore: (state) => countGoals(state.goals, TEAM_OPPONENT),
  },

  actions: {
    // --- Lineup -----------------------------------------------------------
    startLineup(slots) {
      this.$patch(emptyMatch())
      this.slots = slots
    },

    assignSlot(slotId, playerId) {
      const slot = this.slots.find((candidate) => candidate.id === slotId)
      if (slot) slot.playerId = playerId
    },

    kickOff(roster) {
      this.players = roster.map((player) => ({
        id: player.id,
        name: player.name,
        seconds: 0,
        // Time in the player's current situation — on the field or waiting to
        // come back on. This is the number a coach actually asks for: not "how
        // long have you played" but "how long have you been sitting there".
        stintSeconds: 0,
      }))
      this.elapsedSeconds = 0
      this.currentHalf = 1
    },

    // --- Clock ------------------------------------------------------------
    /**
     * Advance the match and credit every player currently on the field. Time is
     * only ever credited to a slot that holds a player, so the bench genuinely
     * costs minutes.
     */
    tick(seconds = 1) {
      this.elapsedSeconds += seconds
      const onField = new Set(this.slots.map((slot) => slot.playerId))
      this.players.forEach((player) => {
        player.stintSeconds += seconds
        if (onField.has(player.id)) player.seconds += seconds
      })
    },

    start() {
      if (this.running) return
      ticker = ticker ?? createSecondTicker((seconds) => this.tick(seconds))
      ticker.start()
      this.running = true
    },

    pause() {
      ticker?.stop()
      this.running = false
    },

    toggleRun() {
      if (this.running) this.pause()
      else this.start()
    },

    startSecondHalf() {
      this.currentHalf = 2
      this.start()
    },

    // --- Substitutions ----------------------------------------------------
    toggleOffSlot(slotId) {
      toggleIn(this.selectedOffSlotIds, slotId)
      this.autoSelectIncoming()
    },

    toggleOnPlayer(playerId) {
      toggleIn(this.selectedOnPlayerIds, playerId)
      // Once the coach picks for themselves, stop picking for them.
      this.autoSelectedOn = false
    },

    /**
     * When exactly as many players are available on the bench as are going off,
     * there is only one possible answer — so fill it in and save the taps. The
     * choice stays fully editable, and is withdrawn again if the coach changes
     * how many players are coming off.
     */
    autoSelectIncoming() {
      if (this.autoSelectedOn) {
        this.selectedOnPlayerIds.clear()
        this.autoSelectedOn = false
      }
      if (this.selectedOnPlayerIds.size > 0) return

      const going = this.selectedOffSlotIds.size
      const available = this.availableBench
      if (going === 0 || available.length !== going) return

      available.forEach((player) => this.selectedOnPlayerIds.add(player.id))
      this.autoSelectedOn = true
    },

    clearSelection() {
      this.selectedOffSlotIds.clear()
      this.selectedOnPlayerIds.clear()
      this.pendingAssignment = null
      this.autoSelectedOn = false
    },

    canPlayerReturn(playerId) {
      return isEligibleToReturn(playerId, this.rules.allowReentry, this.outForGood)
    },

    /**
     * One-for-one changes apply straight away. Anything larger needs the coach
     * to say who takes which position first.
     */
    confirmSubstitution() {
      if (!this.canConfirmSub) return
      const offSlotIds = [...this.selectedOffSlotIds]
      const onPlayerIds = [...this.selectedOnPlayerIds]

      if (needsAssignment(offSlotIds)) {
        this.pendingAssignment = createAssignment(offSlotIds, onPlayerIds)
        return
      }
      this.swapPlayer(offSlotIds[0], onPlayerIds[0])
      this.clearSelection()
    },

    setAssignment(slotId, playerId) {
      if (!this.pendingAssignment) return
      this.pendingAssignment = assignPlayer(this.pendingAssignment, slotId, playerId)
    },

    applyAssignment() {
      if (!this.pendingAssignment || !isAssignmentComplete(this.pendingAssignment)) return
      const { offSlotIds, map } = this.pendingAssignment
      offSlotIds.forEach((slotId) => this.swapPlayer(slotId, map[slotId]))
      this.clearSelection()
    },

    cancelAssignment() {
      this.clearSelection()
    },

    /** Move one player off and another on, counting it against the sub limit. */
    swapPlayer(slotId, incomingPlayerId) {
      const slot = this.slots.find((candidate) => candidate.id === slotId)
      if (!slot) return
      const outgoingId = slot.playerId
      slot.playerId = incomingPlayerId

      // Both players start a fresh stint: one begins resting, one begins playing.
      const players = this.playersById
      const outgoing = players.get(outgoingId)
      const incoming = players.get(incomingPlayerId)
      if (outgoing) outgoing.stintSeconds = 0
      if (incoming) incoming.stintSeconds = 0

      if (!this.rules.allowReentry && outgoingId !== null) this.outForGood.add(outgoingId)
      this.subsUsed += 1
    },

    // --- Goals ------------------------------------------------------------
    addOpponentGoal() {
      this.goals.push({
        id: nextId(),
        team: TEAM_OPPONENT,
        playerId: null,
        atSecond: this.elapsedSeconds,
      })
    },

    beginOurGoal() {
      this.pendingGoal = true
    },

    cancelOurGoal() {
      this.pendingGoal = false
    },

    confirmOurGoal(playerId) {
      this.goals.push({
        id: nextId(),
        team: TEAM_US,
        playerId: playerId ?? null,
        atSecond: this.elapsedSeconds,
      })
      this.pendingGoal = false
    },

    /** Attribute a goal after the fact — a scorer is often identified late. */
    setGoalScorer(goalId, playerId) {
      const goal = this.goals.find((candidate) => candidate.id === goalId)
      if (goal) goal.playerId = playerId ?? null
    },

    removeGoal(goalId) {
      this.goals = this.goals.filter((goal) => goal.id !== goalId)
    },

    // --- Cards ------------------------------------------------------------
    addCard(playerId, type) {
      if (!playerId) return
      this.cards.push({ id: nextId(), playerId, type, atSecond: this.elapsedSeconds })
    },

    removeCard(cardId) {
      this.cards = this.cards.filter((card) => card.id !== cardId)
    },

    // --- Ending -----------------------------------------------------------
    requestEnd() {
      this.confirmingEnd = true
    },

    cancelEnd() {
      this.confirmingEnd = false
    },

    finish() {
      this.pause()
      this.confirmingEnd = false
    },

    playerName(playerId) {
      return this.playersById.get(playerId)?.name ?? ''
    },

    reset() {
      this.pause()
      this.$patch(emptyMatch())
    },
  },
})

function toggleIn(set, value) {
  if (set.has(value)) set.delete(value)
  else set.add(value)
}
