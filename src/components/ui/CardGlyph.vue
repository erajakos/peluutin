<script setup>
import { CARD_RED } from '@/domain/scoring.js'

defineProps({
  type: { type: String, required: true },
  size: { type: [Number, String], default: 16 },
})
</script>

<template>
  <!-- A referee's card, drawn: emoji squares render differently on every phone. -->
  <svg
    class="card-glyph"
    :class="type === CARD_RED ? 'card-glyph--red' : 'card-glyph--yellow'"
    :width="size"
    :height="Number(size) * 1.3"
    viewBox="0 0 16 21"
    aria-hidden="true"
    focusable="false"
  >
    <rect x="1.5" y="1" width="13" height="19" rx="2.2" transform="rotate(-6 8 10.5)" />
  </svg>
</template>

<style scoped>
.card-glyph {
  flex-shrink: 0;
  vertical-align: middle;
}

.card-glyph rect {
  stroke: rgba(0, 0, 0, 0.35);
  stroke-width: 1;
}

.card-glyph--yellow rect {
  fill: #f0d43a;
}

.card-glyph--red rect {
  fill: #e25a3f;
}
</style>
