import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import {
  installUrlNavigation,
  landingPhase,
  phaseForSlug,
  slugFor,
} from '@/services/urlNavigation.js'
import { PHASES, useAppStore } from '@/stores/app.js'

/** A window with a history that behaves like the browser's. */
function fakeWindow(hash = '') {
  const listeners = []
  const entries = []
  const win = {
    location: { pathname: '/', search: '', hash },
    history: {
      pushState(state, _title, url) {
        entries.push({ state, url })
        win.location.hash = url.slice(url.indexOf('#'))
      },
      replaceState(state, _title, url) {
        if (entries.length) entries[entries.length - 1] = { state, url }
        else entries.push({ state, url })
        win.location.hash = url.slice(url.indexOf('#'))
      },
    },
    addEventListener: (type, fn) => type === 'popstate' && listeners.push(fn),
    removeEventListener: (type, fn) => {
      const at = listeners.indexOf(fn)
      if (at >= 0) listeners.splice(at, 1)
    },
    /** An address typed, or a link tapped, while the app is open. */
    visit(hash) {
      win.location.hash = hash
      entries.push({ state: null, url: `/${hash}` })
      listeners.forEach((fn) => fn({ state: null }))
    },
    /** The back gesture: the browser drops an entry, then tells the page. */
    back() {
      entries.pop()
      const top = entries[entries.length - 1]
      if (top) win.location.hash = top.url.slice(top.url.indexOf('#'))
      listeners.forEach((fn) => fn({ state: top?.state ?? null }))
    },
    get entries() {
      return entries
    },
  }
  return win
}

describe('the address bar', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('names every screen, and reads the names back', () => {
    expect(slugFor(PHASES.HELP)).toBe('help')
    expect(phaseForSlug('#/help')).toBe(PHASES.HELP)
    expect(phaseForSlug('matches')).toBe(PHASES.HISTORY)
    expect(phaseForSlug('#/nonsense')).toBe(null)
  })

  it('opens a page arrived at by link', () => {
    expect(landingPhase('#/help')).toBe(PHASES.HELP)
    expect(landingPhase('#/matches')).toBe(PHASES.HISTORY)
    // A match cannot be conjured up by a link, so these open where the app does.
    expect(landingPhase('#/match')).toBe(null)
    expect(landingPhase('#/lineup')).toBe(null)
    expect(landingPhase('#/nonsense')).toBe(null)
  })

  it('follows the app from screen to screen', () => {
    const app = useAppStore()
    const win = fakeWindow()
    installUrlNavigation(app, win)
    expect(win.location.hash).toBe('#/')

    app.chooseLanguage('fi')
    expect(win.location.hash).toBe('#/menu')
    app.openPage(PHASES.HELP)
    expect(win.location.hash).toBe('#/help')
  })

  it('takes the back gesture as a step back inside the app', () => {
    const app = useAppStore()
    const win = fakeWindow()
    installUrlNavigation(app, win)
    app.chooseLanguage('fi')
    app.openPage(PHASES.INFO)
    app.openPage(PHASES.CHANGELOG)

    win.back()
    // Out of the whole detour in one go, as the page's own back button does.
    expect(app.phase).toBe(PHASES.MENU)
    expect(win.location.hash).toBe('#/menu')

    win.back()
    expect(app.phase).toBe(PHASES.SPLASH)
  })

  it('does not let a swipe take a coach out of a match', () => {
    const app = useAppStore()
    const win = fakeWindow()
    installUrlNavigation(app, win)
    app.phase = PHASES.LIVE

    const depth = win.entries.length
    win.back()

    expect(app.phase).toBe(PHASES.LIVE)
    expect(win.location.hash).toBe('#/match')
    expect(win.entries.length).toBe(depth)
  })

  it('refuses a link to a screen that needs steps before it', () => {
    const app = useAppStore()
    const win = fakeWindow('#/match')
    installUrlNavigation(app, win)

    // The match cannot be linked to, so the app opens where it always does...
    expect(app.phase).toBe(PHASES.SPLASH)
    // ...and the address stops claiming otherwise.
    expect(win.location.hash).toBe('#/')
  })

  it('refuses the same link typed while the app is open', () => {
    const app = useAppStore()
    const win = fakeWindow()
    installUrlNavigation(app, win)
    app.chooseLanguage('fi')

    win.visit('#/lineup')
    expect(app.phase).toBe(PHASES.MENU)
    expect(win.location.hash).toBe('#/menu')
  })

  it('follows a link to a page that stands on its own', () => {
    const app = useAppStore()
    const win = fakeWindow()
    installUrlNavigation(app, win)
    app.chooseLanguage('fi')

    win.visit('#/matches')
    expect(app.phase).toBe(PHASES.HISTORY)
    expect(win.location.hash).toBe('#/matches')
  })

  it('will not let a link pull a coach out of a match', () => {
    const app = useAppStore()
    const win = fakeWindow()
    installUrlNavigation(app, win)
    app.phase = PHASES.LIVE

    win.visit('#/help')
    expect(app.phase).toBe(PHASES.LIVE)
    expect(win.location.hash).toBe('#/match')
  })

  it('will not let one interrupt a squad half typed in either', () => {
    const app = useAppStore()
    const win = fakeWindow()
    installUrlNavigation(app, win)
    app.phase = PHASES.SQUAD

    win.visit('#/about')
    expect(app.phase).toBe(PHASES.SQUAD)
    expect(win.location.hash).toBe('#/squad')
  })

  it('is left alone where the browser has no history to speak of', () => {
    const app = useAppStore()
    expect(() => installUrlNavigation(app, {})()).not.toThrow()
  })
})
