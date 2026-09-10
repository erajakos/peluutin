import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createSecondTicker } from '@/services/ticker.js'

describe('createSecondTicker', () => {
  let clock

  beforeEach(() => {
    clock = 0
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  function ticker(onSeconds) {
    return createSecondTicker(onSeconds, { intervalMs: 250, now: () => clock })
  }

  /** Move both the fake timers and the fake wall clock forward together. */
  function advance(ms) {
    const step = 250
    for (let elapsed = 0; elapsed < ms; elapsed += step) {
      clock += step
      vi.advanceTimersByTime(step)
    }
  }

  it('reports whole seconds as they pass', () => {
    const onSeconds = vi.fn()
    const t = ticker(onSeconds)
    t.start()
    advance(3000)
    expect(onSeconds.mock.calls.flat().reduce((a, b) => a + b, 0)).toBe(3)
    t.stop()
  })

  it('reports nothing until a full second has elapsed', () => {
    const onSeconds = vi.fn()
    const t = ticker(onSeconds)
    t.start()
    advance(750)
    expect(onSeconds).not.toHaveBeenCalled()
    t.stop()
  })

  it('catches up after the browser throttles the timer', () => {
    // A backgrounded tab fires one callback long after it was due; counting
    // callbacks would lose the minute, measuring elapsed time does not.
    const onSeconds = vi.fn()
    const t = ticker(onSeconds)
    t.start()
    clock += 60_000
    vi.advanceTimersByTime(250)
    expect(onSeconds).toHaveBeenCalledWith(60)
    t.stop()
  })

  it('stops counting once stopped', () => {
    const onSeconds = vi.fn()
    const t = ticker(onSeconds)
    t.start()
    t.stop()
    advance(5000)
    expect(onSeconds).not.toHaveBeenCalled()
    expect(t.isRunning).toBe(false)
  })

  it('ignores a second start, so the clock cannot run twice as fast', () => {
    const onSeconds = vi.fn()
    const t = ticker(onSeconds)
    t.start()
    t.start()
    advance(2000)
    expect(onSeconds.mock.calls.flat().reduce((a, b) => a + b, 0)).toBe(2)
    t.stop()
  })
})
