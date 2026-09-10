/** Seconds -> "m:ss". Minutes are not padded, matching a stadium clock. */
export function formatTime(totalSeconds) {
  const safe = Math.max(0, Math.round(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function minutesToSeconds(minutes) {
  return Math.max(0, Math.round(minutes)) * 60
}

/** Clamp free-text numeric input to a whole number of at least `min`. */
export function toPositiveInt(value, fallback, min = 1) {
  const parsed = Number.parseInt(value, 10)
  if (Number.isNaN(parsed)) return fallback
  return Math.max(min, parsed)
}
