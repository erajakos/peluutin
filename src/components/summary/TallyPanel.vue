<script setup>
import UiPanel from '@/components/ui/UiPanel.vue'

defineProps({
  heading: { type: String, required: true },
  /** Pre-formatted strings, e.g. "Aino ×3" — joined into one quiet line. */
  items: { type: Array, required: true },
})
</script>

<template>
  <UiPanel v-if="items.length">
    <span class="field-label heading">{{ heading }}</span>
    <p class="count-note">{{ items.join(', ') }}</p>
  </UiPanel>
</template>

<style scoped>
.heading {
  margin-bottom: 6px;
}
</style>
