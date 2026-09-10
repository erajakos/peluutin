import { describe, expect, it } from 'vitest'
import { formatTime, minutesToSeconds, toPositiveInt } from '@/domain/time.js'

describe('formatTime', () => {
  it('formats as m:ss with padded seconds', () => {
    expect(formatTime(0)).toBe('0:00')
    expect(formatTime(9)).toBe('0:09')
    expect(formatTime(60)).toBe('1:00')
    expect(formatTime(2400)).toBe('40:00')
  })

  it('does not pad minutes, and never renders negative time', () => {
    expect(formatTime(605)).toBe('10:05')
    expect(formatTime(-30)).toBe('0:00')
  })
})

describe('toPositiveInt', () => {
  it('falls back when the text is not a number', () => {
    expect(toPositiveInt('', 20)).toBe(20)
    expect(toPositiveInt('abc', 7)).toBe(7)
  })

  it('clamps to the minimum rather than accepting zero or negatives', () => {
    expect(toPositiveInt('0', 20)).toBe(1)
    expect(toPositiveInt('-4', 20)).toBe(1)
    expect(toPositiveInt('11', 20)).toBe(11)
  })
})

describe('minutesToSeconds', () => {
  it('converts whole minutes', () => {
    expect(minutesToSeconds(20)).toBe(1200)
  })
})
