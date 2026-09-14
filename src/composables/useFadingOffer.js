import { onBeforeUnmount, ref, watch } from 'vue'

/**
 * An offer that appears when something happens and leaves on its own.
 *
 * The way back from a mis-tap on a touchline: shown the moment a change or a
 * goal is made, gone a few seconds later. Nobody who meant it has anything to
 * dismiss, and nobody taps it by accident later, because by then it is gone.
 *
 * @param {() => unknown} source what to watch; truthy means "just happened"
 * @param {number} [ms] how long the offer stays
 * @returns {import('vue').Ref<boolean>} whether to show it now
 */
export function useFadingOffer(source, ms = 12_000) {
  const offered = ref(false)
  let timer = null

  watch(source, (value) => {
    clearTimeout(timer)
    offered.value = Boolean(value)
    if (!value) return
    timer = setTimeout(() => {
      offered.value = false
    }, ms)
  })

  onBeforeUnmount(() => clearTimeout(timer))
  return offered
}
