<script setup>
import { computed } from 'vue'
import MatchHistoryList from '@/components/stats/MatchHistoryList.vue'
import StatGrid from '@/components/stats/StatGrid.vue'
import PlayingTimeTable from '@/components/summary/PlayingTimeTable.vue'
import TallyPanel from '@/components/summary/TallyPanel.vue'
import CardMarks from '@/components/ui/CardMarks.vue'
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

// "1V 0T 0H" needs decoding; three labelled, colour-coded numbers do not.
const record = computed(() => [
  { value: summary.value.wins, label: t('winsLabel'), result: 'win' },
  { value: summary.value.draws, label: t('drawsLabel'), result: 'draw' },
  { value: summary.value.losses, label: t('lossesLabel'), result: 'loss' },
])

const scorerItems = computed(() => {
  const { entries, unknown } = summary.value.scorers
  const items = entries.map((entry) => `${entry.name} ×${entry.count}`)
  if (unknown) items.push(`${t('unknownScorerOption')} ×${unknown}`)
  return items
})
</script>

<template>
  <h1 class="title stats-title">{{ t('statsTitle') }}</h1>

  <StatGrid :stats="totals" />
  <StatGrid :stats="record" />

  <UiPanel :title="t('matchHistoryTitle')">
    <MatchHistoryList :matches="matchday.matches" :team-name="app.teamName" />
  </UiPanel>

  <TallyPanel :heading="t('topScorersTitle')" :items="scorerItems" />
  <UiPanel v-if="summary.cards.length" :title="t('cardsSummaryTitle')">
    <div v-for="entry in summary.cards" :key="entry.id" class="booked">
      <span class="booked-name">{{ entry.name }}</span>
      <CardMarks :counts="entry" :size="15" />
    </div>
  </UiPanel>

  <UiPanel :title="t('totalMinutesTitle')">
    <PlayingTimeTable :rows="summary.minutes" :minutes-heading="t('tableMinutes')" />
  </UiPanel>

  <UiButton @click="app.playAnotherMatch()">{{ t('playAnotherBtn') }}</UiButton>
  <UiButton variant="secondary" class="menu-btn" @click="app.backToMenu()">
    {{ t('backToMenuBtn') }}
  </UiButton>
</template>

<style scoped>
.menu-btn {
  margin-top: 10px;
}

.stats-title {
  margin-bottom: 20px;
}

.booked {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
  font-size: 15.5px;
}

.booked:last-child {
  border-bottom: none;
}

.booked-name {
  font-weight: 600;
}
</style>
