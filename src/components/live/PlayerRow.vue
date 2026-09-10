<script setup>
import UiBadge from '@/components/ui/UiBadge.vue'
import { formatTime } from '@/domain/time.js'

defineProps({
  /** Position label; blank for bench players, who hold no position. */
  position: { type: String, default: '' },
  isGoalkeeper: { type: Boolean, default: false },
  name: { type: String, required: true },
  seconds: { type: Number, required: true },
  /** Secondary line, e.g. how long this player has been sitting out. */
  meta: { type: String, default: '' },
  selected: { type: Boolean, default: false },
  selectable: { type: Boolean, default: true },
  badge: { type: String, default: '' },
  badgeTone: { type: String, default: 'on' },
})
defineEmits(['toggle'])
</script>

<template>
  <label class="player-row" :class="{ 'player-row--locked': !selectable }">
    <span v-if="position" class="position" :class="{ 'position--gk': isGoalkeeper }">
      {{ position }}
    </span>
    <span class="detail">
      <span class="name">
        {{ name }}
        <UiBadge v-if="badge" :tone="badgeTone">{{ badge }}</UiBadge>
      </span>
      <span v-if="meta" class="meta">{{ meta }}</span>
    </span>
    <span class="time clock-face">{{ formatTime(seconds) }}</span>
    <input
      type="checkbox"
      class="check"
      :checked="selected"
      :disabled="!selectable"
      :aria-label="name"
      @change="$emit('toggle')"
    />
  </label>
</template>

<style scoped>
.player-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
}

.player-row:last-child {
  border-bottom: none;
}

.player-row--locked {
  cursor: default;
}

.position {
  width: 78px;
  flex-shrink: 0;
  font-size: 12px;
  color: var(--chalk-dim);
}

.position--gk {
  color: var(--amber);
}

.detail {
  flex: 1;
  min-width: 0;
}

.name {
  display: block;
  font-size: 15px;
  font-weight: 600;
}

/* How long this player has been in their current situation. */
.meta {
  display: block;
  font-size: 12px;
  color: var(--chalk-dim);
  margin-top: 1px;
}

.time {
  font-size: 16px;
  color: var(--chalk);
  min-width: 48px;
  text-align: right;
}

.check {
  width: 20px;
  height: 20px;
  accent-color: var(--amber);
  flex-shrink: 0;
}

.check:disabled {
  opacity: 0.25;
}
</style>
