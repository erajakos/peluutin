import { describe, expect, it, vi } from 'vitest'
import { askToKeepStorage } from '@/services/persistentStorage.js'

describe('asking the browser to keep what is stored', () => {
  it('asks once, and not again once it has been granted', async () => {
    const persist = vi.fn(async () => true)
    const navigator = { storage: { persist, persisted: async () => false } }
    expect(await askToKeepStorage({ navigator })).toBe(true)
    expect(persist).toHaveBeenCalled()

    const already = { storage: { persist, persisted: async () => true } }
    persist.mockClear()
    expect(await askToKeepStorage({ navigator: already })).toBe(true)
    expect(persist).not.toHaveBeenCalled()
  })

  it('carries on where the browser refuses, or has never heard of it', async () => {
    expect(await askToKeepStorage({ navigator: { storage: { persist: async () => false } } })).toBe(
      false,
    )
    expect(await askToKeepStorage({ navigator: {} })).toBe(false)
    expect(await askToKeepStorage({ navigator: undefined })).toBe(false)
    const throws = {
      storage: {
        persist: () => {
          throw new Error('denied')
        },
      },
    }
    expect(await askToKeepStorage({ navigator: throws })).toBe(false)
  })
})
