import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { CARD_RED, CARD_YELLOW } from '@/domain/scoring.js'
import { useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const ROSTER = [
  { id: 1, name: 'Keeper' },
  { id: 2, name: 'Aino' },
  { id: 3, name: 'Bo' },
  { id: 4, name: 'Cai' },
  { id: 5, name: 'Dev' },
  { id: 6, name: 'Eve' },
]

/** A five-a-side match with a fixed keeper, kicked off with the first five. */
function startMatch(overrides = {}) {
  const setup = useSetupStore()
  const match = useMatchStore()
  setup.$patch({ fieldSize: 5, hasGoalkeeper: true, fixedGoalkeeper: true, ...overrides })
  setup.roster = ROSTER.map((player) => ({ ...player }))
  match.startLineup(setup.createStartingSlots())
  match.slots.forEach((slot, index) => {
    slot.playerId = ROSTER[index].id
  })
  match.kickOff(setup.roster)
  return { setup, match }
}

describe('match store', () => {
  beforeEach(() => setActivePinia(createPinia()))

  describe('the clock', () => {
    it('credits minutes only to the players on the field', () => {
      const { match } = startMatch()
      match.tick(60)
      expect(match.playersById.get(1).seconds).toBe(60)
      expect(match.playersById.get(6).seconds).toBe(0)
    })

    it('counts how long every player has been in their current situation', () => {
      const { match } = startMatch()
      match.tick(60)
      expect(match.playersById.get(6).stintSeconds).toBe(60)
      expect(match.playersById.get(2).stintSeconds).toBe(60)
    })

    it('restarts both stints when a player is substituted', () => {
      const { match } = startMatch()
      match.tick(300)
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.swapPlayer(slot.id, 6)

      expect(match.playersById.get(2).stintSeconds).toBe(0)
      expect(match.playersById.get(6).stintSeconds).toBe(0)
      // Minutes already played are not touched by the swap.
      expect(match.playersById.get(2).seconds).toBe(300)

      match.tick(60)
      expect(match.playersById.get(2).stintSeconds).toBe(60)
      expect(match.playersById.get(2).seconds).toBe(300)
      expect(match.playersById.get(6).seconds).toBe(60)
    })
  })

  describe('choosing who comes on', () => {
    it('picks the bench automatically when there is only one possible answer', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.toggleOffSlot(slot.id)

      expect([...match.selectedOnPlayerIds]).toEqual([6])
      expect(match.autoSelectedOn).toBe(true)
      expect(match.canConfirmSub).toBe(true)
    })

    it('withdraws its own pick when the coach changes how many go off', () => {
      const { match } = startMatch()
      const [first, second] = match.slots.filter((slot) => !slot.isGoalkeeper)
      match.toggleOffSlot(first.id)
      match.toggleOffSlot(second.id)

      expect(match.selectedOnPlayerIds.size).toBe(0)
      expect(match.autoSelectedOn).toBe(false)
    })

    it('never overrides a choice the coach made themselves', () => {
      const { match, setup } = startMatch()
      setup.roster.push({ id: 7, name: 'Fay' })
      match.kickOff(setup.roster)
      match.slots.forEach((slot, index) => {
        slot.playerId = ROSTER[index].id
      })

      match.toggleOnPlayer(7)
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.toggleOffSlot(slot.id)
      expect([...match.selectedOnPlayerIds]).toEqual([7])
    })

    it('leaves the bench alone when the numbers do not line up', () => {
      const { match, setup } = startMatch()
      setup.roster.push({ id: 7, name: 'Fay' })
      match.kickOff(setup.roster)
      match.slots.forEach((slot, index) => {
        slot.playerId = ROSTER[index].id
      })

      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.toggleOffSlot(slot.id)
      expect(match.selectedOnPlayerIds.size).toBe(0)
    })
  })

  describe('applying a substitution', () => {
    it('swaps straight away for a one-for-one change', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.toggleOffSlot(slot.id)
      match.confirmSubstitution()

      expect(slot.playerId).toBe(6)
      expect(match.pendingAssignment).toBe(null)
      expect(match.subsUsed).toBe(1)
    })

    it('asks who takes which position for a multi-player change', () => {
      const { match, setup } = startMatch()
      setup.roster.push({ id: 7, name: 'Fay' })
      match.kickOff(setup.roster)
      match.slots.forEach((slot, index) => {
        slot.playerId = ROSTER[index].id
      })

      const [first, second] = match.slots.filter((slot) => !slot.isGoalkeeper)
      match.toggleOffSlot(first.id)
      match.toggleOffSlot(second.id)
      // Two off, two on the bench: the incoming pair is filled in for the coach.
      expect([...match.selectedOnPlayerIds]).toEqual([6, 7])

      match.confirmSubstitution()
      expect(match.pendingAssignment.map).toEqual({ [first.id]: 6, [second.id]: 7 })

      // Reordering is one tap: choosing 7 here trades the two positions.
      match.setAssignment(first.id, 7)
      expect(match.pendingAssignment.map).toEqual({ [first.id]: 7, [second.id]: 6 })

      match.applyAssignment()
      expect(first.playerId).toBe(7)
      expect(second.playerId).toBe(6)
      expect(match.selectedOffSlotIds.size).toBe(0)
    })

    it('keeps a substituted player off when re-entry is not allowed', () => {
      const { match } = startMatch({ allowReentry: false })
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.toggleOffSlot(slot.id)
      match.confirmSubstitution()

      expect(match.canPlayerReturn(2)).toBe(false)
      expect(match.availableBench.map((player) => player.id)).not.toContain(2)
    })

    it('refuses to go past the substitution limit', () => {
      const { match } = startMatch({ fieldSize: 5, subLimitEnabled: true, subLimit: 1 })
      // A cap only applies to larger formats, so five-a-side ignores it entirely.
      expect(match.rules.subLimitEnabled).toBe(false)
      expect(match.limitReached).toBe(false)
    })

    it('blocks further changes once a real limit is used up', () => {
      const { match } = startMatch({ fieldSize: 7, subLimitEnabled: true, subLimit: 1 })
      expect(match.rules.subLimitEnabled).toBe(true)

      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.toggleOffSlot(slot.id)
      match.confirmSubstitution()

      expect(match.subsUsed).toBe(1)
      expect(match.limitReached).toBe(true)
      expect(match.canConfirmSub).toBe(false)
    })
  })

  describe('trading positions on the field', () => {
    it('exchanges two players without spending a substitution', () => {
      const { match } = startMatch()
      match.tick(300)
      const [first, second] = match.slots.filter((slot) => !slot.isGoalkeeper)
      const before = { first: first.playerId, second: second.playerId }

      match.toggleOffSlot(first.id)
      match.toggleOffSlot(second.id)
      expect(match.canSwapPositions).toBe(true)
      match.swapPositions()

      expect(first.playerId).toBe(before.second)
      expect(second.playerId).toBe(before.first)
      expect(match.subsUsed).toBe(0)
      expect(match.selectedOffSlotIds.size).toBe(0)
    })

    it('leaves both players on the field, so their time keeps running', () => {
      const { match } = startMatch()
      match.tick(300)
      const [first, second] = match.slots.filter((slot) => !slot.isGoalkeeper)
      const moved = first.playerId

      match.toggleOffSlot(first.id)
      match.toggleOffSlot(second.id)
      match.swapPositions()

      // Neither left the pitch: minutes and current stint both carry on.
      expect(match.playersById.get(moved).seconds).toBe(300)
      expect(match.playersById.get(moved).stintSeconds).toBe(300)
      match.tick(60)
      expect(match.playersById.get(moved).seconds).toBe(360)
    })

    it('nobody is marked as having left, even with re-entry disallowed', () => {
      const { match } = startMatch({ allowReentry: false })
      const [first, second] = match.slots.filter((slot) => !slot.isGoalkeeper)
      const moved = first.playerId
      match.toggleOffSlot(first.id)
      match.toggleOffSlot(second.id)
      match.swapPositions()
      expect(match.canPlayerReturn(moved)).toBe(true)
    })

    it('needs exactly two, not one or three', () => {
      const { match } = startMatch()
      const slots = match.slots.filter((slot) => !slot.isGoalkeeper)
      match.toggleOffSlot(slots[0].id)
      expect(match.canSwapPositions).toBe(false)
      match.toggleOffSlot(slots[1].id)
      expect(match.canSwapPositions).toBe(true)
      match.toggleOffSlot(slots[2].id)
      expect(match.canSwapPositions).toBe(false)
    })

    it('does nothing when the selection is not a pair', () => {
      const { match } = startMatch()
      const [first] = match.slots.filter((slot) => !slot.isGoalkeeper)
      const before = first.playerId
      match.toggleOffSlot(first.id)
      match.swapPositions()
      expect(first.playerId).toBe(before)
    })

    it('is still possible once substitutions have run out', () => {
      const { match } = startMatch({ fieldSize: 7, subLimitEnabled: true, subLimit: 1 })
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.toggleOffSlot(slot.id)
      match.confirmSubstitution()
      expect(match.limitReached).toBe(true)

      const [first, second] = match.slots.filter((candidate) => !candidate.isGoalkeeper)
      const before = { first: first.playerId, second: second.playerId }
      match.toggleOffSlot(first.id)
      match.toggleOffSlot(second.id)
      match.swapPositions()

      expect(first.playerId).toBe(before.second)
      expect(second.playerId).toBe(before.first)
    })
  })

  describe('a red card', () => {
    it('takes the player off the field at once', () => {
      const { match } = startMatch()
      match.tick(300)
      const slot = match.slots.find((candidate) => candidate.playerId === 3)

      match.addCard(3, CARD_RED)

      expect(slot.playerId).toBe(null)
      expect(match.sentOff.has(3)).toBe(true)
    })

    it('leaves the position vacant rather than sending someone on', () => {
      const { match } = startMatch()
      const before = match.filledSlots.length
      match.addCard(3, CARD_RED)

      expect(match.filledSlots).toHaveLength(before - 1)
      expect(match.slots).toHaveLength(5)
      expect(match.subsUsed).toBe(0)
    })

    it('stops the player accruing any more minutes', () => {
      const { match } = startMatch()
      match.tick(300)
      match.addCard(3, CARD_RED)
      match.tick(120)

      expect(match.playersById.get(3).seconds).toBe(300)
      // Still on the field, so their team-mates keep counting.
      expect(match.playersById.get(2).seconds).toBe(420)
    })

    it('bars the player from coming back on, whatever the rules allow', () => {
      const { match } = startMatch({ allowReentry: true })
      match.addCard(3, CARD_RED)

      expect(match.canPlayerReturn(3)).toBe(false)
      expect(match.availableBench.map((player) => player.id)).not.toContain(3)
      expect(match.hints.dueOnPlayerIds.has(3)).toBe(false)
    })

    it('drops the player from a pending selection', () => {
      const { match } = startMatch()
      match.toggleOnPlayer(6)
      expect(match.selectedOnPlayerIds.has(6)).toBe(true)

      match.addCard(6, CARD_RED)
      expect(match.selectedOnPlayerIds.has(6)).toBe(false)
    })

    it('also ends the match of a player already on the bench', () => {
      const { match } = startMatch()
      match.addCard(6, CARD_RED)

      expect(match.sentOff.has(6)).toBe(true)
      expect(match.canPlayerReturn(6)).toBe(false)
    })

    it('a yellow card changes nothing', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 3)
      match.addCard(3, CARD_YELLOW)

      expect(slot.playerId).toBe(3)
      expect(match.sentOff.has(3)).toBe(false)
    })

    it('reinstates the player when the card is removed as a mistake', () => {
      const { match } = startMatch()
      match.addCard(3, CARD_RED)
      match.removeCard(match.cards[0].id)

      expect(match.sentOff.has(3)).toBe(false)
      expect(match.canPlayerReturn(3)).toBe(true)
      // Reinstated, but not put back on: that is the coach's decision.
      expect(match.filledSlots.map((slot) => slot.playerId)).not.toContain(3)
    })

    it('keeps a player off while any red card of theirs stands', () => {
      const { match } = startMatch()
      match.addCard(3, CARD_RED)
      match.addCard(3, CARD_RED)
      match.removeCard(match.cards[0].id)

      expect(match.sentOff.has(3)).toBe(true)
    })

    it('lets a substitute be sent on to fill the vacancy', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 3)
      match.addCard(3, CARD_RED)

      match.toggleOffSlot(slot.id)
      expect([...match.selectedOnPlayerIds]).toEqual([6])
      match.confirmSubstitution()

      expect(slot.playerId).toBe(6)
      expect(match.canPlayerReturn(3)).toBe(false)
    })

    it('lets another player move into the empty shirt', () => {
      const { match } = startMatch()
      const vacated = match.slots.find((candidate) => candidate.playerId === 3)
      const mover = match.slots.find(
        (candidate) => !candidate.isGoalkeeper && candidate.playerId === 2,
      )
      match.addCard(3, CARD_RED)

      expect(match.swapSlotPlayers(mover.id, vacated.id)).toBe(true)
      expect(vacated.playerId).toBe(2)
      expect(mover.playerId).toBe(null)
    })
  })

  describe('the scoreline', () => {
    it('records goals for both sides and can reattribute a scorer later', () => {
      const { match } = startMatch()
      match.beginOurGoal()
      match.confirmOurGoal(null)
      match.addOpponentGoal()

      expect(match.usScore).toBe(1)
      expect(match.opponentScore).toBe(1)
      expect(match.pendingGoal).toBe(false)

      const ourGoal = match.goals[0]
      expect(ourGoal.playerId).toBe(null)
      match.setGoalScorer(ourGoal.id, 3)
      expect(match.goals[0].playerId).toBe(3)

      match.removeGoal(ourGoal.id)
      expect(match.usScore).toBe(0)
    })
  })
})
