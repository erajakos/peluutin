/**
 * Nothing in this app is persisted: a reload or a closed tab loses the match.
 * The browser's own confirmation is the only thing that can interrupt that, and
 * it only appears if a listener asks for it.
 *
 * The wording is the browser's own — it cannot be customised — so `shouldWarn`
 * must be conservative and true only when there is genuinely something to lose.
 */
export function installUnloadWarning(shouldWarn) {
  function handle(event) {
    if (!shouldWarn()) return
    event.preventDefault()
    // Older browsers require a non-empty returnValue to raise the dialog.
    event.returnValue = ''
  }

  window.addEventListener('beforeunload', handle)
  return () => window.removeEventListener('beforeunload', handle)
}
