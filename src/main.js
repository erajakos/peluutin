import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { listenForInstallPrompt } from './services/installPrompt.js'
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

const pinia = createPinia()
pinia.use(persistMatchSettings)
pinia.use(persistRoster)

const app = createApp(App).use(pinia)

// Back where the coach left off: a match survives a reload, a closed tab, or a
// stray swipe back out of the app.
resumeSession()
keepSessionSaved()

app.mount('#app')
