<script setup>
import UiCheckLine from '@/components/ui/UiCheckLine.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import UiTextField from '@/components/ui/UiTextField.vue'
import { toPositiveInt } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useSetupStore } from '@/stores/setup.js'

const setup = useSetupStore()
const { t } = useI18n()
</script>

<template>
  <UiPanel :title="t('sectionMatch')">
    <!-- One question, asked once: how long, and in how many pieces. -->
    <div class="field-group length">
      <UiTextField
        id="period-length"
        type="number"
        min="1"
        :label="setup.twoHalves ? t('halfLengthLabel') : t('gameLengthLabel')"
        :model-value="setup.periodLength"
        @update:model-value="setup.setPeriodLength(toPositiveInt($event, setup.periodLength))"
      />
      <UiCheckLine
        class="halves"
        tight
        :model-value="setup.twoHalves"
        @update:model-value="setup.setTwoHalves($event)"
      >
        {{ t('twoHalvesLabel') }}
      </UiCheckLine>
    </div>
    <p v-if="setup.twoHalves" class="count-note halves-note">
      {{ t('totalLengthNote', setup.totalMinutes) }}
    </p>

    <div class="row field-group">
      <UiTextField
        id="field-size"
        type="number"
        min="1"
        :label="t('fieldSizeLabel')"
        :model-value="setup.fieldSize"
        @update:model-value="setup.setFieldSize(toPositiveInt($event, setup.fieldSize))"
      />
    </div>
  </UiPanel>
</template>

<style scoped>
/* The length and how it is split belong together, so they share a row. */
.length {
  display: flex;
  align-items: flex-end;
  gap: 14px;
}

.length :deep(.field-wrap),
.length :deep(.field-group) {
  flex: 1;
  min-width: 0;
}

.halves {
  flex: 1;
  min-width: 0;
  /* Sits on the input's line, not on its label's. */
  padding-bottom: 13px;
}

.halves-note {
  margin-top: -4px;
}
</style>
