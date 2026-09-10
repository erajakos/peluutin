<script setup>
import { computed, ref } from 'vue'
import ScoreBoard from '@/components/live/ScoreBoard.vue'
import PlayerPicker from '@/components/live/PlayerPicker.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import BallIcon from '@/components/ui/BallIcon.vue'
import UiRemoveButton from '@/components/ui/UiRemoveButton.vue'
import { TEAM_US, runningScores } from '@/domain/scoring.js'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()

/** Id of the already-logged goal whose scorer is being corrected, if any. */
const editingGoalId = ref(null)

const editingGoal = computed(() => match.goals.find((goal) => goal.id === editingGoalId.value))

function logGoal(playerId) {
  match.confirmOurGoal(playerId)
}

function reattribute(playerId) {
  match.setGoalScorer(editingGoalId.value, playerId)
  editingGoalId.value = null
}

function startEditing(goal) {
  match.cancelOurGoal()
  editingGoalId.value = goal.id
}

function scorerLabel(goal) {
  if (goal.team !== TEAM_US) return ''
  return goal.playerId ? match.playerName(goal.playerId) : t('unknownScorerOption')
}

/** Goals newest-last, each carrying the scoreline it produced. */
const timeline = computed(() => {
  const scores = runningScores(match.goals)
  return match.goals.map((goal, index) => ({ goal, score: scores[index] }))
})
</script>

<template>
  <UiPanel :title="t('goalsTitle')">
    <ScoreBoard
      :us-name="app.teamName"
      :opponent-name="setup.opponentName"
      :us-score="match.usScore"
      :opponent-score="match.opponentScore"
    />

    <!-- Our goals pause for a scorer; the opponent's are a single tap. -->
    <PlayerPicker
      v-if="match.pendingGoal"
      :players="setup.roster"
      :prompt="t('whoScoredLabel')"
      allow-unknown
      @pick="logGoal"
      @cancel="match.cancelOurGoal()"
    />
    <PlayerPicker
      v-else-if="editingGoal"
      :players="setup.roster"
      :prompt="t('changeScorerLabel')"
      :selected-id="editingGoal.playerId"
      allow-unknown
      @pick="reattribute"
      @cancel="editingGoalId = null"
    />
    <div v-else class="action-pair goal-buttons">
      <UiButton variant="secondary" @click="match.beginOurGoal()">
        <BallIcon /> {{ app.teamName }}
      </UiButton>
      <UiButton variant="secondary" @click="match.addOpponentGoal()">
        <BallIcon /> {{ setup.opponentName }}
      </UiButton>
    </div>

    <div v-for="{ goal, score } in timeline" :key="goal.id" class="goal-row">
      <BallIcon />
      <span class="goal-time clock-face">{{ formatTime(goal.atSecond) }}</span>
      <!-- The scoreline this goal produced, not the final one. -->
      <span class="goal-score clock-face">{{ score.us }}–{{ score.opponent }}</span>
      <button
        v-if="goal.team === TEAM_US"
        type="button"
        class="scorer"
        :class="{ 'scorer--unknown': !goal.playerId }"
        :aria-label="t('changeScorerLabel')"
        @click="startEditing(goal)"
      >
        {{ scorerLabel(goal) }}
      </button>
      <span v-else class="scorer scorer--opponent">{{ setup.opponentName }}</span>
      <UiRemoveButton :label="t('removeAria')" @click="match.removeGoal(goal.id)" />
    </div>
    <p v-if="!match.goals.length" class="count-note">{{ t('noGoalsNote') }}</p>
  </UiPanel>
</template>

<style scoped>
.goal-buttons {
  margin-bottom: 10px;
}

.goal-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
  font-size: 15.5px;
}

.goal-row:last-child {
  border-bottom: none;
}

.goal-time {
  width: 44px;
  flex-shrink: 0;
  color: var(--chalk-dim);
  font-size: 15px;
}

.goal-score {
  flex-shrink: 0;
  min-width: 48px;
  font-size: 18px;
  color: var(--chalk);
  letter-spacing: 0.5px;
}

.scorer {
  flex: 1;
  min-width: 0;
  text-align: left;
  background: none;
  color: var(--chalk);
  font: inherit;
  font-weight: 600;
  padding: 4px 0;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-underline-offset: 4px;
}

.scorer--unknown {
  color: var(--chalk-dim);
  font-weight: 400;
  font-style: italic;
}

.scorer--opponent {
  color: var(--chalk-dim);
  font-weight: 500;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
