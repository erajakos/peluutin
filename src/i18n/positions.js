/**
 * Position and formation names are stored in English and translated only for
 * display, so switching language never rewrites the coach's saved shape.
 */
const POSITIONS = {
  fi: {
    Defender: 'Puolustaja',
    Midfielder: 'Keskikenttäpelaaja',
    Attacker: 'Hyökkääjä',
    'Left Wing': 'Vasen laitahyökkääjä',
    'Right Wing': 'Oikea laitahyökkääjä',
    'Left Midfielder': 'Vasen laitapelaaja',
    'Right Midfielder': 'Oikea laitapelaaja',
    'Centre Midfielder': 'Keskikenttäpelaaja (keski)',
    'Left Back': 'Vasen pakki',
    'Right Back': 'Oikea pakki',
    'Centre Back': 'Keskuspuolustaja',
    'Left Forward': 'Vasen hyökkääjä',
    'Right Forward': 'Oikea hyökkääjä',
    'Centre Forward': 'Keskushyökkääjä',
    'Left Wing Back': 'Vasen laitapakki',
    'Right Wing Back': 'Oikea laitapakki',
    'Defensive Midfielder': 'Puolustava keskikenttäpelaaja',
    'Left Attacking Mid': 'Vasen hyökkäävä keskikenttäpelaaja',
    'Centre Attacking Mid': 'Hyökkäävä keskikenttäpelaaja (keski)',
    'Right Attacking Mid': 'Oikea hyökkäävä keskikenttäpelaaja',
    'Left Winger': 'Vasen laituri',
    'Right Winger': 'Oikea laituri',
    Striker: 'Kärkipelaaja',
    Playmaker: 'Pelinrakentaja',
  },
}

const FORMATION_LABELS = {
  fi: {
    'Lone striker': 'Yksinäinen kärki',
    'Defender + Attacker': 'Puolustaja + hyökkääjä',
    Triangle: 'Kolmio',
    Diamond: 'Vinoneliö',
    'Wide five': 'Leveä viisikko',
    Balanced: 'Tasapainoinen',
  },
}

export function translatePosition(name, locale) {
  return POSITIONS[locale]?.[name] ?? name
}

export function translateFormationLabel(label, locale) {
  return FORMATION_LABELS[locale]?.[label] ?? label
}
