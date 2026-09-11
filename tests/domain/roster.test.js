import { describe, expect, it } from 'vitest'
import { numberDuplicateNames } from '@/domain/roster.js'

describe('numberDuplicateNames', () => {
  it('leaves unique names alone', () => {
    expect(numberDuplicateNames(['Aino', 'Bo', 'Cai'])).toEqual(['Aino', 'Bo', 'Cai'])
  })

  it('numbers players who share a name, in the order they were added', () => {
    expect(numberDuplicateNames(['Aino', 'Bo', 'Aino'])).toEqual(['Aino 1', 'Bo', 'Aino 2'])
  })

  it('handles more than two of the same name', () => {
    expect(numberDuplicateNames(['Leo', 'Leo', 'Leo'])).toEqual(['Leo 1', 'Leo 2', 'Leo 3'])
  })

  it('treats a name as the same child whatever the case or spacing', () => {
    expect(numberDuplicateNames(['Aino', 'aino ', ' AINO'])).toEqual(['Aino 1', 'aino 2', 'AINO 3'])
  })

  it('counts each shared name separately', () => {
    expect(numberDuplicateNames(['Aino', 'Leo', 'Aino', 'Leo'])).toEqual([
      'Aino 1',
      'Leo 1',
      'Aino 2',
      'Leo 2',
    ])
  })
})
