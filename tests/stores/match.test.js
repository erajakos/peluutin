import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { CARD_RED, CARD_YELLOW } from '@/domain/scoring.js'
import { PERIOD, useMatchStore } from '@/stores/match.js'
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
  setup.$patch({ fieldSize: 5, ...overrides })
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

  describe('nudging the clock', () => {
    it('adds the minute to everyone on the field, as if it had been running', () => {
      const { match } = startMatch()
      match.tick(30)
      match.adjustClock(60)
      expect(match.elapsedSeconds).toBe(90)
      const onField = match.players.find((player) => player.id === ROSTER[1].id)
      expect(onField.seconds).toBe(90)
      const bench = match.players.find((player) => player.id === ROSTER[5].id)
      expect(bench.seconds).toBe(0)
      expect(bench.stintSeconds).toBe(90)
    })

    it('takes a minute back off the clock and off the players who were on', () => {
      const { match } = startMatch()
      match.tick(120)
      match.adjustClock(-60)
      expect(match.elapsedSeconds).toBe(60)
      expect(match.players.find((player) => player.id === ROSTER[1].id).seconds).toBe(60)
    })

    it('never winds back past kickoff', () => {
      const { match } = startMatch()
      match.tick(20)
      match.adjustClock(-60)
      expect(match.elapsedSeconds).toBe(0)
      expect(match.players.every((player) => player.seconds === 0)).toBe(true)
      expect(match.players.every((player) => player.stintSeconds === 0)).toBe(true)
    })
  })

  describe('taking back a substitution', () => {
    function subbed() {
      const { setup, match } = startMatch()
      match.tick(300)
      // Dragging a player off pencils in whoever the rotation says is due on.
      match.planOff(match.slots[1].id)
      match.confirmSubstitution()
      return { setup, match }
    }

    it('is not on offer until something has been changed', () => {
      const { match } = startMatch()
      expect(match.canUndoSub).toBe(false)
      expect(match.undoSubstitution()).toBe(false)
    })

    it('puts both players back where they were, spell included', () => {
      const { match } = subbed()
      const off = ROSTER[1].id
      const on = ROSTER[5].id
      expect(match.slots[1].playerId).toBe(on)
      expect(match.playersById.get(off).stintSeconds).toBe(0)

      expect(match.undoSubstitution()).toBe(true)
      expect(match.slots[1].playerId).toBe(off)
      expect(match.playersById.get(off).stintSeconds).toBe(300)
      expect(match.playersById.get(on).stintSeconds).toBe(300)
      expect(match.subsUsed).toBe(0)
      expect(match.canUndoSub).toBe(false)
    })

    it('gives back the allowance and the right to return', () => {
      const { setup, match } = startMatch({ allowReentry: false, subLimitEnabled: true })
      match.planOff(match.slots[1].id)
      match.confirmSubstitution()
      expect(match.outForGood.has(ROSTER[1].id)).toBe(true)
      expect(match.subsUsed).toBe(1)

      match.undoSubstitution()
      expect(match.outForGood.has(ROSTER[1].id)).toBe(false)
      expect(match.subsUsed).toBe(0)
      expect(setup.allowReentry).toBe(false)
    })

    it('lapses once one of the players has been sent off', () => {
      const { match } = subbed()
      match.addCard(ROSTER[5].id, CARD_RED)
      expect(match.canUndoSub).toBe(false)
      expect(match.undoSubstitution()).toBe(false)
    })

    it('lapses once the players on the field have been rearranged', () => {
      const { match } = subbed()
      match.swapSlotPlayers(match.slots[1].id, match.slots[2].id)
      expect(match.canUndoSub).toBe(false)
    })
  })

  describe('a keeper meant to play the whole match', () => {
    it('is held out of reach until the coach says otherwise', () => {
      const { match } = startMatch()
      expect(match.goalkeeperLocked).toBe(true)
      match.unlockGoalkeeper()
      expect(match.goalkeeperLocked).toBe(false)
    })

    it('can be substituted once unlocked, and the new keeper takes their place', () => {
      const { match } = startMatch()
      const keeperSlot = match.slots.find((slot) => slot.isGoalkeeper)
      expect(match.goalkeeperId).toBe(ROSTER[0].id)

      match.unlockGoalkeeper()
      match.planOff(keeperSlot.id)
      match.confirmSubstitution()
      expect(keeperSlot.playerId).toBe(ROSTER[5].id)
      // Whoever stands in goal is the one kept out of the fairness maths.
      expect(match.goalkeeperId).toBe(ROSTER[5].id)
    })

    it('stays unlocked for the rest of the match, across a reload', () => {
      const { match } = startMatch()
      match.unlockGoalkeeper()
      const saved = JSON.parse(JSON.stringify(match.snapshot()))
      match.reset()
      expect(match.goalkeeperLocked).toBe(true)
      match.restore(saved)
      expect(match.goalkeeperLocked).toBe(false)
    })
  })

  describe('walking off with nobody to replace them', () => {
    it('leaves the position standing empty, and spends no allowance', () => {
      const { match } = startMatch({ fieldSize: 7, subLimitEnabled: true, subLimit: 3 })
      match.tick(300)
      const slot = match.slots.find((candidate) => candidate.playerId === 2)

      expect(match.takeOff(slot.id)).toBe(true)
      expect(slot.playerId).toBe(null)
      expect(match.subsUsed).toBe(0)
      expect(match.bench.map((player) => player.id)).toContain(2)
      expect(match.playersById.get(2).stintSeconds).toBe(0)
    })

    it('is not a substitution, so the player may come back on', () => {
      const { match } = startMatch({ allowReentry: false })
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.takeOff(slot.id)

      expect(match.outForGood.has(2)).toBe(false)
      expect(match.canPlayerReturn(2)).toBe(true)
    })

    it('lets them, or anyone, be brought into the empty position later', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.takeOff(slot.id)
      match.tick(60)

      match.stageChange(slot.id, 2)
      expect(match.confirmSubstitution()).toBe(true)
      expect(slot.playerId).toBe(2)
    })

    it('can be taken back like any other change', () => {
      const { match } = startMatch()
      match.tick(300)
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.takeOff(slot.id)

      expect(match.canUndoSub).toBe(true)
      match.undoSubstitution()
      expect(slot.playerId).toBe(2)
      expect(match.playersById.get(2).stintSeconds).toBe(300)
    })

    it('does nothing for a position already empty', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 3)
      match.addCard(3, CARD_RED)
      expect(match.takeOff(slot.id)).toBe(false)
    })
  })

  describe('half time', () => {
    it('starts every spell again, on the pitch and off it', () => {
      const { match, setup } = startMatch({ twoHalves: true, halfLength: 15 })
      match.start()
      match.tick(600)
      match.pause()
      match.endFirstHalf()
      expect(match.players.every((player) => player.stintSeconds === 600)).toBe(true)

      match.startSecondHalf()
      expect(match.players.every((player) => player.stintSeconds === 0)).toBe(true)
      // Minutes played are untouched: only the spell starts over.
      expect(match.playersById.get(ROSTER[1].id).seconds).toBe(600)
      match.pause()
      expect(setup.twoHalves).toBe(true)
    })
  })

  describe('taking back a goal', () => {
    it('removes the goal just logged, for either team', () => {
      const { match } = startMatch()
      match.beginOurGoal()
      match.confirmGoal(ROSTER[1].id)
      match.addOpponentGoal()
      expect(match.opponentScore).toBe(1)

      expect(match.undoGoal()).toBe(true)
      expect(match.opponentScore).toBe(0)
      expect(match.usScore).toBe(1)
      // Only the last one: the earlier goal stands.
      expect(match.undoGoal()).toBe(false)
      expect(match.usScore).toBe(1)
    })

    it('lapses once that goal has been removed another way', () => {
      const { match } = startMatch()
      match.addOpponentGoal()
      match.removeGoal(match.goals[0].id)
      expect(match.lastGoalId).toBe(null)
      expect(match.undoGoal()).toBe(false)
    })
  })

  describe('players with the same name', () => {
    it('are told apart by number in the squad', () => {
      const setup = useSetupStore()
      setup.addPlayer('Aino')
      setup.addPlayer('Bo')
      setup.addPlayer('Aino')
      expect(setup.roster.map((player) => player.name)).toEqual(['Aino 1', 'Bo', 'Aino 2'])
    })

    it('lose the number again once the name is unique', () => {
      const setup = useSetupStore()
      setup.addPlayer('Aino')
      setup.addPlayer('Aino')
      setup.removePlayer(setup.roster[0].id)
      expect(setup.roster.map((player) => player.name)).toEqual(['Aino'])
    })

    it('carry the numbered name onto the pitch', () => {
      const setup = useSetupStore()
      const match = useMatchStore()
      ;['Aino', 'Aino', 'Bo', 'Cai', 'Dev'].forEach((name) => setup.addPlayer(name))
      match.startLineup(setup.createStartingSlots())
      match.slots.forEach((slot, index) => match.assignSlot(slot.id, setup.roster[index].id))
      match.kickOff(setup.roster)
      expect(match.players.map((player) => player.name)).toContain('Aino 2')
    })
  })

  describe('the captain', () => {
    it('is optional, and none by default', () => {
      const { match } = startMatch()
      expect(match.captainId).toBe(null)
    })

    it('can be named from the starting lineup', () => {
      const { match } = startMatch()
      match.setCaptain(3)
      expect(match.captainId).toBe(3)
    })

    it('stops being captain when taken out of the starting lineup', () => {
      const setup = useSetupStore()
      const match = useMatchStore()
      setup.roster = ROSTER.map((player) => ({ ...player }))
      match.startLineup(setup.createStartingSlots())
      match.slots.forEach((slot, index) => match.assignSlot(slot.id, ROSTER[index].id))
      match.setCaptain(3)

      const slot = match.slots.find((candidate) => candidate.playerId === 3)
      match.assignSlot(slot.id, 6)
      expect(match.captainId).toBe(null)
    })

    it('is not carried into the next match', () => {
      const { match, setup } = startMatch()
      match.setCaptain(3)
      match.startLineup(setup.createStartingSlots())
      expect(match.captainId).toBe(null)
    })
  })

  describe('drawing the lineup', () => {
    function freshLineup() {
      const setup = useSetupStore()
      const match = useMatchStore()
      setup.$patch({ fieldSize: 5 })
      setup.roster = ROSTER.map((player) => ({ ...player }))
      match.startLineup(setup.createStartingSlots())
      return { setup, match }
    }

    it('fills an empty lineup completely', () => {
      const { setup, match } = freshLineup()
      match.drawLineup(setup.roster)
      expect(match.lineupComplete).toBe(true)
    })

    it('keeps every player the coach placed by hand', () => {
      const { setup, match } = freshLineup()
      const [keeper, striker] = [match.slots[0], match.slots[4]]
      match.assignSlot(keeper.id, 1)
      match.assignSlot(striker.id, 6)

      for (let i = 0; i < 20; i += 1) match.drawLineup(setup.roster)

      expect(keeper.playerId).toBe(1)
      expect(striker.playerId).toBe(6)
    })

    it('is offered once: a full lineup leaves nothing to draw', () => {
      const { setup, match } = freshLineup()
      expect(match.canDrawLineup).toBe(true)
      match.drawLineup(setup.roster)
      expect(match.canDrawLineup).toBe(false)

      const drawn = match.slots.map((slot) => slot.playerId)
      match.drawLineup(setup.roster)
      expect(match.slots.map((slot) => slot.playerId)).toEqual(drawn)
    })

    it('comes back to fill a position the coach empties afterwards', () => {
      const { setup, match } = freshLineup()
      match.drawLineup(setup.roster)
      const kept = match.slots.map((slot) => slot.playerId)
      match.assignSlot(match.slots[2].id, null)

      expect(match.canDrawLineup).toBe(true)
      match.drawLineup(setup.roster)
      // Only the emptied position was filled; the rest are untouched.
      match.slots.forEach((slot, index) => {
        if (index !== 2) expect(slot.playerId).toBe(kept[index])
      })
      expect(match.lineupComplete).toBe(true)
    })

    it("has nothing to draw once every position is the coach's choice", () => {
      const { match } = freshLineup()
      match.slots.forEach((slot, index) => match.assignSlot(slot.id, ROSTER[index].id))
      expect(match.canDrawLineup).toBe(false)
    })
  })

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

  describe('kickoff and halves', () => {
    it('knows the match has not started until the clock has run', () => {
      const { match } = startMatch()
      expect(match.notStarted).toBe(true)
      match.start()
      expect(match.notStarted).toBe(false)
      match.pause()
      // Paused at 0:00 after a start still counts as not started…
      expect(match.notStarted).toBe(true)
      match.tick(1)
      // …but one second of play does not.
      expect(match.notStarted).toBe(false)
      match.pause()
    })

    it('cannot go to half time before kickoff', () => {
      const { match } = startMatch({ twoHalves: true })
      expect(match.canEndFirstHalf).toBe(false)
      match.endFirstHalf()
      expect(match.period).toBe(PERIOD.FIRST)
    })

    it('lets the coach call half time whenever the first half is under way', () => {
      const { match } = startMatch({ twoHalves: true, halfLength: 15 })
      match.start()
      match.tick(60)
      // A minute in, far short of the planned 15: the coach decides, not the clock.
      expect(match.canEndFirstHalf).toBe(true)
      expect(match.firstHalfPlanReached).toBe(false)

      match.endFirstHalf()
      expect(match.period).toBe(PERIOD.HALF_TIME)
      expect(match.running).toBe(false)
    })

    it('allows half time the instant the clock starts, before a second has ticked', () => {
      // Regression: the stop button shows as soon as the clock runs, so half
      // time must be available then too — not only after the first tick.
      const { match } = startMatch({ twoHalves: true })
      match.start()
      expect(match.elapsedSeconds).toBe(0)
      expect(match.canEndFirstHalf).toBe(true)
      match.endFirstHalf()
      expect(match.period).toBe(PERIOD.HALF_TIME)
    })

    it('nudges once the planned first half is up, without forcing anything', () => {
      const { match } = startMatch({ twoHalves: true, halfLength: 15 })
      match.tick(15 * 60)
      expect(match.firstHalfPlanReached).toBe(true)
      expect(match.period).toBe(PERIOD.FIRST)
    })

    it('holds the clock at half time until the second half is started', () => {
      const { match } = startMatch({ twoHalves: true })
      match.tick(60)
      match.endFirstHalf()

      // Play at half time does nothing: the only way on is the second half.
      match.toggleRun()
      expect(match.running).toBe(false)

      expect(match.canStartSecondHalf).toBe(true)
      match.startSecondHalf()
      expect(match.period).toBe(PERIOD.SECOND)
      expect(match.running).toBe(true)
      match.pause()
    })

    it('only starts the second half from half time', () => {
      const { match } = startMatch({ twoHalves: true })
      match.tick(60)
      expect(match.canStartSecondHalf).toBe(false)
      match.startSecondHalf()
      expect(match.period).toBe(PERIOD.FIRST)
    })

    it('carries the clock on through the second half', () => {
      const { match } = startMatch({ twoHalves: true })
      match.tick(600)
      match.endFirstHalf()
      match.startSecondHalf()
      match.tick(60)
      expect(match.elapsedSeconds).toBe(660)
      match.pause()
    })

    it('offers no half time in a match played straight through', () => {
      const { match } = startMatch({ twoHalves: false })
      match.tick(600)
      expect(match.canEndFirstHalf).toBe(false)
    })

    it('does not offer half time twice', () => {
      const { match } = startMatch({ twoHalves: true })
      match.tick(60)
      match.endFirstHalf()
      match.startSecondHalf()
      match.pause()
      expect(match.canEndFirstHalf).toBe(false)
      expect(match.canStartSecondHalf).toBe(false)
    })
  })

  describe('making a change', () => {
    /** Five on, two waiting: Fay (7) has played least, so Fay is due on. */
    function withTwoWaiting() {
      const { match, setup } = startMatch()
      setup.roster.push({ id: 7, name: 'Fay' })
      match.kickOff(setup.roster)
      match.slots.forEach((slot, index) => {
        slot.playerId = ROSTER[index].id
      })
      match.tick(300)
      match.playersById.get(6).seconds = 400
      match.playersById.get(7).seconds = 100
      return { match, setup }
    }

    it('happens the moment the second player is tapped, whichever is first', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 2)

      match.pickSlot(slot.id)
      expect(match.pickedSlotId).toBe(slot.id)
      match.pickBenchPlayer(6)

      expect(slot.playerId).toBe(6)
      expect(match.subsUsed).toBe(1)
      expect(match.hasSelection).toBe(false)
    })

    it('works the other way round as well', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 2)

      match.pickBenchPlayer(6)
      match.pickSlot(slot.id)
      expect(slot.playerId).toBe(6)
    })

    it('unpicks a chip tapped twice, and changes nothing', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 2)

      match.pickSlot(slot.id)
      match.pickSlot(slot.id)
      expect(match.pickedSlotId).toBe(null)
      expect(slot.playerId).toBe(2)
      expect(match.subsUsed).toBe(0)
    })

    it('sends on whoever is due on when a player is dragged off', () => {
      const { match } = withTwoWaiting()
      const slot = match.slots.find((candidate) => candidate.playerId === 2)

      expect(match.planOff(slot.id)).toBe(true)
      expect(slot.playerId).toBe(7)
    })

    it('sends on the substitute already picked, not the one due on', () => {
      const { match } = withTwoWaiting()
      match.pickBenchPlayer(6)
      const slot = match.slots.find((candidate) => candidate.playerId === 2)

      match.planOff(slot.id)
      expect(slot.playerId).toBe(6)
    })

    it('can be taken back straight away', () => {
      const { match } = withTwoWaiting()
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.substitute(slot.id, 6)

      expect(match.canUndoSub).toBe(true)
      match.undoSubstitution()
      expect(slot.playerId).toBe(2)
      expect(match.subsUsed).toBe(0)
    })

    it('does nothing with nobody to send on', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      expect(match.substitute(slot.id, null)).toBe(false)
      expect(slot.playerId).toBe(2)
      expect(match.plan).toEqual({})
    })

    it('never sends on a player who may not come back on', () => {
      const { match } = startMatch({ allowReentry: false })
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.planOff(slot.id)

      const other = match.slots.find((candidate) => candidate.playerId === 3)
      expect(match.substitute(other.id, 2)).toBe(false)
      expect(other.playerId).toBe(3)
    })

    it('keeps a substituted player off when re-entry is not allowed', () => {
      const { match } = startMatch({ allowReentry: false })
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.planOff(slot.id)

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
      match.planOff(slot.id)

      expect(match.subsUsed).toBe(1)
      expect(match.limitReached).toBe(true)

      const other = match.slots.find((candidate) => candidate.playerId === 3)
      expect(match.substitute(other.id, 2)).toBe(false)
      expect(other.playerId).toBe(3)
    })
  })

  describe('trading positions on the field', () => {
    /** The two outfield slots that trade places, and who stands in each. */
    function pairOnField(match) {
      const [first, second] = match.slots.filter((slot) => !slot.isGoalkeeper)
      return { first, second, before: { first: first.playerId, second: second.playerId } }
    }

    it('exchanges two players without spending a substitution', () => {
      const { match } = startMatch()
      match.tick(300)
      const { first, second, before } = pairOnField(match)

      expect(match.swapSlotPlayers(first.id, second.id)).toBe(true)

      expect(first.playerId).toBe(before.second)
      expect(second.playerId).toBe(before.first)
      expect(match.subsUsed).toBe(0)
    })

    it('leaves both players on the field, so their time keeps running', () => {
      const { match } = startMatch()
      match.tick(300)
      const { first, second, before } = pairOnField(match)
      match.swapSlotPlayers(first.id, second.id)

      // Neither left the pitch: minutes and current stint both carry on.
      expect(match.playersById.get(before.first).seconds).toBe(300)
      expect(match.playersById.get(before.first).stintSeconds).toBe(300)
      match.tick(60)
      expect(match.playersById.get(before.first).seconds).toBe(360)
    })

    it('nobody is marked as having left, even with re-entry disallowed', () => {
      const { match } = startMatch({ allowReentry: false })
      const { first, second, before } = pairOnField(match)
      match.swapSlotPlayers(first.id, second.id)
      expect(match.canPlayerReturn(before.first)).toBe(true)
    })

    it('does nothing when a slot is dropped on itself', () => {
      const { match } = startMatch()
      const { first, before } = pairOnField(match)
      expect(match.swapSlotPlayers(first.id, first.id)).toBe(false)
      expect(first.playerId).toBe(before.first)
    })

    it('is still possible once substitutions have run out', () => {
      const { match } = startMatch({ fieldSize: 7, subLimitEnabled: true, subLimit: 1 })
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.planOff(slot.id)
      match.confirmSubstitution()
      expect(match.limitReached).toBe(true)

      const { first, second, before } = pairOnField(match)
      match.swapSlotPlayers(first.id, second.id)

      expect(first.playerId).toBe(before.second)
      expect(second.playerId).toBe(before.first)
    })
  })

  describe('who a card is for', () => {
    it('is the one player the coach tapped on the pitch', () => {
      const { match, setup } = startMatch()
      setup.roster.push({ id: 7, name: 'Fay' })
      match.kickOff(setup.roster)
      match.slots.forEach((slot, index) => {
        slot.playerId = ROSTER[index].id
      })
      const slot = match.slots.find((candidate) => candidate.playerId === 3)
      match.pickSlot(slot.id)
      expect(match.cardCandidateId).toBe(3)
    })

    it('can be a player on the bench', () => {
      const { match } = startMatch()
      match.pickBenchPlayer(6)
      expect(match.cardCandidateId).toBe(6)
    })

    it('is nobody once the pick has become a change', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 3)
      match.pickSlot(slot.id)
      match.pickBenchPlayer(6)
      expect(match.cardCandidateId).toBe(null)
    })

    it('is nobody for an empty shirt', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 3)
      match.addCard(3, CARD_RED)
      match.pickSlot(slot.id)
      expect(match.cardCandidateId).toBe(null)
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

    it('drops the player from a change being planned', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 2)
      match.stageChange(slot.id, 6)
      expect(match.plan[slot.id]).toBe(6)

      match.addCard(6, CARD_RED)
      expect(match.plan).toEqual({})
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

    it('is what a second yellow card amounts to', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 3)
      match.addCard(3, CARD_YELLOW)
      expect(match.sentOff.has(3)).toBe(false)
      expect(slot.playerId).toBe(3)

      match.addCard(3, CARD_YELLOW)
      expect(match.sentOff.has(3)).toBe(true)
      expect(slot.playerId).toBe(null)
      expect(match.canPlayerReturn(3)).toBe(false)
    })

    it('is undone when one of two yellows is removed as a mistake', () => {
      const { match } = startMatch()
      match.addCard(3, CARD_YELLOW)
      match.addCard(3, CARD_YELLOW)
      match.removeCard(match.cards[1].id)
      expect(match.sentOff.has(3)).toBe(false)
      expect(match.cardCountsById.get(3)).toEqual({ yellow: 1, red: 0 })
    })

    it('stands while any sending-off card remains', () => {
      const { match } = startMatch()
      match.addCard(3, CARD_YELLOW)
      match.addCard(3, CARD_RED)
      // Removing the yellow still leaves the red.
      match.removeCard(match.cards[0].id)
      expect(match.sentOff.has(3)).toBe(true)
    })

    it('keeps count of cards per player for marking them', () => {
      const { match } = startMatch()
      match.addCard(3, CARD_YELLOW)
      match.addCard(4, CARD_RED)
      expect(match.cardCountsById.get(3)).toEqual({ yellow: 1, red: 0 })
      expect(match.cardCountsById.get(4)).toEqual({ yellow: 0, red: 1 })
      expect(match.cardCountsById.has(2)).toBe(false)
    })

    it('lets a substitute be sent on to fill the vacancy', () => {
      const { match } = startMatch()
      const slot = match.slots.find((candidate) => candidate.playerId === 3)
      match.addCard(3, CARD_RED)

      // The shirt is empty, so nobody comes off: the substitute simply fills it.
      match.stageChange(slot.id, 6)
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
      match.confirmGoal(null)
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
