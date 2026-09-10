<script setup>
import { computed } from 'vue'
import ScoreBoard from '@/components/live/ScoreBoard.vue'
import PlayingTimeTable from '@/components/summary/PlayingTimeTable.vue'
import TallyPanel from '@/components/summary/TallyPanel.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { playingTimeRows, playingTimeSpread } from '@/domain/playingTime.js'
import { cardTally, scorerTally } from '@/domain/scoring.js'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()

const fixture = computed(() => `${app.teamName} vs ${setup.opponentName}`)

const rows = computed(() => playingTimeRows(match.players, match.goalkeeperId))

const spread = computed(() => playingTimeSpread(match.players, match.goalkeeperId))

const scorerItems = computed(() => {
  const { entries, unknown } = scorerTally(match.goals, (id) => match.playerName(id))
  const items = entries.map((entry) => `${entry.name} ×${entry.count}`)
  if (unknown) items.push(`${t('unknownScorerOption')} ×${unknown}`)
  return items
})

const cardItems = computed(() => {
  if (!setup.trackCards) return []
  return cardTally(match.cards, (id) => match.playerName(id)).map(
    (entry) => `${entry.name} 🟨×${entry.yellow} 🟥×${entry.red}`,
  )
})
</script>

<template>
  <div class="eyebrow">{{ t('fullTimeEyebrow') }}</div>
  <h1 class="title">{{ t('summaryTitle', fixture) }}</h1>

  <UiPanel>
    <ScoreBoard
      :us-name="app.teamName"
      :opponent-name="setup.opponentName"
      :us-score="match.usScore"
      :opponent-score="match.opponentScore"
    />
  </UiPanel>

  <TallyPanel :heading="t('scorersTitle')" :items="scorerItems" />
  <TallyPanel :heading="t('cardsSummaryTitle')" :items="cardItems" />

  <UiPanel>
    <PlayingTimeTable :rows="rows" :minutes-heading="t('tableMinutes')" show-delta />
  </UiPanel>

  <!-- The one number that answers "was that fair?" -->
  <p v-if="spread !== null" class="spread">{{ t('spreadNote', formatTime(spread)) }}</p>

  <div class="btn-row">
    <UiButton variant="secondary" @click="app.finishSession()">
      {{ t('finishSessionBtn') }}
    </UiButton>
    <UiButton @click="app.playAnotherMatch()">{{ t('playAnotherBtn') }}</UiButton>
  </div>
</template>

<style scoped>
.spread {
  font-size: 14px;
  color: var(--chalk-dim);
  margin: 14px 0 20px;
  line-height: 1.5;
}
</style>
