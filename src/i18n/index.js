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
  const numbered = /^Position (\d+)$/.exec(key)
  if (numbered) return t('positionNumbered', Number(numbered[1]))
  return translatePosition(key, locale.value)
}

export function tFormationLabel(label) {
  return translateFormationLabel(label, locale.value)
}

export function useI18n() {
  return {
    t,
    tPosition,
    tFormationLabel,
    setLocale,
    locale: computed(() => locale.value),
  }
}
