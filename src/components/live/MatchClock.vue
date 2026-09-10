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

/**
 * The button is an icon, so the label lives in `aria-label` — but it still has
 * to say what the tap will do, not what the clock is doing.
 */
const runLabel = computed(() => {
  if (match.running) return t('pauseBtn')
  return match.elapsedSeconds > 0 ? t('resumeBtn') : t('clockStartBtn')
})

/** Capped at 100%: injury time overruns the plan, it does not overrun the bar. */
const progress = computed(() =>
  Math.min(100, (match.elapsedSeconds / Math.max(1, match.totalSeconds)) * 100),
)
</script>

<template>
  <!--
    Clock and transport on one row: the two things a coach touches most, kept
    side by side so the pitch itself starts higher up the screen. The button
    stays a full thumb-sized target regardless.
  -->
  <div class="clock" :class="{ 'clock--running': match.running }">
    <div class="readout">
      <span class="elapsed clock-face">{{ formatTime(match.elapsedSeconds) }}</span>
      <span class="total">{{ t('ofLabel', formatTime(match.totalSeconds)) }}</span>
    </div>

    <button
      type="button"
      class="run"
      :class="{ 'run--playing': match.running }"
      :aria-label="runLabel"
      :title="runLabel"
      @click="match.toggleRun()"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect v-if="match.running" x="6.5" y="5" width="4" height="14" rx="1.2" />
        <rect v-if="match.running" x="13.5" y="5" width="4" height="14" rx="1.2" />
        <path v-else d="M8 5.2 19 12 8 18.8Z" />
      </svg>
    </button>
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

  <UiButton
    v-if="setup.twoHalves && match.currentHalf === 1"
    variant="secondary"
    class="second-half"
    @click="match.startSecondHalf()"
  >
    {{ t('startSecondHalfBtn') }}
  </UiButton>
</template>

<style scoped>
.clock {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 2px 10px;
}

.readout {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.elapsed {
  font-size: 38px;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.total {
  font-size: 15.5px;
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

.run {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: var(--amber);
  color: var(--amber-ink);
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.28);
  transition: transform 0.1s ease;
}

.run svg {
  width: 28px;
  height: 28px;
  fill: currentColor;
  /* The play triangle looks off-centre in a circle unless nudged. */
  margin-left: 3px;
}

.run--playing svg {
  margin-left: 0;
}

/* Running: quieter, because stopping the clock is the rarer intent. */
.run--playing {
  background: rgba(0, 0, 0, 0.22);
  border: 2px solid var(--line-strong);
  color: var(--chalk);
  box-shadow: none;
}

.run:active {
  transform: translateY(1px) scale(0.97);
}

.progress {
  position: relative;
  height: 6px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.28);
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
  text-align: center;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  color: var(--amber-text);
  margin-top: 10px;
}

.full-time {
  text-align: center;
  color: var(--amber-text);
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.4px;
  margin: 10px 0 0;
}

.second-half {
  margin-top: 14px;
}
</style>
