<script setup>
import { computed } from 'vue'
import LineupSlotRow from '@/components/lineup/LineupSlotRow.vue'
import UiBackLink from '@/components/ui/UiBackLink.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { onFieldPlayerIds } from '@/domain/lineup.js'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()

const benchPreview = computed(() => {
  const placed = onFieldPlayerIds(match.slots)
  const names = setup.roster.filter((player) => !placed.has(player.id)).map((p) => p.name)
  return names.length ? names.join(', ') : t('benchPreviewEmpty')
})
</script>

<template>
  <UiBackLink @click="app.backToSquad()">{{ t('backBtn') }}</UiBackLink>
  <h1 class="title lineup-title">{{ t('lineupTitle') }}</h1>

  <UiPanel>
    <LineupSlotRow
      v-for="slot in match.slots"
      :key="slot.id"
      :lineup-slot="slot"
      :slots="match.slots"
      :roster="setup.roster"
      @assign="match.assignSlot(slot.id, $event)"
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
  margin-bottom: 18px;
}

.bench-preview {
  font-size: 16px;
  color: var(--chalk-dim);
  line-height: 1.6;
  margin: 0;
}
</style>
