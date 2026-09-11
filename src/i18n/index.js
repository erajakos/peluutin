import { computed, ref } from 'vue'
import en from './locales/en.js'
import fi from './locales/fi.js'
import { translateFormationLabel, translatePosition } from './positions.js'

const MESSAGES = { en, fi }
export const DEFAULT_LOCALE = 'fi'
export const AVAILABLE_LOCALES = [
  { code: 'fi', label: 'Suomi' },
  { code: 'en', label: 'English' },
]

const FALLBACK_LOCALE = 'en'

const locale = ref(DEFAULT_LOCALE)

export function setLocale(code) {
  if (MESSAGES[code]) locale.value = code
}

export function currentLocale() {
  return locale.value
}

/** The locale on offer when the current one is not the reader's. */
export function alternateLocale() {
  return locale.value === 'fi' ? 'en' : 'fi'
}

/**
 * Look a message up in a named locale rather than the current one — used to
 * label the offer to switch language in the language being offered.
 */
export function tIn(code, key, ...args) {
  const messages = MESSAGES[code] ?? MESSAGES[FALLBACK_LOCALE]
  const value = messages[key] ?? MESSAGES[FALLBACK_LOCALE][key]
  if (typeof value === 'function') return value(...args)
  return value ?? key
}

/**
 * Look up a message. Values may be plain strings or functions taking arguments,
 * which keeps grammar (plurals, word order) inside the locale file rather than
 * spread across components. Missing keys fall back to English, then to the key
 * itself so a gap is visible rather than blank.
 */
export function t(key, ...args) {
  const messages = MESSAGES[locale.value] ?? MESSAGES[FALLBACK_LOCALE]
  const value = messages[key] ?? MESSAGES[FALLBACK_LOCALE][key]
  if (typeof value === 'function') return value(...args)
  return value ?? key
}

/**
 * Positions are stored under their English key. Placeholder keys from a format
 * with no stock formation ("Position 3") are numbered in the reader's language.
 */
export function tPosition(key) {
  return stockPositionLabel(locale.value, key)
}

function stockPositionLabel(code, key) {
  const numbered = /^Position (\d+)$/.exec(key)
  if (numbered) return tIn(code, 'positionNumbered', Number(numbered[1]))
  return translatePosition(key, code)
}

/**
 * Whether a position still carries its stock name in any language — as
 * opposed to a name the coach typed. Only stock names are translated when the
 * language changes; the coach's own wording is theirs to keep.
 */
export function isStockPositionLabel(key, label) {
  return Object.keys(MESSAGES).some((code) => stockPositionLabel(code, key) === label)
}

export function tFormationLabel(label) {
  return translateFormationLabel(label, locale.value)
}

export function useI18n() {
  return {
    t,
    tIn,
    tPosition,
    tFormationLabel,
    setLocale,
    locale: computed(() => locale.value),
    alternate: computed(() => alternateLocale()),
  }
}
