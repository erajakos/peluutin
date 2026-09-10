<script setup>
import { computed } from 'vue'
import FormationPreview from '@/components/setup/FormationPreview.vue'
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
  <UiPanel :title="t('formationLabel')">
    <FormationPreview :positions="setup.positions" :has-goalkeeper="setup.hasGoalkeeper" />
    <p class="shape-name">{{ options.find((o) => o.value === setup.formationId)?.label }}</p>

    <div v-if="hasChoice" class="field-group">
      <UiSelectField
        :model-value="setup.formationId"
        :options="options"
        @update:model-value="setup.applyFormation($event)"
      />
    </div>

    <details class="positions">
      <summary>{{ t('editPositionsLabel') }}</summary>
      <div v-for="(position, index) in setup.positions" :key="index" class="position-row">
        <span class="position-number">{{ index + 1 }}</span>
        <input
          class="field"
          :value="position.label"
          :aria-label="`${t('positionFallback')} ${index + 1}`"
          @input="setup.renamePosition(index, $event.target.value)"
        />
      </div>
    </details>
  </UiPanel>
</template>

<style scoped>
.shape-name {
  text-align: center;
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--amber);
  margin: 0 0 14px;
}

.positions {
  border-top: 1px solid var(--line);
  padding-top: 12px;
  margin-top: 4px;
}

.positions summary {
  font-size: 14px;
  font-weight: 500;
  color: var(--chalk-dim);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
}

.positions summary::-webkit-details-marker {
  display: none;
}

.positions summary::before {
  content: '▸';
  font-size: 11px;
  transition: transform 0.15s ease;
}

.positions[open] summary::before {
  transform: rotate(90deg);
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
