/**
 * Where each position stands on the drawn pitch.
 *
 * Coordinates are percentages of the pitch box: `x` runs left→right, `y` runs
 * top→bottom with the opponent's goal at the top, so the team always attacks
 * upwards. Positions are snapped to a small set of horizontal lines, then
 * spread apart within each line — that is what makes a back four look like a
 * back four instead of four chips stacked on one spot.
 */

/** Canonical depth of each band, measured from our own goal line. */
const LINES = {
  GK: 7,
  DEF: 27,
  WING_BACK: 37,
  HOLDING: 46,
  MID: 58,
  ATT_MID: 71,
  FORWARD: 86,
}

/** Every stock position, as `[line, preferred x]`. */
const SPOTS = {
  Goalkeeper: [LINES.GK, 50],

  Defender: [LINES.DEF, 50],
  'Left Back': [LINES.DEF, 20],
  'Centre Back': [LINES.DEF, 50],
  'Right Back': [LINES.DEF, 80],

  'Left Wing Back': [LINES.WING_BACK, 14],
  'Right Wing Back': [LINES.WING_BACK, 86],

  'Defensive Midfielder': [LINES.HOLDING, 50],
  Playmaker: [LINES.HOLDING, 50],

  Midfielder: [LINES.MID, 50],
  'Left Midfielder': [LINES.MID, 20],
  'Centre Midfielder': [LINES.MID, 50],
  'Right Midfielder': [LINES.MID, 80],

  'Left Attacking Mid': [LINES.ATT_MID, 24],
  'Centre Attacking Mid': [LINES.ATT_MID, 50],
  'Right Attacking Mid': [LINES.ATT_MID, 76],
  'Left Wing': [LINES.ATT_MID, 16],
  'Right Wing': [LINES.ATT_MID, 84],
  'Left Winger': [LINES.ATT_MID, 16],
  'Right Winger': [LINES.ATT_MID, 84],

  Attacker: [LINES.FORWARD, 50],
  Striker: [LINES.FORWARD, 50],
  'Centre Forward': [LINES.FORWARD, 50],
  'Left Forward': [LINES.FORWARD, 34],
  'Right Forward': [LINES.FORWARD, 66],
}

/** Custom or renamed positions have no known spot; park them in midfield. */
const UNKNOWN_SPOT = [LINES.MID, 50]

const EDGE_MARGIN = 12

/**
 * Lay out slots on the pitch.
 *
 * @param {Array<{id:number, key:string, isGoalkeeper:boolean}>} slots
 * @returns {Array<{slotId:number, x:number, y:number}>} percentage coordinates
 */
export function pitchLayout(slots) {
  const placed = slots.map((slot, index) => {
    const [depth, x] = SPOTS[slot.key] ?? UNKNOWN_SPOT
    return { slotId: slot.id, depth, x, index }
  })

  const byLine = new Map()
  placed.forEach((entry) => {
    const line = byLine.get(entry.depth) ?? []
    line.push(entry)
    byLine.set(entry.depth, line)
  })

  const result = []
  byLine.forEach((line) => {
    spreadLine(line).forEach((entry) => {
      result.push({ slotId: entry.slotId, x: entry.x, y: 100 - entry.depth })
    })
  })

  // Keep the caller's order so the pitch and the squad list agree.
  return slots
    .map((slot) => result.find((entry) => entry.slotId === slot.id))
    .filter((entry) => entry !== undefined)
}

/**
 * Turn a line's preferred positions into positions that do not overlap.
 *
 * Players who want the exact same spot (two centre backs, three centre mids)
 * fan out symmetrically around it, so a back four reads as a back four. Only if
 * that still leaves neighbours colliding do we push the line sideways, and only
 * then is the whole line recentred — which keeps a deliberately lopsided
 * shape, like a lone winger, where the coach put it.
 */
function spreadLine(entries) {
  const gap = minimumGap(entries.length)

  const groups = new Map()
  entries
    .slice()
    .sort((a, b) => a.x - b.x || a.index - b.index)
    .forEach((entry) => {
      const group = groups.get(entry.x) ?? []
      group.push(entry)
      groups.set(entry.x, group)
    })

  const line = []
  groups.forEach((group, baseX) => {
    group.forEach((entry, i) => {
      line.push({ ...entry, x: baseX + (i - (group.length - 1) / 2) * gap })
    })
  })
  line.sort((a, b) => a.x - b.x || a.index - b.index)

  let crowded = false
  for (let i = 1; i < line.length; i += 1) {
    if (line[i].x < line[i - 1].x + gap) {
      line[i].x = line[i - 1].x + gap
      crowded = true
    }
  }

  if (!crowded) {
    return line.map((entry) => ({ ...entry, x: clamp(entry.x, EDGE_MARGIN, 100 - EDGE_MARGIN) }))
  }

  const centre = (line[0].x + line[line.length - 1].x) / 2
  const span = line[line.length - 1].x - line[0].x
  const available = 100 - 2 * EDGE_MARGIN
  const scale = span > available ? available / span : 1

  return line.map((entry) => ({
    ...entry,
    x: clamp(50 + (entry.x - centre) * scale, EDGE_MARGIN, 100 - EDGE_MARGIN),
  }))
}

function minimumGap(count) {
  if (count <= 2) return 22
  if (count <= 4) return 19
  return 15
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}
