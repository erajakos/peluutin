import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { PHASES, useAppStore } from '@/stores/app.js'
import { useSetupStore } from '@/stores/setup.js'

describe('the pages off the menu', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    useAppStore().phase = PHASES.MENU
  })

  it('returns where it came from', () => {
    const app = useAppStore()
    app.openPage(PHASES.INFO)
    expect(app.phase).toBe(PHASES.INFO)
    app.closePage()
    expect(app.phase).toBe(PHASES.MENU)
  })

  it('finds its way back out of a page opened from another page', () => {
    const app = useAppStore()
    app.openPage(PHASES.INFO)
    // The info page offers what changed; that is a page of its own.
    app.openPage(PHASES.CHANGELOG)

    app.closePage()
    expect(app.phase).toBe(PHASES.INFO)
    app.closePage()
    expect(app.phase).toBe(PHASES.MENU)
  })

  it('goes back to the menu when there is nothing to go back to', () => {
    const app = useAppStore()
    app.phase = PHASES.INFO
    app.closePage()
    expect(app.phase).toBe(PHASES.MENU)
  })

  it('forgets where it has been once a match is under way', () => {
    const app = useAppStore()
    const setup = useSetupStore()
    app.openPage(PHASES.HELP)
    app.closePage()

    app.startNewMatch()
    app.confirmOpponent('PPJ')
    ;['Aino', 'Bo', 'Cai', 'Dev', 'Eve'].forEach((name) => setup.addPlayer(name))
    app.openLineup()
    // Reading the instructions mid-setup still returns to the setup screen.
    app.openPage(PHASES.HELP)
    app.closePage()
    expect(app.phase).toBe(PHASES.LINEUP)
  })
})
