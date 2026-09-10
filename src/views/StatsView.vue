<script setup>
import { computed } from 'vue'
import MatchHistoryList from '@/components/stats/MatchHistoryList.vue'
import StatGrid from '@/components/stats/StatGrid.vue'
import PlayingTimeTable from '@/components/summary/PlayingTimeTable.vue'
import TallyPanel from '@/components/summary/TallyPanel.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useMatchdayStore } from '@/stores/matchday.js'

const app = useAppStore()
const matchday = useMatchdayStore()
const { t } = useI18n()

const summary = computed(() => matchday.summary)

const totals = computed(() => [
  { value: summary.value.played, label: t('matchesLabel') },
  { value: `${summary.value.goalsFor}–${summary.value.goalsAgainst}`, label: t('goalsLabel') },
])

// "1V 0T 0H" needs decoding; three labelled numbers do not.
const record = computed(() => [
  { value: summary.value.wins, label: t('winsLabel') },
  { value: summary.value.draws, label: t('drawsLabel') },
  { value: summary.value.losses, label: t('lossesLabel') },
])

const scorerItems = computed(() => {
  const { entries, unknown } = summary.value.scorers
  const items = entries.map((entry) => `${entry.name} ×${entry.count}`)
  if (unknown) items.push(`${t('unknownScorerOption')} ×${unknown}`)
  return items
})

const cardItems = computed(() =>
  summary.value.cards.map((entry) => `${entry.name} 🟨×${entry.yellow} 🟥×${entry.red}`),
)
</script>

<template>
  <h1 class="title stats-title">{{ t('statsTitle') }}</h1>

  <StatGrid :stats="totals" />
  <StatGrid :stats="record" />

  <UiPanel :title="t('matchHistoryTitle')">
    <MatchHistoryList :matches="matchday.matches" :team-name="app.teamName" />
  </UiPanel>

  <TallyPanel :heading="t('topScorersTitle')" :items="scorerItems" />
  <TallyPanel :heading="t('cardsSummaryTitle')" :items="cardItems" />

  <UiPanel :title="t('totalMinutesTitle')">
    <PlayingTimeTable :rows="summary.minutes" :minutes-heading="t('tableMinutes')" />
  </UiPanel>

  <UiButton @click="app.playAnotherMatch()">{{ t('playAnotherBtn') }}</UiButton>
</template>

<style scoped>
.stats-title {
  margin-bottom: 20px;
}
</style>

