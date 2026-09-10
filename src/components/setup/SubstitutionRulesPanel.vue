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
  <UiPanel>
    <span class="field-label section-label">{{ t('subsSectionLabel') }}</span>

    <UiCheckLine v-model="setup.allowReentry">{{ t('allowReentryLabel') }}</UiCheckLine>

    <template v-if="setup.canLimitSubs">
      <UiCheckLine v-model="setup.subLimitEnabled">{{ t('subLimitLabel') }}</UiCheckLine>
      <div v-if="setup.subLimitEnabled" class="field-group limit">
        <UiTextField
          id="sub-limit"
          type="number"
          min="1"
          :label="t('subLimitMaxLabel')"
          :model-value="setup.subLimit"
          @update:model-value="setup.subLimit = toPositiveInt($event, setup.subLimit)"
        />
      </div>
    </template>
    <p v-else class="count-note">{{ t('subLimitHintSmall') }}</p>
  </UiPanel>
</template>

<style scoped>
.section-label {
  margin-bottom: 10px;
}

.limit {
  margin-top: 6px;
  margin-bottom: 0;
}
</style>
