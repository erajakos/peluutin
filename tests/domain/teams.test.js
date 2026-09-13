import { describe, expect, it } from 'vitest'
import {
  createTeam,
  findTeam,
  isNameTaken,
  sanitizeTeams,
  withName,
  withRoster,
  withoutTeam,
} from '@/domain/teams.js'

const lps = createTeam(1, ' LPS ', [{ id: 4, name: 'Aino' }])
const ppj = createTeam(2, 'PPJ')

describe('teams', () => {
  it('is a name and a squad, and nothing else', () => {
    expect(lps).toEqual({ id: 1, name: 'LPS', roster: [{ id: 4, name: 'Aino' }] })
    expect(ppj.roster).toEqual([])
  })

  it('changes one team without touching the others', () => {
    const teams = [lps, ppj]
    const named = withName(teams, 2, 'PPJ 2015')
    expect(named.map((team) => team.name)).toEqual(['LPS', 'PPJ 2015'])
    expect(named[0]).toBe(lps)

    const squadded = withRoster(teams, 2, [{ id: 9, name: 'Bo' }])
    expect(squadded[1].roster).toEqual([{ id: 9, name: 'Bo' }])
    expect(squadded[0].roster).toEqual(lps.roster)
  })

  it('leaves a name alone when there is nothing to change it to', () => {
    expect(withName([lps], 1, '   ')).toEqual([lps])
  })

  it('takes a team away', () => {
    expect(withoutTeam([lps, ppj], 1)).toEqual([ppj])
    expect(findTeam([lps, ppj], 2)).toBe(ppj)
    expect(findTeam([lps], 99)).toBe(null)
  })

  it('knows a name already taken, however it is typed', () => {
    const teams = [lps, ppj]
    expect(isNameTaken(teams, 'LPS')).toBe(true)
    expect(isNameTaken(teams, '  lps ')).toBe(true)
    expect(isNameTaken(teams, 'LPS Musta')).toBe(false)
    // Renaming a team to what it is already called is not a clash.
    expect(isNameTaken(teams, 'LPS', 1)).toBe(false)
  })

  it('keeps only what it can trust from storage', () => {
    const saved = [
      { id: 1, name: 'LPS', roster: [{ id: 4, name: 'Aino' }, { id: 'x', name: 'Bo' }, null] },
      { id: 2, name: '   ' },
      { name: 'No id' },
      null,
      { id: 3, name: 'PPJ', roster: 'not a squad' },
    ]
    expect(sanitizeTeams(saved)).toEqual([
      { id: 1, name: 'LPS', roster: [{ id: 4, name: 'Aino' }] },
      { id: 3, name: 'PPJ', roster: [] },
    ])
    expect(sanitizeTeams(null)).toEqual([])
  })
})
