<script setup>
import { computed } from 'vue'
import { useRegisterSW } from 'virtual:pwa-register/vue'
import ChangelogView from '@/views/ChangelogView.vue'
import HelpView from '@/views/HelpView.vue'
import MenuView from '@/views/MenuView.vue'
import TeamSquadView from '@/views/TeamSquadView.vue'
import TeamsView from '@/views/TeamsView.vue'
import HistoryView from '@/views/HistoryView.vue'
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
import { PHASES, useAppStore } from '@/stores/app.js'

/**
 * One screen per phase. The app store owns which phase is current, so this
 * component is only a lookup table — nothing here decides where to go next.
 */
const VIEWS = {
  [PHASES.SPLASH]: SplashView,
  [PHASES.MENU]: MenuView,
  [PHASES.INFO]: InfoView,
  [PHASES.HELP]: HelpView,
  [PHASES.CHANGELOG]: ChangelogView,
  [PHASES.HISTORY]: HistoryView,
  [PHASES.TEAMS]: TeamsView,
  [PHASES.TEAM_SQUAD]: TeamSquadView,
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

/**
 * App updates. A new version downloads and takes over in the background, but
 * the page is only reloaded onto it from the start screen: a match would come
 * back after a reload, but not a lineup half picked, and nobody wants the
 * screen to blink under them on the touchline. The running page keeps the code
 * it already loaded, and the next launch simply opens the new version.
 */
useRegisterSW({
  immediate: true,
  onNeedReload() {
    if (app.phase === PHASES.SPLASH) window.location.reload()
  },
})
</script>

<template>
  <GrassBackdrop />

  <component :is="currentView" />
</template>
