import { describe, expect, it } from 'vitest'
import { knownPlayerId, numberDuplicateNames, rememberPlayers } from '@/domain/roster.js'

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

describe('who a player is', () => {
  const known = [
    { id: 1, name: 'Aino' },
    { id: 2, name: 'Bo' },
    { id: 3, name: 'Aino' },
  ]

  it('gives a name back the id it had before', () => {
    expect(knownPlayerId(known, 'Aino', [])).toBe(1)
    expect(knownPlayerId(known, ' bo ', [])).toBe(2)
  })

  it('never hands out an id already standing in the squad', () => {
    expect(knownPlayerId(known, 'Aino', [1])).toBe(3)
    expect(knownPlayerId(known, 'Aino', [1, 3])).toBe(null)
  })

  it('has nothing to say about a name it has not seen', () => {
    expect(knownPlayerId(known, 'Cai', [])).toBe(null)
  })

  it('writes players into the book without repeating them', () => {
    const book = rememberPlayers(known, [
      { id: 1, name: 'Aino' },
      { id: 4, name: 'Cai' },
    ])
    expect(book.filter((player) => player.id === 1)).toHaveLength(1)
    expect(book.map((player) => player.id)).toEqual([2, 3, 1, 4])
  })

  it('keeps the book from growing for ever', () => {
    const many = Array.from({ length: 30 }, (_, i) => ({ id: i + 1, name: `P${i}` }))
    expect(rememberPlayers([], many, 10)).toHaveLength(10)
  })
})
