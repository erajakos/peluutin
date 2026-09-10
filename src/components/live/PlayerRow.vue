<script setup>
import UiBadge from '@/components/ui/UiBadge.vue'
import { formatTime } from '@/domain/time.js'

defineProps({
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
  <label
    class="player-row"
    :class="{ 'player-row--locked': !selectable, 'player-row--selected': selected }"
  >
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
  padding: 11px 12px;
  margin: 0 -12px;
  border-radius: 10px;
  border-bottom: 1px solid var(--line);
  cursor: pointer;
  transition: background 0.12s ease;
}

.player-row:last-child {
  border-bottom: none;
}

/*
 * A checkbox alone is easy to miss with a phone at arm's length, so a picked
 * player is also lit up whole — the same amber that marks a selected shirt on
 * the pitch, so both lists read the same way.
 */
.player-row--selected {
  background: rgba(232, 163, 61, 0.17);
  box-shadow: inset 0 0 0 1.5px rgba(232, 163, 61, 0.5);
  border-bottom-color: transparent;
}

.player-row--selected .name {
  color: var(--chalk);
}

.player-row--selected .meta {
  color: rgba(245, 251, 242, 0.85);
}

.player-row--locked {
  cursor: default;
}

.detail {
  flex: 1;
  min-width: 0;
}

.name {
  display: block;
  font-size: 16.5px;
  font-weight: 600;
}

/* How long this player has been waiting to come back on. */
.meta {
  display: block;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.35;
  color: var(--chalk-dim);
  margin-top: 2px;
}


.time {
  font-size: 18px;
  color: var(--chalk);
  min-width: 48px;
  text-align: right;
}

.check {
  width: 24px;
  height: 24px;
  accent-color: var(--amber);
  flex-shrink: 0;
}

.check:disabled {
  opacity: 0.25;
}
</style>
