import { describe, expect, it, vi } from 'vitest'
import { createScreenWakeLock } from '@/services/wakeLock.js'

/** A browser that grants wake locks, and remembers what it was asked for. */
function fakeBrowser({ grant = true, visible = true } = {}) {
  const locks = []
  const listeners = { visibilitychange: [] }
  const document = {
    visibilityState: visible ? 'visible' : 'hidden',
    addEventListener: (type, fn) => listeners[type]?.push(fn),
    removeEventListener: (type, fn) => {
      listeners[type] = listeners[type].filter((entry) => entry !== fn)
    },
  }
  const navigator = {
    wakeLock: {
      request: vi.fn(async () => {
        if (!grant) throw new Error('refused')
        const lock = {
          released: false,
          onRelease: [],
          release: vi.fn(async () => {
            lock.released = true
          }),
          addEventListener: (_type, fn) => lock.onRelease.push(fn),
        }
        locks.push(lock)
        return lock
      }),
    },
  }
  return {
    navigator,
    document,
    locks,
    /** The screen going away and coming back, as it does in a pocket. */
    async hideAndShow({ announceRelease = true } = {}) {
      document.visibilityState = 'hidden'
      // The system drops the lock when the page is hidden, as browsers do.
      const dropped = locks.at(-1)
      if (dropped) dropped.released = true
      if (announceRelease) dropped?.onRelease.forEach((fn) => fn())
      listeners.visibilitychange.forEach((fn) => fn())
      document.visibilityState = 'visible'
      listeners.visibilitychange.forEach((fn) => fn())
      await Promise.resolve()
    },
  }
}

describe('keeping the screen awake', () => {
  it('asks for the screen while the match is on, and lets go afterwards', async () => {
    const browser = fakeBrowser()
    const screen = createScreenWakeLock(browser)
    expect(screen.supported).toBe(true)

    await screen.keepAwake()
    expect(browser.navigator.wakeLock.request).toHaveBeenCalledWith('screen')

    screen.release()
    expect(browser.locks[0].release).toHaveBeenCalled()
  })

  it('asks again after the page has been away', async () => {
    const browser = fakeBrowser()
    const screen = createScreenWakeLock(browser)
    await screen.keepAwake()
    await browser.hideAndShow()
    expect(browser.locks).toHaveLength(2)
  })

  it('asks again even if the release went unannounced', async () => {
    const browser = fakeBrowser()
    const screen = createScreenWakeLock(browser)
    await screen.keepAwake()
    await browser.hideAndShow({ announceRelease: false })
    expect(browser.locks).toHaveLength(2)
  })

  it('stops asking once the match screen is gone', async () => {
    const browser = fakeBrowser()
    const screen = createScreenWakeLock(browser)
    await screen.keepAwake()
    screen.destroy()
    await browser.hideAndShow()
    expect(browser.locks).toHaveLength(1)
    expect(browser.locks[0].released).toBe(true)
  })

  it('carries on where the browser refuses, or has never heard of it', async () => {
    const refusing = fakeBrowser({ grant: false })
    await expect(createScreenWakeLock(refusing).keepAwake()).resolves.toBeUndefined()

    const old = createScreenWakeLock({ navigator: {}, document: undefined })
    expect(old.supported).toBe(false)
    await expect(old.keepAwake()).resolves.toBeUndefined()
    expect(() => old.destroy()).not.toThrow()
  })

  it('does not hold the screen when the page is not even visible', async () => {
    const browser = fakeBrowser({ visible: false })
    await createScreenWakeLock(browser).keepAwake()
    expect(browser.locks).toHaveLength(0)
  })
})
