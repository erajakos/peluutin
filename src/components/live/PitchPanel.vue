<script setup>
import { ref } from 'vue'
import CardActions from '@/components/live/CardActions.vue'
import PitchMap from '@/components/live/PitchMap.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

import { useSetupStore } from '@/stores/setup.js'

const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()

/**
 * Which time the shirts show. Both at once would put two unlabelled numbers on
 * a shirt read from ten metres away, so it is one or the other — and the switch
 * itself says which, rather than the coach having to remember.
 *
 * The current spell is the default: during play the question is who has been
 * running without a break, and the totals are what the summary is for.
 */
const timeMode = ref('stint')
const MODES = [
  { value: 'stint', label: 'stintTimeOption' },
  { value: 'total', label: 'totalTimeOption' },
]
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
      One line of text rather than a caption and two options: the dropdown
      names what the shirts are counting — "playing time: this spell" — and
      tapping it offers the other. Saying it in the option itself is what lets
      the label above it go.
    -->
    <div class="time-row">
      <select v-model="timeMode" class="time-select" :aria-label="t('timeShownAria')">
        <option v-for="mode in MODES" :key="mode.value" :value="mode.value">
          {{ t(mode.label) }}
        </option>
      </select>
    </div>

    <PitchMap :time-mode="timeMode" />
    <CardActions v-if="setup.trackCards && match.cardCandidateId !== null" />
  </UiPanel>
</template>

<style scoped>
.time-row {
  display: flex;
  justify-content: flex-end;
  margin: -6px 0 10px;
}

/* Quiet enough to ignore, with a chevron so it still reads as a control. */
.time-select {
  appearance: none;
  background: none;
  border: none;
  color: var(--chalk-dim);
  font-size: 13.5px;
  font-weight: 600;
  padding: 4px 20px 4px 4px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9'%3E%3Cpath d='M1 1.5 7 7.5 13 1.5' fill='none' stroke='%23cbe0d2' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 2px center;
  background-size: 11px 7px;
}

/* The list itself is the system's, and the system draws it on its own ground. */
.time-select option {
  color: #10301e;
}
</style>
