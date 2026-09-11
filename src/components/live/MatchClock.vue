<script setup>
import { computed, ref } from 'vue'
import UiConfirmDialog from '@/components/ui/UiConfirmDialog.vue'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { PERIOD, useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()

const halfLabel = computed(() => {
  if (match.atHalfTime) return t('halfTimeLabel')
  return match.period === PERIOD.SECOND ? t('secondHalfLabel') : t('firstHalfLabel')
})

/**
 * The clock is waiting on the coach — before kickoff, and at half time. Both
 * get the same lit card and the same pulsing, labelled button, because both
 * are the moment where forgetting to press means minutes go uncounted.
 */
const waiting = computed(() => match.notStarted || match.atHalfTime)
const waitingLabel = computed(() =>
  match.atHalfTime ? t('startSecondHalfBtn') : t('startClockBtn'),
)

function onWaitingPress() {
  if (match.atHalfTime) match.startSecondHalf()
  else match.start()
}

/**
 * The round button is an icon, so its label lives in `aria-label` — and says
 * what the tap will do, not what the clock is doing. It only exists once the
 * match is under way; before that the labelled kickoff button stands in.
 */
const runLabel = computed(() => (match.running ? t('pauseBtn') : t('resumeBtn')))

/**
 * Stop means "end this period". In the first of two halves that is half time;
 * otherwise it is the end of the match. The icon is the same because the
 * gesture is the same — the confirmation is what spells out which it is.
 */
const stopEndsMatch = computed(() => !setup.twoHalves || match.period === PERIOD.SECOND)
const stopLabel = computed(() => (stopEndsMatch.value ? t('endMatchLink') : t('halfTimeBtn')))

/**
 * Playing past the planned time for this period — the first half, or the
 * match. Shown as colour rather than a sentence: the clock turns warm and the
 * stop button rings, which says "time's up" without anything to read.
 */
const overtime = computed(
  () => match.firstHalfPlanReached || (stopEndsMatch.value && match.isFullTime),
)

/**
 * Every stop asks first, in words: the icon is shared, so the question is what
 * tells the coach whether they are calling half time or ending the match.
 */
const CONFIRM = Object.freeze({ HALF: 'half', MATCH: 'match' })
const confirming = ref(null)

const confirmText = computed(() =>
  confirming.value === CONFIRM.MATCH ? t('endConfirmText') : t('endHalfConfirmText'),
)

function onStop() {
  confirming.value = stopEndsMatch.value ? CONFIRM.MATCH : CONFIRM.HALF
}

function onConfirm() {
  if (confirming.value === CONFIRM.MATCH) app.endMatch()
  else match.endFirstHalf()
  confirming.value = null
}

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
  <div
    class="clock-card"
    :class="{ 'clock-card--waiting': waiting, 'clock-card--over': overtime && !waiting }"
  >
    <div class="clock" :class="{ 'clock--running': match.running }">
      <div class="readout">
        <span class="elapsed clock-face">{{ formatTime(match.elapsedSeconds) }}</span>
        <span class="total">{{ t('ofLabel', formatTime(match.totalSeconds)) }}</span>
      </div>

      <!-- Play/pause and stop: the transport controls everyone already knows. -->
      <div v-if="!waiting" class="transport">
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
        <button
          type="button"
          class="stop"
          :class="{ 'stop--final': stopEndsMatch, 'stop--due': overtime }"
          :aria-label="stopLabel"
          :title="stopLabel"
          @click="onStop"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <rect x="5.5" y="5.5" width="13" height="13" rx="2" />
          </svg>
        </button>
      </div>
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

    <!--
      Before kickoff and at half time the clock is the one thing that must not
      be forgotten, so the button says so in words and keeps pulsing until it is
      pressed. It gets a row of its own, full width, so the time above never has
      to squeeze beside it; once running, the round transport takes its place.
    -->
    <button v-if="waiting" type="button" class="kickoff" @click="onWaitingPress">
      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2 19 12 8 18.8Z" /></svg>
      {{ waitingLabel }}
    </button>
  </div>

  <UiConfirmDialog
    v-if="confirming"
    :message="confirmText"
    :confirm-label="t('yesBtn')"
    :cancel-label="t('cancelBtn')"
    :tone="confirming === CONFIRM.MATCH ? 'danger' : 'primary'"
    @confirm="onConfirm"
    @cancel="confirming = null"
  />
</template>

<style scoped>
.clock-card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 10px 12px 12px 16px;
  margin-bottom: 12px;
}

.clock {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 10px;
}

.readout {
  display: flex;
  align-items: baseline;
  gap: 10px;
  min-width: 0;
}

.elapsed {
  font-size: 36px;
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

/* Past the planned time: the digits and the bar turn warm. */
.clock-card--over {
  border-color: rgba(233, 105, 79, 0.55);
}

.clock-card--over .elapsed {
  color: var(--against);
}

.clock-card--over .progress-fill {
  background: var(--alert);
}

/* Waiting for kickoff: the card itself is lit so the eye goes there first. */
.clock-card--waiting {
  border-color: var(--amber);
  box-shadow: 0 0 0 1px rgba(232, 163, 61, 0.35);
}

.kickoff {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 52px;
  margin-top: 12px;
  padding: 0 20px;
  border-radius: 999px;
  background: var(--amber);
  color: var(--amber-ink);
  font-size: 16.5px;
  font-weight: 700;
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.28);
  animation: kickoff-pulse 1.8s ease-out infinite;
}

.kickoff svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.kickoff:active {
  transform: translateY(1px);
}

@keyframes kickoff-pulse {
  0% {
    box-shadow:
      0 3px 0 rgba(0, 0, 0, 0.28),
      0 0 0 0 rgba(232, 163, 61, 0.65);
  }
  70% {
    box-shadow:
      0 3px 0 rgba(0, 0, 0, 0.28),
      0 0 0 14px rgba(232, 163, 61, 0);
  }
  100% {
    box-shadow:
      0 3px 0 rgba(0, 0, 0, 0.28),
      0 0 0 0 rgba(232, 163, 61, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .kickoff {
    animation: none;
  }
}

.run {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--amber);
  color: var(--amber-ink);
  box-shadow: 0 3px 0 rgba(0, 0, 0, 0.28);
  transition: transform 0.1s ease;
}

.run svg {
  width: 23px;
  height: 23px;
  fill: currentColor;
  /* The play triangle looks off-centre in a circle unless nudged. */
  margin-left: 2px;
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

.transport {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/*
 * Filled, where pause beside it is outlined: the two must never be confused at
 * arm's length. The square is the universal "stop" — larger than before, since
 * the old one read as a dot.
 */
.stop {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: var(--chalk);
  border: 2px solid var(--chalk);
  color: #10301e;
  transition: transform 0.1s ease;
}

.stop svg {
  width: 22px;
  height: 22px;
  fill: currentColor;
}

.stop:active {
  transform: translateY(1px) scale(0.97);
}

/* Ending the match rather than the half: red, as the one that is final. */
.stop--final {
  background: #c94a33;
  border-color: #c94a33;
  color: var(--chalk);
}

/* The planned time is up: a pulsing ring says the stop is due now. */
.stop--due {
  animation: stop-due 1.8s ease-out infinite;
}

@keyframes stop-due {
  0% {
    box-shadow: 0 0 0 0 rgba(233, 105, 79, 0.7);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(233, 105, 79, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(233, 105, 79, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stop--due {
    animation: none;
    box-shadow: 0 0 0 3px rgba(233, 105, 79, 0.45);
  }
}
</style>
