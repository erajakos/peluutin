<script setup>
import UiPanel from '@/components/ui/UiPanel.vue'

defineProps({
  heading: { type: String, required: true },
  /** Pre-formatted strings, e.g. "Aino ×3" — joined into one quiet line. */
  items: { type: Array, required: true },
})
</script>

<template>
  <UiPanel v-if="items.length" :title="heading">
    <p class="items">{{ items.join(', ') }}</p>
  </UiPanel>
</template>

<style scoped>
.items {
  font-size: 16px;
  line-height: 1.6;
  color: var(--chalk-dim);
  margin: 0;
}
</style>
