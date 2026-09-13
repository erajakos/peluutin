/**
 * The repo's changelog, written from the one the app shows.
 *
 * Two lists would drift, and the one a coach reads is the one that has to be
 * right — so this is generated from it. Run `npm run changelog` after editing
 * `src/changelog.js`.
 */
import { writeFileSync } from 'node:fs'
import { RELEASES } from '../src/changelog.js'

const lines = [
  '# Changelog',
  '',
  'What changed in each version, in the words the app itself shows under',
  '*Tietoja → Mitä uutta*. Generated from [`src/changelog.js`](src/changelog.js) by',
  '`npm run changelog`; edit that file, not this one.',
  '',
]

RELEASES.forEach((release) => {
  lines.push(`## ${release.version} — ${release.en.title}`, '', `*${release.date}*`, '')
  release.en.changes.forEach((change) => lines.push(`- ${change}`))
  lines.push('')
})

writeFileSync(new URL('../CHANGELOG.md', import.meta.url), lines.join('\n'))
console.log(`CHANGELOG.md written: ${RELEASES.length} releases, newest ${RELEASES[0].version}`)
