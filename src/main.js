import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { setLocale } from './i18n/index.js'
import { listenForInstallPrompt } from './services/installPrompt.js'
import { askToKeepStorage } from './services/persistentStorage.js'
import { loadLanguage } from './services/storage.js'
import { installUrlNavigation } from './services/urlNavigation.js'
import { useAppStore } from './stores/app.js'
import { persistHistory } from './services/historyPersistence.js'
import { persistRoster } from './services/rosterPersistence.js'
import { keepSessionSaved, resumeSession } from './services/sessionPersistence.js'
import { persistMatchSettings } from './services/settingsPersistence.js'

// Self-hosted fonts: bundled with the app, so they work offline and no request
// ever goes to a third-party font service. Latin covers Finnish (ä, ö, å).
import '@fontsource/barlow/latin-400.css'
import '@fontsource/barlow/latin-500.css'
import '@fontsource/barlow/latin-600.css'
import '@fontsource/barlow/latin-700.css'
import '@fontsource/barlow-condensed/latin-600.css'
import '@fontsource/barlow-condensed/latin-700.css'

import './assets/styles/tokens.css'
import './assets/styles/base.css'

// Caught before mounting: the browser may offer installation straight away.
listenForInstallPrompt()

// Everything this app knows lives on the device, so ask the browser to keep it
// rather than treat it as something to clear when room runs short.
askToKeepStorage()

// Opened in the language it was last used in, before anything is drawn.
const language = loadLanguage()
if (language) setLocale(language)

const pinia = createPinia()
pinia.use(persistMatchSettings)
pinia.use(persistRoster)
pinia.use(persistHistory)

const app = createApp(App).use(pinia)

// Back where the coach left off: a match survives a reload, a closed tab, or a
// stray swipe back out of the app.
resumeSession()
keepSessionSaved()

// The address bar follows the app, and the back gesture moves inside it.
installUrlNavigation(useAppStore())

app.mount('#app')
