import { computed, ref } from 'vue'

/**
 * The browser's offer to install the app as a PWA.
 *
 * Chrome and Edge announce installability with a `beforeinstallprompt` event,
 * which can fire before any component exists — so it is caught here, as soon as
 * the app boots, and held until the coach taps "install". Safari has no such
 * event: on iOS installing is Share → Add to Home Screen, explained on the info
 * page instead.
 */
const deferredPrompt = ref(null)
const installed = ref(false)

export function listenForInstallPrompt() {
  installed.value = window.matchMedia?.('(display-mode: standalone)').matches ?? false

  window.addEventListener('beforeinstallprompt', (event) => {
    // Hold the offer for our own button instead of the browser's mini-infobar.
    event.preventDefault()
    deferredPrompt.value = event
  })

  window.addEventListener('appinstalled', () => {
    deferredPrompt.value = null
    installed.value = true
  })
}

export function useInstallPrompt() {
  return {
    canInstall: computed(() => deferredPrompt.value !== null && !installed.value),
    async install() {
      const prompt = deferredPrompt.value
      if (!prompt) return
      // An offer can only be used once, accepted or not.
      deferredPrompt.value = null
      await prompt.prompt()
    },
  }
}
