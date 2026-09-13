import { defineStore } from 'pinia'
import { nextId } from '@/domain/ids.js'
import { benchPlayers, drawForEmptySlots, isLineupComplete } from '@/domain/lineup.js'
import { rotationHints, isEligibleToReturn } from '@/domain/rotation.js'
import {
  canConfirmPlan,
  isPlanEmpty,
  plannedSlotIds,
  slotPlannedFor,
  stageChange,
  unstageSlot,
} from '@/domain/plan.js'
import { isLimitReached, remainingSubs } from '@/domain/substitutions.js'
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
    /**
     * The change being put together: which position, and who is coming into
     * it. Nothing here has happened yet — it happens when the coach confirms.
     */
    plan: {},
    /** The one chip waiting for its partner, when a change is made by tapping. */
    pickedSlotId: null,
    pickedPlayerId: null,
    outForGood: new Set(),
    /** Players whose match is over: a red card cannot be served out. */
    sentOff: new Set(),
    subsUsed: 0,
    /** Optional, chosen from the starting lineup; shown in the results. */
    captainId: null,
    /** Enough of the last substitution to put it back, if it was a mis-tap. */
    lastSub: null,
    /**
     * The keeper stands outside the rotation: never prompted to come off, and
     * kept out of the way of a stray tap. Changing them is possible but never
     * encouraged — the pitch asks once, and only if the coach starts it.
     */
    goalkeeperUnlocked: false,
    goals: [],
    /** True while a goal of ours is waiting to be told who scored it. */
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
     * The one player the coach has picked out and not yet paired with anyone —
     * the player a card would be shown to. A change already planned is a
     * change, not a choice of player, so it offers no card.
     */
    cardCandidateId(state) {
      if (state.pickedPlayerId !== null) return state.pickedPlayerId
      if (state.pickedSlotId === null) return null
      return state.slots.find((slot) => slot.id === state.pickedSlotId)?.playerId ?? null
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

    /** Whether anything is being put together: a plan, or a chip picked out. */
    hasSelection: (state) =>
      !isPlanEmpty(state.plan) || state.pickedSlotId !== null || state.pickedPlayerId !== null,

    plannedSlotIds: (state) => plannedSlotIds(state.plan),

    /** Who is planned to come on, by the position they are coming into. */
    plannedIncomingId: (state) => (slotId) => state.plan[slotId] ?? null,

    /** The position a bench player is pencilled into, or null. */
    plannedSlotFor: (state) => (playerId) => slotPlannedFor(state.plan, playerId),

    plannedCount: (state) => plannedSlotIds(state.plan).length,

    canConfirmSub(state) {
      return canConfirmPlan(state.plan, this.remainingSubs)
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
    // --- Putting a change together ---------------------------------------
    /**
     * Tapping a position on the field. It pairs with a bench player already
     * picked, cancels the change it is already part of, or waits for a partner.
     */
    pickSlot(slotId) {
      if (this.plan[slotId] !== undefined) {
        this.plan = unstageSlot(this.plan, slotId)
        return
      }
      if (this.pickedPlayerId !== null) {
        this.stageChange(slotId, this.pickedPlayerId)
        return
      }
      this.pickedSlotId = this.pickedSlotId === slotId ? null : slotId
    },

    /** Tapping a player on the bench: the same idea from the other side. */
    pickBenchPlayer(playerId) {
      const planned = slotPlannedFor(this.plan, playerId)
      if (planned !== null) {
        this.plan = unstageSlot(this.plan, planned)
        return
      }
      if (!this.canPlayerReturn(playerId)) return
      if (this.pickedSlotId !== null) {
        this.stageChange(this.pickedSlotId, playerId)
        return
      }
      this.pickedPlayerId = this.pickedPlayerId === playerId ? null : playerId
    },

    /**
     * Pencil a player in for a position. Refused once the match's allowance is
     * spent, unless it only rearranges a change already planned.
     */
    stageChange(slotId, playerId) {
      if (playerId !== null && !this.canPlayerReturn(playerId)) return false
      const isNew = this.plan[slotId] === undefined
      if (isNew && this.plannedCount >= this.remainingSubs) return false

      this.plan = stageChange(this.plan, slotId, playerId)
      this.clearPicked()
      return true
    },

    /**
     * A player dragged off the field, with somebody pencilled in beside them.
     *
     * A substitute the coach has already picked out is the answer, if there is
     * one — their choice outranks any suggestion. Otherwise it is whoever the
     * rotation says is due on, and only from those not already spoken for: a
     * suggestion must never take a player out of a change the coach has
     * already made, which would send on someone they did not choose.
     */
    planOff(slotId) {
      const picked = this.pickedPlayerId
      if (picked !== null && this.canPlayerReturn(picked)) {
        return this.stageChange(slotId, picked)
      }

      const taken = new Set(Object.values(this.plan))
      const free = this.availableBench.filter((player) => !taken.has(player.id))
      const suggestion = free.find((player) => this.hints.dueOnPlayerIds.has(player.id)) ?? free[0]
      return this.stageChange(slotId, suggestion?.id ?? null)
    },

    /**
     * Off the field with nobody to take their place: an injury, a sulk, a team
     * playing a player short for a while. The position is left standing empty,
     * so anyone — including them — can be brought into it later.
     *
     * No allowance is spent, because nobody came on, and they are not marked
     * as substituted: they walked off, which is not the same thing.
     */
    takeOff(slotId) {
      const slot = this.slots.find((candidate) => candidate.id === slotId)
      if (!slot || slot.playerId === null) return false

      this.rememberSubstitution([slotId], [])
      const player = this.playersById.get(slot.playerId)
      slot.playerId = null
      if (player) player.stintSeconds = 0
      this.plan = unstageSlot(this.plan, slotId)
      this.clearPicked()
      return true
    },

    unstage(slotId) {
      this.plan = unstageSlot(this.plan, slotId)
    },

    clearPicked() {
      this.pickedSlotId = null
      this.pickedPlayerId = null
    },

    clearSelection() {
      this.plan = {}
      this.clearPicked()
    },

    canPlayerReturn(playerId) {
      return isEligibleToReturn(playerId, this.availability)
    },

    /** Make the whole planned change at once, and let it be taken back as one. */
    confirmSubstitution() {
      if (!this.canConfirmSub) return false
      const slotIds = this.plannedSlotIds
      const incoming = slotIds.map((slotId) => this.plan[slotId])

      this.rememberSubstitution(slotIds, incoming)
      slotIds.forEach((slotId, index) => this.swapPlayer(slotId, incoming[index]))
      this.clearSelection()
      return true
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

    confirmGoal(playerId) {
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
      const planned = slotPlannedFor(this.plan, playerId)
      if (planned !== null) this.plan = unstageSlot(this.plan, planned)
      if (this.pickedPlayerId === playerId) this.pickedPlayerId = null

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
