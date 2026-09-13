<script setup>
import { computed } from 'vue'
import LineupSlotRow from '@/components/lineup/LineupSlotRow.vue'
import UiBackLink from '@/components/ui/UiBackLink.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import UiSelectField from '@/components/ui/UiSelectField.vue'
import { onFieldPlayerIds } from '@/domain/lineup.js'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()

/** The captain comes from the players starting, not the whole squad. */
const captainOptions = computed(() => {
  const starting = onFieldPlayerIds(match.slots)
  return setup.roster
    .filter((player) => starting.has(player.id))
    .map((player) => ({ value: player.id, label: player.name }))
})

const benchPreview = computed(() => {
  const placed = onFieldPlayerIds(match.slots)
  const names = setup.roster.filter((player) => !placed.has(player.id)).map((p) => p.name)
  return names.length ? names.join(', ') : t('benchPreviewEmpty')
})
</script>

<template>
  <UiBackLink @click="app.backToSquad()">{{ t('backBtn') }}</UiBackLink>
  <h1 class="title lineup-title">{{ t('lineupTitle') }}</h1>

  <!-- Chance fills the gaps; anyone already placed by hand stays put. Once
       every position is filled there is nothing left to draw, so it goes. -->
  <UiButton
    v-if="match.canDrawLineup"
    variant="secondary"
    class="draw"
    @click="match.drawLineup(setup.roster)"
  >
    {{ t('drawLineupBtn') }}
  </UiButton>

  <UiPanel>
    <LineupSlotRow
      v-for="slot in match.slots"
      :key="slot.id"
      :lineup-slot="slot"
      :slots="match.slots"
      :roster="setup.roster"
      :captain-id="match.captainId"
      @assign="match.assignSlot(slot.id, $event)"
    />
  </UiPanel>

  <!-- Optional: most junior matches do not name one. -->
  <UiPanel v-if="captainOptions.length">
    <UiSelectField
      id="captain"
      :label="t('captainLabel')"
      :model-value="match.captainId"
      :options="captainOptions"
      :placeholder="t('noCaptainOption')"
      @update:model-value="match.setCaptain($event ? Number($event) : null)"
    />
  </UiPanel>

  <UiPanel>
    <span class="field-label">{{ t('benchPreviewLabel') }}</span>
    <p class="bench-preview">{{ benchPreview }}</p>
  </UiPanel>

  <UiButton :disabled="!match.lineupComplete" @click="app.kickOff()">
    {{ t('kickoffBtn') }}
  </UiButton>
</template>

<style scoped>
.lineup-title {
  text-align: center;
  margin-bottom: 18px;
}

.draw {
  margin-bottom: 14px;
}

.bench-preview {
  font-size: 16px;
  color: var(--chalk-dim);
  line-height: 1.6;
  margin: 0;
}
</style>
