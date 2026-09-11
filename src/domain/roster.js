/**
 * Names as they should be shown, given the names as they were typed.
 *
 * Two players called Aino become "Aino 1" and "Aino 2", numbered in the order
 * they were added; a unique name is left alone. Matching ignores case and
 * surrounding spaces, because "aino" and "Aino " are the same child. Numbering
 * is recomputed from scratch every time, so removing one of two Ainos turns the
 * other back into plain "Aino".
 *
 * @param {string[]} typedNames
 * @returns {string[]} display names, in the same order
 */
export function numberDuplicateNames(typedNames) {
  const keyOf = (name) => name.trim().toLocaleLowerCase('fi')

  const totals = new Map()
  typedNames.forEach((name) => totals.set(keyOf(name), (totals.get(keyOf(name)) ?? 0) + 1))

  const seen = new Map()
  return typedNames.map((name) => {
    const key = keyOf(name)
    const clean = name.trim()
    if (totals.get(key) === 1) return clean
    const number = (seen.get(key) ?? 0) + 1
    seen.set(key, number)
    return `${clean} ${number}`
  })
}
