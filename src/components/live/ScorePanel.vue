<script setup>
import { computed, ref } from 'vue'
import ScoreBoard from '@/components/live/ScoreBoard.vue'
import PlayerPicker from '@/components/live/PlayerPicker.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import UiRemoveButton from '@/components/ui/UiRemoveButton.vue'
import { TEAM_US } from '@/domain/scoring.js'
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
</script>

<template>
  <UiPanel>
    <div class="section-title">
      <h3>{{ t('goalsTitle') }}</h3>
    </div>

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
      <UiButton variant="secondary" @click="match.beginOurGoal()">⚽ {{ app.teamName }}</UiButton>
      <UiButton variant="secondary" @click="match.addOpponentGoal()">
        ⚽ {{ setup.opponentName }}
      </UiButton>
    </div>

    <div v-for="goal in match.goals" :key="goal.id" class="goal-row">
      <span class="goal-time clock-face">{{ formatTime(goal.atSecond) }}</span>
      <span class="goal-team">{{ goal.team === TEAM_US ? app.teamName : setup.opponentName }}</span>
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
      <span v-else class="scorer-spacer" />
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
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
}

.goal-row:last-child {
  border-bottom: none;
}

.goal-time {
  width: 42px;
  flex-shrink: 0;
  color: var(--chalk-dim);
  font-size: 14px;
}

.goal-team {
  width: 70px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--chalk-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.scorer-spacer {
  flex: 1;
}
</style>
