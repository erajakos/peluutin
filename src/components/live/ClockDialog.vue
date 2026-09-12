<script setup>
import UiButton from '@/components/ui/UiButton.vue'
import UiDialog from '@/components/ui/UiDialog.vue'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const emit = defineEmits(['close'])
const match = useMatchStore()
const { t } = useI18n()

/** Whole minutes only: this is a correction, not a stopwatch. */
const ADJUSTMENT = 60
</script>

<template>
  <!--
    The clock comes with it, still running, because the number is the thing
    being corrected — nobody should have to shut this to see what they did.
  -->
  <UiDialog :label="t('adjustClockTitle')" @dismiss="emit('close')">
    <p class="title">{{ t('adjustClockTitle') }}</p>

    <div class="readout">
      <span class="elapsed clock-face">{{ formatTime(match.elapsedSeconds) }}</span>
      <span class="total">{{ t('ofLabel', formatTime(match.totalSeconds)) }}</span>
    </div>

    <div class="nudges">
      <button type="button" class="nudge" @click="match.adjustClock(-ADJUSTMENT)">−1 min</button>
      <button type="button" class="nudge" @click="match.adjustClock(ADJUSTMENT)">+1 min</button>
    </div>

    <UiButton @click="emit('close')">{{ t('doneBtn') }}</UiButton>
  </UiDialog>
</template>

<style scoped>
.title {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  text-align: center;
  color: var(--amber-text);
  margin: 0 0 14px;
}

.readout {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 10px;
  margin-bottom: 18px;
}

.elapsed {
  font-size: 44px;
  line-height: 1;
  color: var(--chalk);
}

.total {
  font-size: 16px;
  color: var(--chalk-dim);
}

.nudges {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.nudge {
  flex: 1;
  min-height: 58px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.22);
  border: 1.5px solid var(--line-strong);
  color: var(--chalk);
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.nudge:active {
  transform: translateY(1px);
}
</style>
