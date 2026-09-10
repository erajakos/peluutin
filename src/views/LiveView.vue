<script setup>
import { computed, ref } from 'vue'
import BenchPanel from '@/components/live/BenchPanel.vue'
import CardsPanel from '@/components/live/CardsPanel.vue'
import MatchClock from '@/components/live/MatchClock.vue'
import PitchPanel from '@/components/live/PitchPanel.vue'
import ScorePanel from '@/components/live/ScorePanel.vue'
import SubstitutionBar from '@/components/live/SubstitutionBar.vue'
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

const fixture = computed(() => `${app.teamName} vs ${setup.opponentName}`)
</script>

<template>
  <header class="header">
    <div class="fixture">{{ fixture }}</div>
    <button type="button" class="score-strip" @click="tab = TABS.EVENTS">
      <span class="score clock-face">{{ match.usScore }}</span>
      <span class="dash">–</span>
      <span class="score clock-face">{{ match.opponentScore }}</span>
    </button>
  </header>

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
    <SubstitutionBar />
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
    <UiButton v-else variant="text" :block="false" @click="match.requestEnd()">
      {{ t('endMatchLink') }}
    </UiButton>
  </div>
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.fixture {
  font-size: 13px;
  color: var(--chalk-dim);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-strip {
  display: flex;
  align-items: baseline;
  gap: 6px;
  flex-shrink: 0;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 4px 14px;
  color: var(--chalk);
}

.score {
  font-size: 20px;
}

.dash {
  color: var(--chalk-dim);
}

.tabs {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.24);
  border-radius: 999px;
  padding: 4px;
  margin: 16px 0;
}

.tabs button {
  flex: 1;
  padding: 10px 8px;
  border-radius: 999px;
  background: none;
  color: var(--chalk-dim);
  font-size: 13px;
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

.end {
  text-align: center;
  margin-top: 22px;
}

.confirm {
  font-size: 13px;
  color: var(--chalk-dim);
  margin: 0 0 8px;
}
</style>
