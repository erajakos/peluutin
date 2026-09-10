/**
 * Stock formations keyed by the number of OUTFIELD players (i.e. excluding the
 * goalkeeper). Position names are stored in English and translated for display,
 * so a saved formation means the same thing in every language.
 */
export const FORMATIONS = {
  1: [{ id: 'lone', label: 'Lone striker', positions: ['Attacker'] }],
  2: [{ id: 'two-up', label: 'Defender + Attacker', positions: ['Defender', 'Attacker'] }],
  3: [{ id: 'triangle', label: 'Triangle', positions: ['Defender', 'Midfielder', 'Attacker'] }],
  4: [
    {
      id: 'diamond',
      label: 'Diamond',
      positions: ['Playmaker', 'Left Midfielder', 'Right Midfielder', 'Attacker'],
    },
  ],
  5: [
    {
      id: 'wide-five',
      label: 'Wide five',
      positions: ['Defender', 'Left Wing', 'Right Wing', 'Midfielder', 'Attacker'],
    },
  ],
  6: [
    {
      id: '2-3-1',
      label: '2-3-1',
      positions: [
        'Left Back',
        'Right Back',
        'Left Midfielder',
        'Centre Midfielder',
        'Right Midfielder',
        'Attacker',
      ],
    },
    {
      id: '3-2-1',
      label: '3-2-1',
      positions: [
        'Left Back',
        'Centre Back',
        'Right Back',
        'Left Midfielder',
        'Right Midfielder',
        'Attacker',
      ],
    },
    {
      id: '2-2-2',
      label: '2-2-2',
      positions: [
        'Left Back',
        'Right Back',
        'Left Midfielder',
        'Right Midfielder',
        'Left Forward',
        'Right Forward',
      ],
    },
  ],
  7: [
    {
      id: '3-3-1',
      label: '3-3-1',
      positions: [
        'Left Back',
        'Centre Back',
        'Right Back',
        'Left Midfielder',
        'Centre Midfielder',
        'Right Midfielder',
        'Attacker',
      ],
    },
    {
      id: '3-1-3',
      label: '3-1-3',
      positions: [
        'Left Back',
        'Centre Back',
        'Right Back',
        'Centre Midfielder',
        'Left Forward',
        'Centre Forward',
        'Right Forward',
      ],
    },
  ],
  8: [
    {
      id: '3-3-2',
      label: '3-3-2',
      positions: [
        'Left Back',
        'Centre Back',
        'Right Back',
        'Left Midfielder',
        'Centre Midfielder',
        'Right Midfielder',
        'Left Forward',
        'Right Forward',
      ],
    },
    {
      id: '3-2-3',
      label: '3-2-3',
      positions: [
        'Left Back',
        'Centre Back',
        'Right Back',
        'Left Midfielder',
        'Right Midfielder',
        'Left Forward',
        'Centre Forward',
        'Right Forward',
      ],
    },
    {
      id: '2-3-3',
      label: '2-3-3',
      positions: [
        'Left Back',
        'Right Back',
        'Left Midfielder',
        'Centre Midfielder',
        'Right Midfielder',
        'Left Forward',
        'Centre Forward',
        'Right Forward',
      ],
    },
  ],
  9: [
    {
      id: '3-4-2',
      label: '3-4-2',
      positions: [
        'Left Back',
        'Centre Back',
        'Right Back',
        'Left Midfielder',
        'Centre Midfielder',
        'Centre Midfielder',
        'Right Midfielder',
        'Left Forward',
        'Right Forward',
      ],
    },
    {
      id: '4-3-2',
      label: '4-3-2',
      positions: [
        'Left Back',
        'Centre Back',
        'Centre Back',
        'Right Back',
        'Left Midfielder',
        'Centre Midfielder',
        'Right Midfielder',
        'Left Forward',
        'Right Forward',
      ],
    },
  ],
  10: [
    {
      id: '4-4-2',
      label: '4-4-2',
      positions: [
        'Left Back',
        'Centre Back',
        'Centre Back',
        'Right Back',
        'Left Midfielder',
        'Centre Midfielder',
        'Centre Midfielder',
        'Right Midfielder',
        'Striker',
        'Striker',
      ],
    },
    {
      id: '4-3-3',
      label: '4-3-3',
      positions: [
        'Left Back',
        'Centre Back',
        'Centre Back',
        'Right Back',
        'Centre Midfielder',
        'Centre Midfielder',
        'Centre Midfielder',
        'Left Winger',
        'Striker',
        'Right Winger',
      ],
    },
    {
      id: '5-3-2',
      label: '5-3-2',
      positions: [
        'Left Wing Back',
        'Centre Back',
        'Centre Back',
        'Centre Back',
        'Right Wing Back',
        'Centre Midfielder',
        'Centre Midfielder',
        'Centre Midfielder',
        'Striker',
        'Striker',
      ],
    },
    {
      id: '3-5-2',
      label: '3-5-2',
      positions: [
        'Centre Back',
        'Centre Back',
        'Centre Back',
        'Left Wing Back',
        'Centre Midfielder',
        'Centre Midfielder',
        'Centre Midfielder',
        'Right Wing Back',
        'Striker',
        'Striker',
      ],
    },
    {
      id: '4-2-3-1',
      label: '4-2-3-1',
      positions: [
        'Left Back',
        'Centre Back',
        'Centre Back',
        'Right Back',
        'Defensive Midfielder',
        'Defensive Midfielder',
        'Left Attacking Mid',
        'Centre Attacking Mid',
        'Right Attacking Mid',
        'Striker',
      ],
    },
    {
      id: '4-5-1',
      label: '4-5-1',
      positions: [
        'Left Back',
        'Centre Back',
        'Centre Back',
        'Right Back',
        'Left Midfielder',
        'Centre Midfielder',
        'Centre Midfielder',
        'Centre Midfielder',
        'Right Midfielder',
        'Striker',
      ],
    },
  ],
}

/** How many players line up outside the goal for a given match format. */
export function outfieldCount(fieldSize, hasGoalkeeper) {
  return Math.max(1, fieldSize - (hasGoalkeeper ? 1 : 0))
}

/**
 * Formations available for `count` outfield players. Formats we do not ship a
 * shape for fall back to a single generic "Balanced" formation with numbered
 * positions the coach can rename.
 */
export function getFormationsFor(count) {
  if (FORMATIONS[count]) return FORMATIONS[count]
  return [{ id: 'balanced', label: 'Balanced', positions: defaultPositionNames(count) }]
}

export function findFormation(count, id) {
  const options = getFormationsFor(count)
  return options.find((formation) => formation.id === id) || options[0]
}

/** Placeholder keys for a format with no stock shape, e.g. "Position 3". */
export function defaultPositionNames(count) {
  return Array.from({ length: count }, (_, index) => `Position ${index + 1}`)
}
