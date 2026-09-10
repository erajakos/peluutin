<script setup>
import PitchMap from '@/components/live/PitchMap.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()
</script>

<template>
  <UiPanel>
    <p class="hint">{{ t('onFieldHint') }}</p>

    <PitchMap v-if="match.filledSlots.length" />
    <p v-else class="count-note">{{ t('noOneOnField') }}</p>
  </UiPanel>
</template>

<style scoped>
.hint {
  text-align: center;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--chalk-dim);
  margin: 0 0 12px;
}
</style>
