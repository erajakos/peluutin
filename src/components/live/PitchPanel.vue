<script setup>
import CardActions from '@/components/live/CardActions.vue'
import ChangeBar from '@/components/live/ChangeBar.vue'
import PitchBoard from '@/components/live/PitchBoard.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

import { useSetupStore } from '@/stores/setup.js'

const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()
</script>

<template>
  <!--
    No empty state: the live screen is only reached with a complete lineup.
    (An empty-state paragraph here once paired its v-else with the card
    buttons instead of the pitch, and showed "no one on the field" whenever
    no player was selected.)
  -->
  <UiPanel :title="t('onFieldTitle')">
    <!--
      Asked right above the players, because they are the answer: the coach
      taps the one who scored. The way out is here too, for the goal nobody
      saw and for the tap that was a mistake.
    -->
    <div v-if="match.pendingGoal" class="asking">
      <span class="asking-text">{{ t('whoScoredLabel') }}</span>
      <button type="button" class="asking-btn" @click="match.confirmOurGoal(null)">
        {{ t('unknownScorerOption') }}
      </button>
      <button type="button" class="asking-btn" @click="match.cancelOurGoal()">
        {{ t('cancelBtn') }}
      </button>
    </div>

    <PitchBoard />
    <CardActions v-if="setup.trackCards && match.cardCandidateId !== null" />
    <ChangeBar />
  </UiPanel>
</template>

<style scoped>
/*
 * Solid green with dark words, like the shirts below it: on a bright day a
 * tinted panel is a rumour, and this is a question that has to be answered.
 */
.asking {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 10px;
  margin-bottom: 10px;
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--go);
  border: 1.5px solid #08281a;
  font-size: 16px;
  font-weight: 700;
  color: #08281a;
}

.asking-text {
  flex: 1;
  min-width: 0;
}

.asking-btn {
  background: none;
  color: rgba(8, 40, 26, 0.8);
  font-size: 14.5px;
  font-weight: 700;
  padding: 4px 6px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
