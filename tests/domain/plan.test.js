import { describe, expect, it } from 'vitest'
import {
  canConfirmPlan,
  isPlanComplete,
  isPlanEmpty,
  plannedSlotIds,
  slotPlannedFor,
  stageChange,
  unstageSlot,
} from '@/domain/plan.js'

describe('a substitution being planned', () => {
  it('pencils a player into a position', () => {
    expect(stageChange({}, 11, 7)).toEqual({ 11: 7 })
  })

  it('records a position being emptied with nobody chosen yet', () => {
    const plan = stageChange({}, 11, null)
    expect(plan).toEqual({ 11: null })
    expect(isPlanComplete(plan)).toBe(false)
    expect(isPlanEmpty(plan)).toBe(false)
  })

  it('moves a player rather than cloning them across two positions', () => {
    const plan = stageChange(stageChange({}, 11, 7), 12, 7)
    expect(plan).toEqual({ 11: null, 12: 7 })
  })

  it('trades the two when both positions had someone', () => {
    let plan = stageChange({}, 11, 7)
    plan = stageChange(plan, 12, 8)
    expect(stageChange(plan, 12, 7)).toEqual({ 11: 8, 12: 7 })
  })

  it('takes a position back out of the plan', () => {
    expect(unstageSlot({ 11: 7, 12: 8 }, 11)).toEqual({ 12: 8 })
    expect(isPlanEmpty(unstageSlot({ 11: 7 }, 11))).toBe(true)
  })

  it('says where a player is pencilled in', () => {
    expect(slotPlannedFor({ 11: 7 }, 7)).toBe(11)
    expect(slotPlannedFor({ 11: 7 }, 8)).toBe(null)
    expect(plannedSlotIds({ 11: 7, 12: null })).toEqual([11, 12])
  })

  it('is confirmable only when finished and within the allowance', () => {
    expect(canConfirmPlan({}, 3)).toBe(false)
    expect(canConfirmPlan({ 11: null }, 3)).toBe(false)
    expect(canConfirmPlan({ 11: 7 }, 3)).toBe(true)
    expect(canConfirmPlan({ 11: 7, 12: 8 }, 1)).toBe(false)
    expect(canConfirmPlan({ 11: 7, 12: 8 }, Number.POSITIVE_INFINITY)).toBe(true)
  })
})
