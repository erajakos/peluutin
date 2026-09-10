/**
 * A match clock that measures elapsed wall-clock time instead of counting
 * interval callbacks.
 *
 * Browsers throttle (or entirely suspend) timers in a backgrounded tab, and a
 * phone in a coach's pocket is exactly that. Counting callbacks would quietly
 * lose minutes; measuring the delta means the clock catches up when the screen
 * comes back on. Sub-second remainders are carried over so no time is lost at
 * tick boundaries.
 */
export function createSecondTicker(onSeconds, { intervalMs = 250, now = Date.now } = {}) {
  let handle = null
  let last = 0
  let carryMs = 0

  function drain() {
    const current = now()
    carryMs += current - last
    last = current
    const whole = Math.floor(carryMs / 1000)
    if (whole > 0) {
      carryMs -= whole * 1000
      onSeconds(whole)
    }
  }

  return {
    start() {
      if (handle !== null) return
      last = now()
      carryMs = 0
      handle = setInterval(drain, intervalMs)
    },
    stop() {
      if (handle === null) return
      clearInterval(handle)
      handle = null
      carryMs = 0
    },
    get isRunning() {
      return handle !== null
    },
  }
}
