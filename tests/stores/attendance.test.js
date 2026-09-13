import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useSetupStore } from '@/stores/setup.js'

describe('who turned up', () => {
  beforeEach(() => setActivePinia(createPinia()))

  it('counts everyone in as soon as they are in the team', () => {
    const setup = useSetupStore()
    ;['Aino', 'Bo'].forEach((name) => setup.addPlayer(name))
    expect(setup.attending.map((player) => player.name)).toEqual(['Aino', 'Bo'])
  })

  it('leaves a player out of the match without taking them out of the team', () => {
    const setup = useSetupStore()
    ;['Aino', 'Bo'].forEach((name) => setup.addPlayer(name))
    const bo = setup.roster[1].id

    setup.toggleAttending(bo)
    expect(setup.attending.map((player) => player.name)).toEqual(['Aino'])
    expect(setup.roster).toHaveLength(2)

    setup.toggleAttending(bo)
    expect(setup.attending).toHaveLength(2)
  })

  it('counts only those here towards starting a match', () => {
    const setup = useSetupStore()
    setup.setFieldSize(5)
    ;['Aino', 'Bo', 'Cai', 'Dev', 'Eve'].forEach((name) => setup.addPlayer(name))
    expect(setup.hasEnoughPlayers).toBe(true)

    setup.toggleAttending(setup.roster[0].id)
    expect(setup.hasEnoughPlayers).toBe(false)
  })

  it('brings a squad out of the cupboard with everyone present', () => {
    const setup = useSetupStore()
    setup.restoreRoster([
      { id: 4, name: 'Aino' },
      { id: 7, name: 'Bo' },
    ])
    expect(setup.attendingIds).toEqual([4, 7])
  })

  it('forgets a player who has left the team entirely', () => {
    const setup = useSetupStore()
    ;['Aino', 'Bo'].forEach((name) => setup.addPlayer(name))
    const bo = setup.roster[1].id
    setup.removePlayer(bo)
    expect(setup.attendingIds).not.toContain(bo)
    expect(setup.attending).toHaveLength(1)
  })
})
