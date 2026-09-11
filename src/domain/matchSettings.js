/**
 * What of the setup is worth remembering between visits: how the match is
 * played. Who plays, and who the opponent is, change every time — so the squad
 * and the opponent are deliberately not part of this.
 */
const WHOLE_NUMBERS = ['gameLength', 'halfLength', 'fieldSize', 'subLimit']
const SWITCHES = [
  'twoHalves',
  'hasGoalkeeper',
  'fixedGoalkeeper',
  'allowReentry',
  'subLimitEnabled',
  'trackCards',
]

/** The settings to save, taken from the setup state. */
export function pickMatchSettings(state) {
  return {
    ...Object.fromEntries([...WHOLE_NUMBERS, ...SWITCHES].map((key) => [key, state[key]])),
    formationId: state.formationId,
    positions: state.positions.map(({ key, label }) => ({ key, label })),
  }
}

/**
 * Only what can be trusted from storage: anything missing, malformed, or from
 * an older version is dropped rather than allowed to break the setup screen.
 * The defaults fill whatever this leaves out.
 */
export function sanitizeMatchSettings(raw) {
  if (!raw || typeof raw !== 'object') return {}
  const clean = {}

  WHOLE_NUMBERS.forEach((key) => {
    const value = raw[key]
    if (Number.isInteger(value) && value >= 1 && value <= 999) clean[key] = value
  })
  SWITCHES.forEach((key) => {
    if (typeof raw[key] === 'boolean') clean[key] = raw[key]
  })
  if (typeof raw.formationId === 'string') clean.formationId = raw.formationId

  const positionsAreValid =
    Array.isArray(raw.positions) &&
    raw.positions.length > 0 &&
    raw.positions.every(
      (position) =>
        position && typeof position.key === 'string' && typeof position.label === 'string',
    )
  if (positionsAreValid) {
    clean.positions = raw.positions.map(({ key, label }) => ({ key, label }))
  }

  return clean
}
