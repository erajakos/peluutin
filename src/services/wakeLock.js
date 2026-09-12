/**
 * Keeping the screen on while a match is being played.
 *
 * A phone left alone for thirty seconds locks itself, and a coach who has to
 * wake and unlock it every time they want the clock is a coach who stops using
 * the app. The browser's own wake lock is the polite way to ask for that: it is
 * only granted to a visible page, and the system drops it the moment the page
 * is hidden or the battery gets low.
 *
 * Not every browser has it, and even where it does the request can be refused,
 * so every path here ends in "carry on without it" rather than an error.
 */
export function createScreenWakeLock({
  navigator = globalThis.navigator,
  document = globalThis.document,
} = {}) {
  let sentinel = null
  let wanted = false

  const supported = Boolean(navigator?.wakeLock?.request)

  /**
   * A lock the system has already dropped is no lock at all. The release event
   * says so too, but the flag is the one thing that cannot be missed.
   */
  const held = () => sentinel !== null && sentinel.released !== true

  async function acquire() {
    if (!wanted || held() || document?.visibilityState !== 'visible') return
    try {
      const lock = await navigator.wakeLock.request('screen')
      // Asked to stop while the request was in flight: honour that, not this.
      if (!wanted) {
        lock.release?.()
        return
      }
      sentinel = lock
      // The system releases it on its own — when the screen is locked by hand,
      // say — and asks for nothing back but that we forget the stale handle.
      lock.addEventListener?.('release', () => {
        sentinel = null
      })
    } catch {
      sentinel = null
    }
  }

  function onVisibilityChange() {
    // Hiding the page drops the lock; coming back has to ask for it again.
    if (document?.visibilityState === 'visible') acquire()
  }

  document?.addEventListener?.('visibilitychange', onVisibilityChange)

  return {
    supported,

    /** Ask for the screen to stay on, and keep asking after every interruption. */
    keepAwake() {
      wanted = true
      return acquire()
    },

    /** Let the screen sleep again. */
    release() {
      wanted = false
      const lock = sentinel
      sentinel = null
      lock?.release?.()
    },

    /** Stop listening; the lock goes with it. */
    destroy() {
      this.release()
      document?.removeEventListener?.('visibilitychange', onVisibilityChange)
    },
  }
}
