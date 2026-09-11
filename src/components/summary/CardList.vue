<script setup>
import CardGlyph from '@/components/ui/CardGlyph.vue'
import { formatTime } from '@/domain/time.js'

defineProps({
  cards: { type: Array, required: true },
  /** Resolves a player id to a name; ids may belong to players long since off. */
  resolveName: { type: Function, required: true },
})
</script>

<template>
  <!-- In match order, like the goals: when it came, what colour, and to whom. -->
  <div v-for="card in cards" :key="card.id" class="card-row">
    <CardGlyph :type="card.type" :size="15" />
    <span class="time clock-face">{{ formatTime(card.atSecond) }}</span>
    <span class="name">{{ resolveName(card.playerId) }}</span>
  </div>
</template>

<style scoped>
.card-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
  font-size: 15.5px;
}

.card-row:last-child {
  border-bottom: none;
}

.time {
  width: 46px;
  flex-shrink: 0;
  font-size: 15px;
  color: var(--chalk-dim);
}

.name {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
