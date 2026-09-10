<script setup>
import { computed } from 'vue'
import InfoView from '@/views/InfoView.vue'
import LineupView from '@/views/LineupView.vue'
import LiveView from '@/views/LiveView.vue'
import SetupView from '@/views/SetupView.vue'
import SplashView from '@/views/SplashView.vue'
import StatsView from '@/views/StatsView.vue'
import SummaryView from '@/views/SummaryView.vue'
import TeamNameView from '@/views/TeamNameView.vue'
import { useI18n } from '@/i18n/index.js'
import { PHASES, useAppStore } from '@/stores/app.js'

/**
 * One screen per phase. The app store owns which phase is current, so this
 * component is only a lookup table — nothing here decides where to go next.
 */
const VIEWS = {
  [PHASES.SPLASH]: SplashView,
  [PHASES.INFO]: InfoView,
  [PHASES.TEAM]: TeamNameView,
  [PHASES.SETUP]: SetupView,
  [PHASES.LINEUP]: LineupView,
  [PHASES.LIVE]: LiveView,
  [PHASES.SUMMARY]: SummaryView,
  [PHASES.STATS]: StatsView,
}

const app = useAppStore()
const { t } = useI18n()
const currentView = computed(() => VIEWS[app.phase] ?? SplashView)

/** The splash carries its own info link, and the info page is the destination. */
const showInfoLink = computed(() => ![PHASES.SPLASH, PHASES.INFO].includes(app.phase))
</script>

<template>
  <component :is="currentView" />

  <footer v-if="showInfoLink" class="footer">
    <button type="button" class="footer-link" @click="app.openInfo()">{{ t('infoLink') }}</button>
  </footer>
</template>

<style scoped>
.footer {
  text-align: center;
  margin-top: 28px;
  padding-top: 16px;
  border-top: 1px solid var(--line);
}

.footer-link {
  background: none;
  color: var(--chalk-dim);
  font-size: 12.5px;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 4px;
}
</style>
