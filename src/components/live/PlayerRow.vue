<script setup>
import CardMarks from '@/components/ui/CardMarks.vue'
import UiBadge from '@/components/ui/UiBadge.vue'
import { formatTime } from '@/domain/time.js'

defineProps({
  name: { type: String, required: true },
  /** The column that matters during play: how long this spell has lasted. */
  seconds: { type: Number, required: true },
  /** The quieter column beside it: the player's total for the match. */
  totalSeconds: { type: Number, default: null },
  selected: { type: Boolean, default: false },
  selectable: { type: Boolean, default: true },
  badge: { type: String, default: '' },
  badgeTone: { type: String, default: 'on' },
  /** `{ yellow, red }` cards shown to this player, if any. */
  cards: { type: Object, default: null },
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
        <CardMarks :counts="cards" :size="13" class="cards" />
        <UiBadge v-if="badge" :tone="badgeTone">{{ badge }}</UiBadge>
      </span>
    </span>
    <!--
      Two columns, under the headings the list carries once at the top: no
      number has to explain itself on every row, and each player fits on one.
    -->
    <span class="time clock-face">{{ formatTime(seconds) }}</span>
    <span v-if="totalSeconds !== null" class="time-total clock-face">
      {{ formatTime(totalSeconds) }}
    </span>
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
/*
 * The grid is the bench list's, handed down as a custom property so the
 * headings above and every row below line up without either knowing the other.
 */
.player-row {
  display: grid;
  grid-template-columns: var(--bench-grid, minmax(0, 1fr) auto auto 24px);
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

.player-row--selected .time-total {
  color: rgba(245, 251, 242, 0.85);
}

.player-row--locked {
  cursor: default;
}

.detail {
  min-width: 0;
}

.cards {
  margin-left: 6px;
  vertical-align: -1px;
}

.name {
  display: block;
  font-size: 16.5px;
  font-weight: 600;
}

.time {
  font-size: 18px;
  color: var(--chalk);
  text-align: right;
}

.time-total {
  font-size: 16px;
  color: var(--chalk-dim);
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
