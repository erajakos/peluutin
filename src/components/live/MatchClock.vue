<script setup>
import { computed } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()

const halfLabel = computed(() => {
  if (match.atHalfTime) return t('halfTimeLabel')
  return match.currentHalf === 1 ? t('firstHalfLabel') : t('secondHalfLabel')
})

/** Start / Resume / Pause — the label tells the coach what the tap will do. */
const runLabel = computed(() => {
  if (match.running) return t('pauseBtn')
  return match.elapsedSeconds > 0 ? t('resumeBtn') : t('startBtn')
})

/** Capped at 100%: injury time overruns the plan, it does not overrun the bar. */
const progress = computed(() =>
  Math.min(100, (match.elapsedSeconds / Math.max(1, match.totalSeconds)) * 100),
)
</script>

<template>
  <div class="clock" :class="{ 'clock--running': match.running }">
    <div class="readout">
      <span class="elapsed clock-face">{{ formatTime(match.elapsedSeconds) }}</span>
      <span class="total">{{ t('ofLabel', formatTime(match.totalSeconds)) }}</span>
    </div>

    <div
      class="progress"
      role="progressbar"
      :aria-label="t('matchProgressAria')"
      :aria-valuenow="Math.round(progress)"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="progress-fill" :style="{ width: `${progress}%` }" />
      <!-- Where the halves meet, so the coach can see half time coming. -->
      <div v-if="setup.twoHalves" class="progress-half" />
    </div>

    <div v-if="setup.twoHalves" class="half">{{ halfLabel }}</div>
    <p v-if="match.isFullTime" class="full-time">{{ t('fullTimeBanner') }}</p>

    <div class="controls">
      <UiButton @click="match.toggleRun()">{{ runLabel }}</UiButton>
      <UiButton
        v-if="setup.twoHalves && match.currentHalf === 1"
        variant="secondary"
        @click="match.startSecondHalf()"
      >
        {{ t('startSecondHalfBtn') }}
      </UiButton>
    </div>
  </div>
</template>

<style scoped>
.clock {
  text-align: center;
  padding: 14px 0 8px;
}

.readout {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
}

.elapsed {
  font-size: 58px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.total {
  font-size: 14px;
  color: var(--chalk-dim);
}

/* A quiet pulse while time is running, so a paused clock is obvious. */
.clock--running .elapsed {
  animation: tick 2s ease-in-out infinite;
}

@keyframes tick {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.82;
  }
}

@media (prefers-reduced-motion: reduce) {
  .clock--running .elapsed {
    animation: none;
  }
}

.progress {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.28);
  margin: 14px 0 0;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--go), var(--amber));
  transition: width 0.9s linear;
}

.progress-half {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  width: 2px;
  background: var(--bg);
}

.half {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--amber);
  margin-top: 8px;
}

.full-time {
  color: var(--amber);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.4px;
  margin: 8px 0 0;
}

.controls {
  display: flex;
  gap: 10px;
  margin-top: 14px;
}

.controls > * {
  flex: 1;
}
</style>
