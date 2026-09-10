<script setup>
import { computed } from 'vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import UiSelectField from '@/components/ui/UiSelectField.vue'
import { useI18n } from '@/i18n/index.js'
import { useSetupStore } from '@/stores/setup.js'

const setup = useSetupStore()
const { t, tFormationLabel } = useI18n()

const options = computed(() =>
  setup.formations.map((formation) => ({
    value: formation.id,
    label: tFormationLabel(formation.label),
  })),
)

/** With a single stock shape there is nothing to choose — just say what it is. */
const hasChoice = computed(() => setup.formations.length > 1)
</script>

<template>
  <UiPanel>
    <div class="field-group">
      <span class="field-label">{{ t('formationLabel') }}</span>
      <UiSelectField
        v-if="hasChoice"
        :model-value="setup.formationId"
        :options="options"
        @update:model-value="setup.applyFormation($event)"
      />
      <p v-else class="count-note">
        {{ t('formationSingleNote', options[0].label, setup.outfieldCount) }}
      </p>
    </div>

    <div class="field-group last">
      <span class="field-label">{{ t('positionsLabel', setup.outfieldCount) }}</span>
      <div v-for="(position, index) in setup.positions" :key="index" class="position-row">
        <span class="position-number">{{ index + 1 }}</span>
        <input
          class="field"
          :value="position.label"
          :aria-label="`${t('positionFallback')} ${index + 1}`"
          @input="setup.renamePosition(index, $event.target.value)"
        />
      </div>
    </div>
  </UiPanel>
</template>

<style scoped>
.last {
  margin-bottom: 0;
}

.position-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.position-number {
  width: 22px;
  color: var(--chalk-dim);
  font-size: 13px;
  text-align: right;
}
</style>
