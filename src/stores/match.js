import { defineStore } from 'pinia'
import { nextId } from '@/domain/ids.js'
import { benchPlayers, drawForEmptySlots, isLineupComplete } from '@/domain/lineup.js'
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
import {
  TEAM_OPPONENT,
  TEAM_US,
  cardCount,
  countGoals,
  isSentOffByCards,
} from '@/domain/scoring.js'
import { minutesToSeconds } from '@/domain/time.js'
import { createSecondTicker } from '@/services/ticker.js'
import { useSetupStore } from './setup.js'

/**
 * The clock lives outside the store state on purpose: it is a live timer, not
 * data, and Pinia has no business tracking it reactively.
 */
let ticker = null

/**
 * Where a match played in halves has got to. Half time is a period of its own
 * because the coach calls it — the clock stops and nothing moves on until they
 * start the second half. A match played straight through stays in FIRST.
 */
export const PERIOD = Object.freeze({
  FIRST: 'first',
  HALF_TIME: 'halftime',
  SECOND: 'second',
})

function emptyMatch() {
  return {
    slots: [],
    players: [],
    elapsedSeconds: 0,
    running: false,
    period: PERIOD.FIRST,
    selectedOffSlotIds: new Set(),
    selectedOnPlayerIds: new Set(),
    outForGood: new Set(),
    /** Players whose match is over: a red card cannot be served out. */
    sentOff: new Set(),
    subsUsed: 0,
    pendingAssignment: null,
    /** Optional, chosen from the starting lineup; shown in the results. */
    captainId: null,
    /** True while the bench selection was made for the coach, not by them. */
    autoSelectedOn: false,
    /** Enough of the last substitution to put it back, if it was a mis-tap. */
    lastSub: null,
    /**
     * A keeper meant to play the whole match is kept out of the way of a stray
     * tap — until the coach says otherwise, because sometimes the keeper has
     * to come off: a knock, a bad afternoon, or simply a change of plan.
     */
    goalkeeperUnlocked: false,
    goals: [],
    pendingGoal: false,
    cards: [],
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

    /** Everything that decides whether a given player may take the field. */
    availability(state) {
      return {
        allowReentry: this.rules.allowReentry,
        outForGood: state.outForGood,
        sentOff: state.sentOff,
      }
    },

    /** Bench players actually allowed back on under this match's rules. */
    availableBench() {
      return this.bench.filter((player) => isEligibleToReturn(player.id, this.availability))
    },

    lineupComplete: (state) => isLineupComplete(state.slots),

    /** The draw only fills gaps, so it is on offer only while there is one. */
    canDrawLineup: (state) => state.slots.some((slot) => slot.playerId === null),

    /** Whether the keeper is still being held out of the coach's reach. */
    goalkeeperLocked(state) {
      return this.rules.fixedGoalkeeper && !state.goalkeeperUnlocked
    },

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
        availability: this.availability,
      })
    },

    remainingSubs(state) {
      return remainingSubs({ ...this.rules, subsUsed: state.subsUsed })
    },

    limitReached(state) {
      return isLimitReached({ ...this.rules, subsUsed: state.subsUsed })
    },

    /**
     * The one player the coach has picked out, if they have picked exactly one
     * — the player a card would be shown to. Bench players the app selected on
     * its own do not count: the coach tapped one shirt, so that is the choice.
     */
    cardCandidateId(state) {
      const onField = [...state.selectedOffSlotIds]
        .map((slotId) => state.slots.find((slot) => slot.id === slotId)?.playerId)
        .filter((playerId) => playerId !== null && playerId !== undefined)
      const fromBench = state.autoSelectedOn ? [] : [...state.selectedOnPlayerIds]
      const picked = [...onField, ...fromBench]
      return picked.length === 1 ? picked[0] : null
    },

    /**
     * Whether the last substitution can still be taken back. A player sent off
     * since cannot be put back on the field, so the offer quietly lapses.
     */
    canUndoSub(state) {
      if (!state.lastSub) return false
      return state.lastSub.stints.every(({ id }) => !state.sentOff.has(id))
    },

    /** Cards shown so far, per player — for marking them on the pitch and bench. */
    cardCountsById(state) {
      const counts = new Map()
      state.cards.forEach((card) => {
        if (!counts.has(card.playerId))
          counts.set(card.playerId, cardCount(state.cards, card.playerId))
      })
      return counts
    },

    /** Whether there is a selection for the coach to clear or confirm. */
    hasSelection: (state) =>
      state.selectedOffSlotIds.size > 0 || state.selectedOnPlayerIds.size > 0,

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

    atHalfTime: (state) => state.period === PERIOD.HALF_TIME,

    /**
     * The coach may call half time whenever the first half is under way. It is
     * not tied to the planned half length: referees do not blow on the coach's
     * clock, and the person on the touchline is the one who decides.
     *
     * "Under way" is exactly `!notStarted` — the same test that decides whether
     * the stop button is shown. Checking for a full elapsed second instead left
     * a moment where the button was visible but its action silently refused.
     */
    canEndFirstHalf(state) {
      return useSetupStore().twoHalves && state.period === PERIOD.FIRST && !this.notStarted
    },

    /** Only a nudge: the planned first half is up, so half time is probably due. */
    firstHalfPlanReached(state) {
      const setup = useSetupStore()
      return this.canEndFirstHalf && state.elapsedSeconds >= minutesToSeconds(setup.halfLength)
    },

    /** Nothing has happened yet: the whistle has not gone. */
    notStarted: (state) => !state.running && state.elapsedSeconds === 0,

    canStartSecondHalf: (state) => state.period === PERIOD.HALF_TIME,

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
      if (!slot) return
      slot.playerId = playerId
      // A captain is picked from the starting lineup; taken out of it, they are
      // no longer captain rather than captain of nothing.
      if (this.captainId !== null && !this.slots.some((s) => s.playerId === this.captainId)) {
        this.captainId = null
      }
    },

    setCaptain(playerId) {
      this.captainId = playerId ?? null
    },

    /**
     * Fill the empty positions at random. Anyone the coach has already placed
     * is left exactly where they are — a draw only ever fills gaps, and once it
     * has filled them there is nothing left for a second press to change.
     */
    drawLineup(roster, random = Math.random) {
      drawForEmptySlots(this.slots, roster, random).forEach(({ slotId, playerId }) => {
        this.assignSlot(slotId, playerId)
      })
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
      this.period = PERIOD.FIRST
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

    /**
     * Nudge the clock when it was started late, or left running too long. The
     * minutes move with it: a minute added is a minute every player on the
     * field was playing, exactly as if the clock had been running for it.
     */
    adjustClock(seconds) {
      if (seconds > 0) {
        this.tick(seconds)
        return
      }
      const taken = Math.min(-seconds, this.elapsedSeconds)
      if (taken <= 0) return
      this.elapsedSeconds -= taken
      const onField = new Set(this.slots.map((slot) => slot.playerId))
      this.players.forEach((player) => {
        player.stintSeconds = Math.max(0, player.stintSeconds - taken)
        if (onField.has(player.id)) player.seconds = Math.max(0, player.seconds - taken)
      })
    },

    start() {
      // During half time the only way on is to start the second half.
      if (this.running || this.period === PERIOD.HALF_TIME) return
      // A fresh ticker each time, bound to this store: after a restore, the one
      // left over from before must not be the one that keeps counting.
      ticker?.stop()
      ticker = createSecondTicker((seconds) => this.tick(seconds))
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

    /** Half time: the clock stops, and waits for the second half. */
    endFirstHalf() {
      if (!this.canEndFirstHalf) return
      this.pause()
      this.period = PERIOD.HALF_TIME
    },

    startSecondHalf() {
      if (!this.canStartSecondHalf) return
      this.period = PERIOD.SECOND
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
      return isEligibleToReturn(playerId, this.availability)
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
      this.rememberSubstitution(offSlotIds, onPlayerIds)
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
      this.rememberSubstitution(
        offSlotIds,
        offSlotIds.map((slotId) => map[slotId]),
      )
      offSlotIds.forEach((slotId) => this.swapPlayer(slotId, map[slotId]))
      this.clearSelection()
    },

    cancelAssignment() {
      this.clearSelection()
    },

    /**
     * Trade the positions of two players already on the field.
     *
     * This is not a substitution: nobody leaves, no allowance is spent, and
     * neither player's spell on the pitch is interrupted — so their minutes and
     * their current stint both carry on untouched.
     */
    swapSlotPlayers(slotIdA, slotIdB) {
      if (slotIdA === slotIdB) return false
      const first = this.slots.find((slot) => slot.id === slotIdA)
      const second = this.slots.find((slot) => slot.id === slotIdB)
      if (!first || !second) return false
      this.lastSub = null
      // One may be a vacancy — moving into it is a reshuffle, not a swap.
      if (first.playerId === null && second.playerId === null) return false

      const held = first.playerId
      first.playerId = second.playerId
      second.playerId = held
      return true
    },

    /**
     * Keep what the next change is about to overwrite, so one mis-tap can be
     * put back. Only the substitution's own doing is kept — not the clock, not
     * a goal scored since — so taking it back cannot rewind anything else.
     */
    rememberSubstitution(slotIds, incomingIds) {
      const affected = new Set(incomingIds.filter((id) => id !== null && id !== undefined))
      const slots = slotIds.map((slotId) => {
        const slot = this.slots.find((candidate) => candidate.id === slotId)
        if (slot?.playerId !== null && slot?.playerId !== undefined) affected.add(slot.playerId)
        return { id: slotId, playerId: slot?.playerId ?? null }
      })
      this.lastSub = {
        at: Date.now(),
        subsUsed: this.subsUsed,
        outForGood: [...this.outForGood],
        slots,
        stints: [...affected].map((id) => ({
          id,
          stintSeconds: this.playersById.get(id)?.stintSeconds ?? 0,
        })),
      }
    },

    /** Let the keeper be changed after all. It stays allowed for this match. */
    unlockGoalkeeper() {
      this.goalkeeperUnlocked = true
    },

    /** Put the last substitution back as it was, spell and allowance included. */
    undoSubstitution() {
      if (!this.canUndoSub) return false
      const last = this.lastSub
      last.slots.forEach(({ id, playerId }) => {
        const slot = this.slots.find((candidate) => candidate.id === id)
        if (slot) slot.playerId = playerId
      })
      last.stints.forEach(({ id, stintSeconds }) => {
        const player = this.playersById.get(id)
        if (player) player.stintSeconds = stintSeconds
      })
      this.outForGood = new Set(last.outForGood)
      this.subsUsed = last.subsUsed
      this.lastSub = null
      this.clearSelection()
      return true
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
    /**
     * Record a card. A red, or a second yellow, sends the player off — the
     * rule lives here so every way of showing a card obeys it.
     */
    addCard(playerId, type) {
      if (!playerId) return
      this.cards.push({ id: nextId(), playerId, type, atSecond: this.elapsedSeconds })
      if (isSentOffByCards(cardCount(this.cards, playerId))) this.sendOff(playerId)
    },

    /**
     * A red card ends that player's match. They leave the field at once, the
     * position is left vacant — nobody is sent on in their place — and they
     * cannot be picked again.
     */
    sendOff(playerId) {
      this.sentOff.add(playerId)
      this.selectedOnPlayerIds.delete(playerId)

      const slot = this.slots.find((candidate) => candidate.playerId === playerId)
      if (!slot) return
      this.lastSub = null
      slot.playerId = null
      const player = this.playersById.get(playerId)
      if (player) player.stintSeconds = 0
    },

    /**
     * Removing a card that was logged by mistake reinstates the player if what
     * is left no longer adds up to a sending-off. It does not put them back on
     * the field: that is a substitution, and the coach's decision.
     */
    removeCard(cardId) {
      const card = this.cards.find((candidate) => candidate.id === cardId)
      this.cards = this.cards.filter((candidate) => candidate.id !== cardId)
      if (!card) return
      if (!isSentOffByCards(cardCount(this.cards, card.playerId))) {
        this.sentOff.delete(card.playerId)
      }
    },

    // --- Ending -----------------------------------------------------------
    finish() {
      this.pause()
    },

    playerName(playerId) {
      return this.playersById.get(playerId)?.name ?? ''
    },

    reset() {
      this.pause()
      this.$patch(emptyMatch())
    },

    // --- Surviving a reload ---------------------------------------------
    /**
     * The match as plain data, for keeping it across a reload. A selection the
     * coach is halfway through is left out: after a reload that tap is simply
     * made again, but nothing that actually happened in the match is lost.
     */
    snapshot() {
      return {
        slots: this.slots,
        players: this.players,
        elapsedSeconds: this.elapsedSeconds,
        running: this.running,
        period: this.period,
        outForGood: [...this.outForGood],
        sentOff: [...this.sentOff],
        subsUsed: this.subsUsed,
        captainId: this.captainId,
        goalkeeperUnlocked: this.goalkeeperUnlocked,
        goals: this.goals,
        cards: this.cards,
      }
    },

    /**
     * Pick the match up from a snapshot. A clock that was running went on
     * running on the pitch while the page was gone, so it catches up by the
     * time away — just as it does when the phone comes out of a pocket.
     */
    restore(saved, secondsAway = 0) {
      this.reset()
      this.$patch({
        slots: saved.slots,
        players: saved.players,
        elapsedSeconds: saved.elapsedSeconds,
        period: saved.period,
        outForGood: new Set(saved.outForGood),
        sentOff: new Set(saved.sentOff),
        subsUsed: saved.subsUsed,
        captainId: saved.captainId,
        goalkeeperUnlocked: Boolean(saved.goalkeeperUnlocked),
        goals: saved.goals,
        cards: saved.cards,
      })
      if (!saved.running) return
      if (secondsAway > 0) this.tick(secondsAway)
      this.start()
    },
  },
})

function toggleIn(set, value) {
  if (set.has(value)) set.delete(value)
  else set.add(value)
}
