<script setup>
import { computed, onBeforeUnmount } from 'vue'
import InfoView from '@/views/InfoView.vue'
import LineupView from '@/views/LineupView.vue'
import LiveView from '@/views/LiveView.vue'
import OpponentView from '@/views/OpponentView.vue'
import SettingsView from '@/views/SettingsView.vue'
import SplashView from '@/views/SplashView.vue'
import SquadView from '@/views/SquadView.vue'
import StatsView from '@/views/StatsView.vue'
import SummaryView from '@/views/SummaryView.vue'
import TeamNameView from '@/views/TeamNameView.vue'
import GrassBackdrop from '@/components/ui/GrassBackdrop.vue'
import { installUnloadWarning } from '@/services/unloadGuard.js'
import { PHASES, useAppStore } from '@/stores/app.js'

/**
 * One screen per phase. The app store owns which phase is current, so this
 * component is only a lookup table — nothing here decides where to go next.
 */
const VIEWS = {
  [PHASES.SPLASH]: SplashView,
  [PHASES.INFO]: InfoView,
  [PHASES.TEAM]: TeamNameView,
  [PHASES.OPPONENT]: OpponentView,
  [PHASES.SETTINGS]: SettingsView,
  [PHASES.SQUAD]: SquadView,
  [PHASES.LINEUP]: LineupView,
  [PHASES.LIVE]: LiveView,
  [PHASES.SUMMARY]: SummaryView,
  [PHASES.STATS]: StatsView,
}

const app = useAppStore()
const currentView = computed(() => VIEWS[app.phase] ?? SplashView)

// A refresh would wipe the match, so ask before it happens.
const stopUnloadWarning = installUnloadWarning(() => app.hasWorkToLose)
onBeforeUnmount(stopUnloadWarning)
</script>

<template>
  <GrassBackdrop />

  <component :is="currentView" />
</template>
