<script setup>
import { ref } from 'vue'
import BenchPanel from '@/components/live/BenchPanel.vue'
import CardsPanel from '@/components/live/CardsPanel.vue'
import MatchClock from '@/components/live/MatchClock.vue'
import ScoreBoard from '@/components/live/ScoreBoard.vue'
import PitchPanel from '@/components/live/PitchPanel.vue'
import ScorePanel from '@/components/live/ScorePanel.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()

/**
 * Two tabs, because a coach mid-match is doing one of two things: managing who
 * is on the pitch, or logging what just happened. Rotation is the job this app
 * exists for, so it opens there; the score stays visible in the header either
 * way and is one tap from anywhere.
 */
const TABS = { SQUAD: 'squad', EVENTS: 'events' }
const tab = ref(TABS.SQUAD)

</script>

<template>
  <!-- The scoreline doubles as the way into logging goals and cards. -->
  <button type="button" class="header" @click="tab = TABS.EVENTS">
    <ScoreBoard
      size="compact"
      :us-name="app.teamName"
      :opponent-name="setup.opponentName"
      :us-score="match.usScore"
      :opponent-score="match.opponentScore"
    />
  </button>

  <MatchClock />

  <nav class="tabs" role="tablist">
    <button
      type="button"
      role="tab"
      :aria-selected="tab === TABS.SQUAD"
      :class="{ 'tab--active': tab === TABS.SQUAD }"
      @click="tab = TABS.SQUAD"
    >
      {{ t('tabSquad') }}
    </button>
    <button
      type="button"
      role="tab"
      :aria-selected="tab === TABS.EVENTS"
      :class="{ 'tab--active': tab === TABS.EVENTS }"
      @click="tab = TABS.EVENTS"
    >
      {{ t('tabEvents') }}
    </button>
  </nav>

  <template v-if="tab === TABS.SQUAD">
    <PitchPanel />
    <BenchPanel />
  </template>

  <template v-else>
    <ScorePanel />
    <CardsPanel v-if="setup.trackCards" />
  </template>

  <!-- Ending is irreversible, so it asks once. -->
  <div class="end">
    <template v-if="match.confirmingEnd">
      <p class="confirm">{{ t('endConfirmText') }}</p>
      <div class="action-pair">
        <UiButton variant="secondary" @click="match.cancelEnd()">{{ t('cancelBtn') }}</UiButton>
        <UiButton @click="app.endMatch()">{{ t('yesEndBtn') }}</UiButton>
      </div>
    </template>
    <UiButton v-else variant="secondary" class="end-btn" @click="match.requestEnd()">
      {{ t('endMatchLink') }}
    </UiButton>
  </div>
</template>

<style scoped>
.header {
  display: block;
  width: 100%;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 13px 18px 15px;
  color: var(--chalk);
}

.header:active {
  transform: translateY(1px);
}

.tabs {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.24);
  border-radius: 999px;
  padding: 4px;
  margin: 14px 0 16px;
}

.tabs button {
  flex: 1;
  padding: 11px 8px;
  border-radius: 999px;
  background: none;
  color: var(--chalk-dim);
  font-size: 15px;
  font-weight: 600;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.tabs .tab--active {
  background: var(--panel);
  color: var(--chalk);
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.25);
}

/* Deliberately far from the substitution bar: ending a match cannot be undone,
   and a thumb reaching for "confirm" must not find this instead. */
.end {
  text-align: center;
  margin-top: 68px;
}

.end-btn {
  color: var(--alert);
  border-color: rgba(233, 105, 79, 0.4);
}

.confirm {
  font-size: 15px;
  color: var(--chalk-dim);
  margin: 0 0 8px;
}
</style>
