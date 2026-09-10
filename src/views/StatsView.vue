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
import { useSeasonStore } from '@/stores/season.js'

const app = useAppStore()
const season = useSeasonStore()
const { t } = useI18n()

const summary = computed(() => season.summary)

const stats = computed(() => [
  { value: summary.value.played, label: t('matchesPlayedLabel', summary.value.played) },
  {
    value: t('recordLabel', summary.value.wins, summary.value.draws, summary.value.losses),
    label: '',
  },
  {
    value: `${summary.value.goalsFor}–${summary.value.goalsAgainst}`,
    label: t('goalsForAgainstLabel', summary.value.goalsFor, summary.value.goalsAgainst),
  },
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
  <div class="eyebrow">{{ t('statsEyebrow') }}</div>
  <h1 class="title">{{ t('statsTitle') }}</h1>

  <StatGrid :stats="stats" />

  <UiPanel>
    <span class="field-label heading">{{ t('matchHistoryTitle') }}</span>
    <MatchHistoryList :matches="season.matches" :team-name="app.teamName" />
  </UiPanel>

  <TallyPanel :heading="t('topScorersTitle')" :items="scorerItems" />
  <TallyPanel :heading="t('cardsSummaryTitle')" :items="cardItems" />

  <UiPanel>
    <PlayingTimeTable :rows="summary.minutes" :minutes-heading="t('totalMinutesTitle')" />
  </UiPanel>

  <UiButton @click="app.playAnotherMatch()">{{ t('playAnotherBtn') }}</UiButton>
</template>

<style scoped>
.heading {
  margin-bottom: 6px;
}
</style>
