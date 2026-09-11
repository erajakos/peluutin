import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { persistMatchSettings } from './services/settingsPersistence.js'
import './assets/styles/tokens.css'
import './assets/styles/base.css'

const pinia = createPinia()
pinia.use(persistMatchSettings)

createApp(App).use(pinia).mount('#app')
