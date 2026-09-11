<script setup>
import CardGlyph from '@/components/ui/CardGlyph.vue'
import { CARD_RED, CARD_YELLOW } from '@/domain/scoring.js'

defineProps({
  /** `{ yellow, red }` for one player; null when they have none. */
  counts: { type: Object, default: null },
  size: { type: [Number, String], default: 12 },
})
</script>

<template>
  <!-- One small card per card shown: two yellows read as two, not as "×2". -->
  <span v-if="counts && (counts.yellow || counts.red)" class="marks">
    <CardGlyph v-for="n in counts.yellow" :key="`y${n}`" :type="CARD_YELLOW" :size="size" />
    <CardGlyph v-for="n in counts.red" :key="`r${n}`" :type="CARD_RED" :size="size" />
  </span>
</template>

<style scoped>
.marks {
  display: inline-flex;
  align-items: center;
  gap: 2px;
}
</style>
