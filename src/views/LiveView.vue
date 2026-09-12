<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import DragHintDialog from '@/components/live/DragHintDialog.vue'
import MatchClock from '@/components/live/MatchClock.vue'
import MatchEventsSheet from '@/components/live/MatchEventsSheet.vue'
import PitchPanel from '@/components/live/PitchPanel.vue'
import ScoreBoard from '@/components/live/ScoreBoard.vue'
import { useI18n } from '@/i18n/index.js'
import { hasSeenDragHint, markDragHintSeen } from '@/services/storage.js'
import { createScreenWakeLock } from '@/services/wakeLock.js'
import { useAppStore } from '@/stores/app.js'
import { useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const match = useMatchStore()
const setup = useSetupStore()

/**
 * The screen stays on for as long as this screen is open — half time included,
 * since the clock is the thing the coach keeps glancing at. It sleeps again at
 * full time, when the summary takes over.
 */
const screen = createScreenWakeLock()
onMounted(() => screen.keepAwake())
onBeforeUnmount(() => screen.destroy())
const { t } = useI18n()

/**
 * The pitch is the screen. Score and events open over it from the scoreline,
 * which is the thing a coach reaches for when a goal goes in anyway.
 */
const eventsOpen = ref(false)

/**
 * Dragging is not a thing anyone would think to try on a drawing of a pitch,
 * so the first match this device ever plays says so. Once only: after that it
 * is something the coach knows, and a dialog before every match is an obstacle.
 */
const hintOpen = ref(!hasSeenDragHint())

function closeHint() {
  hintOpen.value = false
  markDragHintSeen()
}
</script>

<template>
  <MatchClock />

  <!-- The scoreline is the way into logging goals and cards; the chevron says so. -->
  <button type="button" class="header" :aria-label="t('openEventsAria')" @click="eventsOpen = true">
    <!-- Balances the chevron, so the score stays centred on the card. -->
    <span class="chevron-balance" aria-hidden="true" />
    <ScoreBoard
      size="compact"
      :us-name="app.teamName"
      :opponent-name="setup.opponentName"
      :us-score="match.usScore"
      :opponent-score="match.opponentScore"
    />
    <span class="chevron" aria-hidden="true">
      <svg viewBox="0 0 24 24"><path d="m9.5 5.5 7 6.5-7 6.5" /></svg>
    </span>
  </button>

  <PitchPanel class="pitch-panel" />

  <MatchEventsSheet v-if="eventsOpen" @close="eventsOpen = false" />

  <DragHintDialog v-if="hintOpen" @close="closeHint" />
</template>

<style scoped>
.header {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 13px 12px 15px;
  color: var(--chalk);
  transition: background 0.12s ease;
}

.header:active {
  transform: translateY(1px);
  background: #1a5436;
}

.header :deep(.board) {
  flex: 1;
  min-width: 0;
}

.chevron-balance {
  flex-shrink: 0;
  width: 26px;
}

.pitch-panel {
  margin-top: 16px;
}

/* The affordance: a card that opens something looks like a row you can follow. */
.chevron {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  color: var(--chalk-dim);
}

.chevron svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
