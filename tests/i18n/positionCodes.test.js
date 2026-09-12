import { afterEach, describe, expect, it } from 'vitest'
import { setLocale, tPosition, tPositionCode } from '@/i18n/index.js'

afterEach(() => setLocale('fi'))

describe('position codes', () => {
  it('reads as the Finnish word rather than a truncation of it', () => {
    setLocale('fi')
    expect(tPositionCode('Playmaker')).toBe('PR')
    expect(tPositionCode('Goalkeeper')).toBe('MV')
  })

  it('follows the codes used on international team sheets in English', () => {
    setLocale('en')
    expect(tPositionCode('Goalkeeper')).toBe('GK')
    expect(tPositionCode('Playmaker')).toBe('PM')
    expect(tPositionCode('Striker')).toBe('ST')
  })

  it('keeps a stock position coded whichever language named it', () => {
    setLocale('fi')
    expect(tPositionCode('Playmaker', tPosition('Playmaker'))).toBe('PR')
    setLocale('en')
    expect(tPositionCode('Playmaker', 'Pelinrakentaja')).toBe('PM')
  })

  it('gives no code to a position the coach has renamed', () => {
    setLocale('fi')
    expect(tPositionCode('Playmaker', 'Ysi')).toBe('')
  })

  it('gives no code to a position that has none', () => {
    expect(tPositionCode('Position 3')).toBe('')
    expect(tPositionCode('Left Back')).toBe('')
  })
})
