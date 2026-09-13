import { describe, expect, it } from 'vitest'
import pkg from '../package.json'
import { RELEASES, VERSION } from '@/changelog.js'

describe('versions', () => {
  it('says the same version as the package does', () => {
    expect(pkg.version.startsWith(`${VERSION}.`) || pkg.version === VERSION).toBe(true)
  })

  it('starts with the version this build is, and counts down from there', () => {
    expect(RELEASES[0].version).toBe(VERSION)
    const dates = RELEASES.map((release) => Date.parse(release.date))
    expect(dates.every((date) => Number.isFinite(date))).toBe(true)
    expect([...dates].sort((a, b) => b - a)).toEqual(dates)
  })

  it('says the same thing in both languages, release for release', () => {
    RELEASES.forEach((release) => {
      expect(release.fi.title).toBeTruthy()
      expect(release.en.title).toBeTruthy()
      expect(release.fi.changes.length).toBe(release.en.changes.length)
      expect(release.fi.changes.every((line) => line.trim().length > 0)).toBe(true)
      expect(release.en.changes.every((line) => line.trim().length > 0)).toBe(true)
    })
  })

  it('names every version once', () => {
    const versions = RELEASES.map((release) => release.version)
    expect(new Set(versions).size).toBe(versions.length)
  })
})
