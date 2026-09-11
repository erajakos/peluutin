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
    <div class="field-group">
      <UiCheckLine :model-value="setup.twoHalves" @update:model-value="setup.setTwoHalves($event)">
        {{ t('twoHalvesLabel') }}
      </UiCheckLine>
      <UiTextField
        id="period-length"
        type="number"
        min="1"
        :label="setup.twoHalves ? t('halfLengthLabel') : t('gameLengthLabel')"
        :model-value="setup.periodLength"
        @update:model-value="setup.setPeriodLength(toPositiveInt($event, setup.periodLength))"
      />
      <p v-if="setup.twoHalves" class="count-note">
        {{ t('totalLengthNote', setup.totalMinutes) }}
      </p>
    </div>

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

    <UiCheckLine
      :model-value="setup.hasGoalkeeper"
      @update:model-value="setup.setHasGoalkeeper($event)"
    >
      {{ t('hasGKLabel') }}
    </UiCheckLine>
    <UiCheckLine v-if="setup.hasGoalkeeper" v-model="setup.fixedGoalkeeper" tight>
      {{ t('fixedGKLabel') }}
    </UiCheckLine>
  </UiPanel>
</template>
