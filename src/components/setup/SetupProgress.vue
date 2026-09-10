<script setup>
import { useI18n } from '@/i18n/index.js'

const props = defineProps({
  step: { type: Number, required: true },
  total: { type: Number, default: 3 },
})
const { t } = useI18n()

const steps = Array.from({ length: props.total }, (_, index) => index + 1)
</script>

<template>
  <!-- Three bars, no labels: it says how far along you are without adding words. -->
  <div class="progress" role="group" :aria-label="t('stepAria', step, total)">
    <span
      v-for="index in steps"
      :key="index"
      class="bar"
      :class="{ 'bar--done': index < step, 'bar--now': index === step }"
    />
  </div>
</template>

<style scoped>
.progress {
  display: flex;
  gap: 6px;
  margin-bottom: 22px;
}

.bar {
  flex: 1;
  height: 5px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.3);
}

.bar--done {
  background: rgba(232, 163, 61, 0.45);
}

.bar--now {
  background: var(--amber);
}
</style>
