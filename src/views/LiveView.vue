<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import DragHintDialog from '@/components/live/DragHintDialog.vue'
import MatchClock from '@/components/live/MatchClock.vue'
import MatchEventsSheet from '@/components/live/MatchEventsSheet.vue'
import PitchPanel from '@/components/live/PitchPanel.vue'
import ScoreBoard from '@/components/live/ScoreBoard.vue'
import BallIcon from '@/components/ui/BallIcon.vue'
import { useFadingOffer } from '@/composables/useFadingOffer.js'
import { TEAM_US } from '@/domain/scoring.js'
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
 * The two goal buttons sit side by side, so the wrong team is the likeliest
 * slip on this screen. The goal just logged can be taken back for a few
 * seconds, named so it is clear which goal that is.
 */
const goalUndoOffered = useFadingOffer(() => match.lastGoalId)
const lastGoalLabel = computed(() => {
  const goal = match.goals.find((candidate) => candidate.id === match.lastGoalId)
  if (!goal) return ''
  if (goal.team !== TEAM_US) return setup.opponentName
  return goal.playerId ? match.playerName(goal.playerId) : app.teamName
})

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

  <!--
    Goals are logged here, on the match screen, because a goal is scored while
    the coach is watching the pitch — sending them to another screen for it is
    the surest way to have a substitution missed. The scoreline itself still
    opens the full list of events, where a goal can be corrected.
  -->
  <div class="header">
    <button
      type="button"
      class="events"
      :aria-label="t('openEventsAria')"
      @click="eventsOpen = true"
    >
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

    <div class="goals">
      <button
        type="button"
        class="goal"
        :aria-label="t('goalForAria', app.teamName)"
        @click="match.beginOurGoal()"
      >
        <BallIcon :size="16" /> {{ app.teamName }}
      </button>
      <button
        type="button"
        class="goal goal--theirs"
        :aria-label="t('goalForAria', setup.opponentName)"
        @click="match.addOpponentGoal()"
      >
        <BallIcon :size="16" /> {{ setup.opponentName }}
      </button>
    </div>

    <button
      v-if="goalUndoOffered && lastGoalLabel"
      type="button"
      class="goal-undo"
      @click="match.undoGoal()"
    >
      {{ t('undoGoalBtn', lastGoalLabel) }}
    </button>
  </div>

  <PitchPanel class="pitch-panel" />

  <MatchEventsSheet v-if="eventsOpen" @close="eventsOpen = false" />

  <DragHintDialog v-if="hintOpen" @close="closeHint" />
</template>

<style scoped>
.header {
  width: 100%;
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 13px 12px 12px;
  color: var(--chalk);
  margin-bottom: 12px;
}

.events {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  background: none;
  color: inherit;
  padding: 0;
  transition: background 0.12s ease;
}

/* One tap each, where the eyes already are when the ball goes in. */
.goals {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

.goal {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  flex: 1;
  min-height: 44px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.22);
  border: 1.5px solid var(--line-strong);
  color: var(--chalk);
  font-size: 15px;
  font-weight: 700;
}

.goal:active {
  transform: translateY(1px);
}

.goal--theirs {
  color: var(--against);
}

/* Quiet, and gone again on its own: the same way back a substitution has. */
.goal-undo {
  display: block;
  margin: 10px auto 0;
  padding: 4px 10px;
  background: none;
  color: var(--chalk-dim);
  font-size: 14.5px;
  font-weight: 500;
  text-decoration: underline;
  text-underline-offset: 3px;
  animation: goal-undo-in 0.25s ease-out;
}

@keyframes goal-undo-in {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .goal-undo {
    animation: none;
  }
}

.events:active {
  background: #1a5436;
}

.events :deep(.board) {
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
