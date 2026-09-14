import { describe, expect, it, vi } from 'vitest'
import { buzz } from '@/services/haptics.js'

describe('a buzz in the hand', () => {
  it('vibrates where the phone can', () => {
    const vibrate = vi.fn(() => true)
    expect(buzz(30, { navigator: { vibrate } })).toBe(true)
    expect(vibrate).toHaveBeenCalledWith(30)
  })

  it('does nothing where it cannot, and never throws', () => {
    expect(buzz(30, { navigator: {} })).toBe(false)
    expect(buzz(30, { navigator: undefined })).toBe(false)
    const throws = {
      vibrate: () => {
        throw new Error('blocked')
      },
    }
    expect(buzz(30, { navigator: throws })).toBe(false)
  })
})
