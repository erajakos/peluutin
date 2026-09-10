<script setup>
import { computed } from 'vue'
import PitchMarkings from '@/components/live/PitchMarkings.vue'
import { pitchLayout } from '@/domain/pitch.js'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()

/**
 * One chip per filled slot, positioned by the formation. Tapping a chip is the
 * fastest way to pick someone for a substitution — the coach is already looking
 * at the shape, so they should not have to find the same name again in a list.
 */
const chips = computed(() => {
  const filled = match.filledSlots
  const spots = pitchLayout(filled)
  return filled.map((slot, index) => {
    const player = match.playersById.get(slot.playerId)
    const fixedGk = slot.isGoalkeeper && match.rules.fixedGoalkeeper
    return {
      slotId: slot.id,
      position: slot.label,
      name: player?.name ?? '',
      seconds: player?.seconds ?? 0,
      stintSeconds: player?.stintSeconds ?? 0,
      isGoalkeeper: slot.isGoalkeeper,
      dueOff: match.hints.dueOffSlotIds.has(slot.id),
      selected: match.selectedOffSlotIds.has(slot.id),
      selectable: !fixedGk && !match.limitReached,
      x: spots[index]?.x ?? 50,
      y: spots[index]?.y ?? 50,
    }
  })
})
</script>

<template>
  <div class="pitch">
    <PitchMarkings />

    <button
      v-for="chip in chips"
      :key="chip.slotId"
      type="button"
      class="chip"
      :class="{
        'chip--gk': chip.isGoalkeeper,
        'chip--due': chip.dueOff && !chip.selected,
        'chip--selected': chip.selected,
        'chip--locked': !chip.selectable,
      }"
      :style="{ left: `${chip.x}%`, top: `${chip.y}%` }"
      :disabled="!chip.selectable"
      :aria-pressed="chip.selected"
      :title="`${chip.position} — ${chip.name} · ${t('playingFor', formatTime(chip.stintSeconds))}`"
      @click="match.toggleOffSlot(chip.slotId)"
    >
      <span class="chip-name">{{ chip.name }}</span>
      <span class="chip-time clock-face">{{ formatTime(chip.seconds) }}</span>
    </button>
  </div>
</template>

<style scoped>
.pitch {
  position: relative;
  aspect-ratio: 100 / 112;
  width: 100%;
  border-radius: var(--radius);
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.022) 0 8%,
      rgba(0, 0, 0, 0.022) 8% 16%
    ),
    linear-gradient(to bottom, #17512f 0%, #123f26 100%);
  overflow: hidden;
}

.chip {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  min-width: 62px;
  max-width: 84px;
  padding: 5px 7px;
  border-radius: 9px;
  border: 1.5px solid var(--line-strong);
  background: rgba(10, 38, 25, 0.9);
  color: var(--chalk);
  backdrop-filter: blur(2px);
  transition:
    transform 0.12s ease,
    background 0.12s ease;
}

.chip:active:not(:disabled) {
  transform: translate(-50%, -50%) scale(0.94);
}

.chip-name {
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1.15;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-time {
  font-size: 12px;
  color: var(--chalk-dim);
  letter-spacing: 0.3px;
}

.chip--gk {
  border-color: rgba(232, 163, 61, 0.55);
}

.chip--gk .chip-time {
  color: var(--amber);
}

/* Most minutes on the pitch — the player the rotation says to take off next. */
.chip--due {
  border-color: var(--alert);
  box-shadow: 0 0 0 3px rgba(233, 105, 79, 0.16);
}

.chip--selected {
  background: var(--amber);
  border-color: var(--amber);
  color: var(--amber-ink);
}

.chip--selected .chip-time {
  color: rgba(42, 27, 4, 0.75);
}

.chip--locked {
  opacity: 0.72;
  cursor: default;
}
</style>
