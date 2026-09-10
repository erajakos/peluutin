import { describe, expect, it } from 'vitest'
import {
  assignPlayer,
  canConfirmSubstitution,
  createAssignment,
  isAssignmentComplete,
  isLimitReached,
  needsAssignment,
  remainingSubs,
  slotAssignedTo,
} from '@/domain/substitutions.js'

describe('substitution limits', () => {
  it('is unlimited unless a cap is switched on', () => {
    expect(remainingSubs({ subLimitEnabled: false, subLimit: 3, subsUsed: 99 })).toBe(Infinity)
    expect(isLimitReached({ subLimitEnabled: false, subLimit: 3, subsUsed: 99 })).toBe(false)
  })

  it('counts down and then blocks further changes', () => {
    expect(remainingSubs({ subLimitEnabled: true, subLimit: 5, subsUsed: 2 })).toBe(3)
    expect(isLimitReached({ subLimitEnabled: true, subLimit: 5, subsUsed: 5 })).toBe(true)
  })

  it('never reports a negative allowance', () => {
    expect(remainingSubs({ subLimitEnabled: true, subLimit: 2, subsUsed: 4 })).toBe(0)
  })
})

describe('canConfirmSubstitution', () => {
  it('requires equal numbers on and off', () => {
    expect(canConfirmSubstitution({ offCount: 2, onCount: 2, remaining: 5 })).toBe(true)
    expect(canConfirmSubstitution({ offCount: 2, onCount: 1, remaining: 5 })).toBe(false)
    expect(canConfirmSubstitution({ offCount: 0, onCount: 0, remaining: 5 })).toBe(false)
  })

  it('refuses a change that would exceed the remaining allowance', () => {
    expect(canConfirmSubstitution({ offCount: 3, onCount: 3, remaining: 2 })).toBe(false)
  })
})

describe('assignment', () => {
  it('only needs position-by-position input for multi-player changes', () => {
    expect(needsAssignment([1])).toBe(false)
    expect(needsAssignment([1, 2])).toBe(true)
  })

  it('pairs the two selections in the order they were made', () => {
    expect(createAssignment([10, 11], [1, 2]).map).toEqual({ 10: 1, 11: 2 })
  })

  it('swaps two players when one is picked for the other position', () => {
    const initial = createAssignment([10, 11], [1, 2])
    const swapped = assignPlayer(initial, 10, 2)
    expect(swapped.map).toEqual({ 10: 2, 11: 1 })
  })

  it('leaves the displaced position empty when nothing was there to trade', () => {
    const partial = { offSlotIds: [10, 11], onPlayerIds: [1, 2], map: { 11: 2 } }
    expect(assignPlayer(partial, 10, 2).map).toEqual({ 10: 2 })
  })

  it('clears a position when the choice is removed', () => {
    const initial = createAssignment([10, 11], [1, 2])
    expect(assignPlayer(initial, 10, null).map).toEqual({ 11: 2 })
  })

  it('does not mutate the assignment it was given', () => {
    const initial = createAssignment([10, 11], [1, 2])
    assignPlayer(initial, 10, 2)
    expect(initial.map).toEqual({ 10: 1, 11: 2 })
  })

  it('reports which position an incoming player is pencilled in for', () => {
    const assignment = createAssignment([10, 11], [1, 2])
    expect(slotAssignedTo(assignment, 2)).toBe(11)
    expect(slotAssignedTo(assignment, 99)).toBe(null)
  })

  it('is complete only when every vacated position has someone', () => {
    expect(isAssignmentComplete({ offSlotIds: [10, 11], map: { 10: 1 } })).toBe(false)
    expect(isAssignmentComplete({ offSlotIds: [10, 11], map: { 10: 1, 11: 2 } })).toBe(true)
  })
})
