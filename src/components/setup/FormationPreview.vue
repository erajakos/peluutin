<script setup>
import { computed } from 'vue'
import PitchMarkings from '@/components/ui/PitchMarkings.vue'
import { GOALKEEPER_KEY } from '@/domain/lineup.js'
import { pitchLayout } from '@/domain/pitch.js'

const props = defineProps({
  /** `{ key, label }` pairs, in the order the coach listed them. */
  positions: { type: Array, required: true },
  hasGoalkeeper: { type: Boolean, default: true },
})

/**
 * The shape as it will actually stand, drawn from the same layout the live
 * pitch uses — so what the coach picks here is what they get at kickoff.
 */
const spots = computed(() => {
  const slots = []
  if (props.hasGoalkeeper) slots.push({ id: 0, key: GOALKEEPER_KEY, label: '' })
  props.positions.forEach((position, index) => {
    slots.push({ id: index + 1, key: position.key, label: position.label })
  })

  return pitchLayout(slots).map((spot, index) => ({
    ...spot,
    isGoalkeeper: slots[index].key === GOALKEEPER_KEY,
    initials: initialsOf(slots[index].label),
  }))
})

/** Up to two letters, enough to tell a left back from a right back at this size. */
function initialsOf(label) {
  const words = label.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return ''
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[words.length - 1][0]).toUpperCase()
}
</script>

<template>
  <div class="preview">
    <PitchMarkings />
    <span
      v-for="spot in spots"
      :key="spot.slotId"
      class="spot"
      :class="{ 'spot--gk': spot.isGoalkeeper }"
      :style="{ left: `${spot.x}%`, top: `${spot.y}%` }"
    >
      {{ spot.isGoalkeeper ? 'MV' : spot.initials }}
    </span>
  </div>
</template>

<style scoped>
.preview {
  position: relative;
  width: 100%;
  max-width: 230px;
  margin: 0 auto 4px;
  aspect-ratio: 100 / 112;
  border-radius: 10px;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.025) 0 8%,
      rgba(0, 0, 0, 0.025) 8% 16%
    ),
    linear-gradient(to bottom, #17512f 0%, #123f26 100%);
  overflow: hidden;
}

.spot {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 31px;
  height: 31px;
  border-radius: 50%;
  background: var(--chalk);
  color: #0e2d1f;
  font-family: var(--font-display);
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 0.3px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.35);
}

.spot--gk {
  background: var(--amber);
  color: var(--amber-ink);
}
</style>
