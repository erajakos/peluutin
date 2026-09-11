<script setup>
import { computed } from 'vue'
import ScoreBoard from '@/components/live/ScoreBoard.vue'
import CardList from '@/components/summary/CardList.vue'
import GoalList from '@/components/summary/GoalList.vue'
import PlayingTimeTable from '@/components/summary/PlayingTimeTable.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { averageSeconds, playingTimeRows, rotatingPlayers } from '@/domain/playingTime.js'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()

const rows = computed(() => playingTimeRows(match.players, match.goalkeeperId))

/** The outfield average every player's +/- is measured against. */
const average = computed(() => {
  const rotating = rotatingPlayers(match.players, match.goalkeeperId)
  return rotating.length > 1 ? averageSeconds(rotating) : null
})
</script>

<template>
  <UiPanel :title="t('finalScoreTitle')">
    <ScoreBoard
      :us-name="app.teamName"
      :opponent-name="setup.opponentName"
      :us-score="match.usScore"
      :opponent-score="match.opponentScore"
    />
  </UiPanel>

  <!-- Goal by goal: when it went in, what it made the score, and who got it. -->
  <UiPanel v-if="match.goals.length" :title="t('scorersTitle')">
    <GoalList
      :goals="match.goals"
      :opponent-name="setup.opponentName"
      :resolve-name="(id) => match.playerName(id)"
    />
  </UiPanel>

  <UiPanel v-if="setup.trackCards && match.cards.length" :title="t('cardsSummaryTitle')">
    <CardList :cards="match.cards" :resolve-name="(id) => match.playerName(id)" />
  </UiPanel>

  <UiPanel :title="t('sectionPlayingTime')">
    <PlayingTimeTable
      :rows="rows"
      :minutes-heading="t('tableMinutes')"
      :captain-id="match.captainId"
      show-delta
    />
    <!-- A +/- figure means nothing until you know what it is measured against. -->
    <p v-if="average !== null" class="explain">
      {{ t('deltaExplained', formatTime(average)) }}
    </p>
  </UiPanel>

  <!-- Stacked, next match first: side by side both labels wrapped on a phone. -->
  <div class="next-steps">
    <UiButton @click="app.playAnotherMatch()">{{ t('playAnotherBtn') }}</UiButton>
    <UiButton variant="secondary" @click="app.finishSession()">
      {{ t('finishSessionBtn') }}
    </UiButton>
  </div>
</template>

<style scoped>
.explain {
  font-size: 14.5px;
  line-height: 1.5;
  color: var(--chalk-dim);
  margin: 10px 0 0;
}

.next-steps {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 4px;
}
</style>
