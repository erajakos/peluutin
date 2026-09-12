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

/**
 * Short codes for the drawn formation, where only a couple of letters fit.
 *
 * There is no official Finnish set — Palloliitto writes positions out in full,
 * and the codes on international team sheets are English (GK, DF, MF, FW and
 * the detailed CB, LB, DM, AM, ST). MV is the one Finnish abbreviation in
 * common use, so the rest follow it: two letters that read as the Finnish word
 * rather than as a truncation of it.
 *
 * Only positions still carrying their stock name are listed. A position the
 * coach has renamed is abbreviated from their own wording instead.
 */
const CODES = {
  fi: {
    Goalkeeper: 'MV',
    Defender: 'PU',
    Midfielder: 'KK',
    Attacker: 'HY',
    Striker: 'KÄ',
    Playmaker: 'PR',
    'Centre Back': 'KP',
    'Defensive Midfielder': 'PK',
    'Centre Midfielder': 'KK',
    'Centre Forward': 'KH',
    'Centre Attacking Mid': 'HK',
  },
  en: {
    Goalkeeper: 'GK',
    Defender: 'DF',
    Midfielder: 'MF',
    Attacker: 'FW',
    Striker: 'ST',
    Playmaker: 'PM',
    'Centre Back': 'CB',
    'Defensive Midfielder': 'DM',
    'Centre Midfielder': 'CM',
    'Centre Forward': 'CF',
    'Centre Attacking Mid': 'AM',
  },
}

export function positionCode(name, locale) {
  return CODES[locale]?.[name] ?? ''
}

export function translatePosition(name, locale) {
  return POSITIONS[locale]?.[name] ?? name
}

export function translateFormationLabel(label, locale) {
  return FORMATION_LABELS[locale]?.[label] ?? label
}
