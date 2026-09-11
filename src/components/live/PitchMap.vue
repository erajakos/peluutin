<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import CardMarks from '@/components/ui/CardMarks.vue'
import PitchMarkings from '@/components/ui/PitchMarkings.vue'
import { pitchLayout } from '@/domain/pitch.js'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()

/** Movement past this many pixels is a drag; anything less is a tap. */
const DRAG_THRESHOLD = 8
/** How near another shirt a drop has to land to count as aimed at it. */
const DROP_RADIUS = 60

/**
 * How close a chip's centre may come to the top or bottom edge: half a chip,
 * plus room for the selection ring. The layout is in percentages, and on a
 * narrow phone the keeper's spot by the goal line would otherwise put the
 * bottom of their chip past the edge of the pitch, where it is cut off.
 */
const CHIP_EDGE_PX = 28

/** The chip's vertical centre in pixels, kept clear of the pitch edges. */
function chipCentreY(chip, height) {
  return Math.min(Math.max((chip.y / 100) * height, CHIP_EDGE_PX), height - CHIP_EDGE_PX)
}
/** How long a player who has just changed place stays highlighted. */
const MOVED_HIGHLIGHT_MS = 1200

const pitch = ref(null)
const draggedSlotId = ref(null)
const dropTargetId = ref(null)
const dragDelta = ref({ x: 0, y: 0 })

// Gesture bookkeeping: not reactive, because nothing renders from it.
let activePointerId = null
let originSlotId = null
let startX = 0
let startY = 0
let dragging = false
let suppressClick = false

/**
 * One chip per filled slot, positioned by the formation. Tapping a chip picks
 * a player for a substitution; dragging one onto another swaps their positions,
 * which is how a coach actually thinks about moving someone up front.
 */
/**
 * Players who have just taken up a new position, however it happened — a drag,
 * the swap button, a substitution. Watching who stands in each slot catches all
 * of them in one place instead of every action announcing itself.
 */
const recentlyMoved = ref(new Set())
let movedTimer = null

watch(
  () => match.slots.map((slot) => slot.playerId),
  (now, before) => {
    if (!before || now.length !== before.length) return
    const moved = new Set(
      now.filter((playerId, index) => playerId !== null && playerId !== before[index]),
    )
    if (!moved.size) return
    recentlyMoved.value = moved
    clearTimeout(movedTimer)
    movedTimer = setTimeout(() => {
      recentlyMoved.value = new Set()
    }, MOVED_HIGHLIGHT_MS)
  },
)

onBeforeUnmount(() => clearTimeout(movedTimer))

const chips = computed(() => {
  const spots = pitchLayout(match.slots)
  return match.slots.map((slot, index) => {
    const player = slot.playerId === null ? null : match.playersById.get(slot.playerId)
    const fixedGk = slot.isGoalkeeper && match.rules.fixedGoalkeeper
    return {
      // Keyed by player, not by position: when two players trade places their
      // chips travel across the pitch to each other's spot, instead of two
      // names silently changing in place.
      key: player ? `player-${player.id}` : `vacant-${slot.id}`,
      playerId: player?.id ?? null,
      slotId: slot.id,
      position: slot.label,
      name: player?.name ?? '',
      // Left empty by a sending-off: drawn anyway, so being a player short is
      // something the coach can see rather than count.
      vacant: player === null,
      seconds: player?.seconds ?? 0,
      stintSeconds: player?.stintSeconds ?? 0,
      isGoalkeeper: slot.isGoalkeeper,
      dueOff: match.hints.dueOffSlotIds.has(slot.id),
      selected: match.selectedOffSlotIds.has(slot.id),
      moved: player !== null && recentlyMoved.value.has(player.id),
      cards: player ? (match.cardCountsById.get(player.id) ?? null) : null,
      // A fixed goalkeeper is out of the rotation: not selectable, not movable.
      selectable: !fixedGk,
      x: spots[index]?.x ?? 50,
      y: spots[index]?.y ?? 50,
    }
  })
})

/**
 * Chips are rendered in an order a swap cannot change. They are absolutely
 * positioned, so DOM order means nothing visually — but if it followed the
 * slots, a swap would make Vue move one chip's element, and a moved element
 * loses its transition: one player would slide while the other jumped.
 */
const renderedChips = computed(() => [...chips.value].sort((a, b) => a.key.localeCompare(b.key)))

function chipTitle(chip) {
  if (chip.vacant) return `${chip.position} — ${t('vacantLabel')}`
  const spell = t('playingFor', formatTime(chip.stintSeconds))
  const due = chip.dueOff ? ` · ${t('dueOffBadge')}` : ''
  return `${chip.position} — ${chip.name} · ${spell}${due}`
}

function chipStyle(chip) {
  const base = {
    left: `${chip.x}%`,
    top: `clamp(${CHIP_EDGE_PX}px, ${chip.y}%, calc(100% - ${CHIP_EDGE_PX}px))`,
  }
  if (draggedSlotId.value !== chip.slotId) return base
  const { x, y } = dragDelta.value
  return {
    ...base,
    transform: `translate(-50%, -50%) translate(${x}px, ${y}px) scale(1.08)`,
  }
}

/** The chip nearest the pointer, if the drop landed close enough to one. */
function findDropTarget(clientX, clientY) {
  const rect = pitch.value?.getBoundingClientRect()
  if (!rect) return null

  let best = null
  let bestDistance = DROP_RADIUS
  chips.value.forEach((chip) => {
    if (chip.slotId === originSlotId || !chip.selectable) return
    const centreX = rect.left + (chip.x / 100) * rect.width
    const centreY = rect.top + chipCentreY(chip, rect.height)
    const distance = Math.hypot(clientX - centreX, clientY - centreY)
    if (distance < bestDistance) {
      bestDistance = distance
      best = chip.slotId
    }
  })
  return best
}

function onPointerDown(event, chip) {
  if (!chip.selectable) return
  activePointerId = event.pointerId
  originSlotId = chip.slotId
  startX = event.clientX
  startY = event.clientY
  dragging = false

  // Capture so the gesture keeps reporting once the finger leaves the chip.
  // Not every environment allows it; the drag still works without it, so a
  // refusal must not abort the gesture.
  try {
    event.currentTarget.setPointerCapture(event.pointerId)
  } catch {
    // Ignore: pointer events still arrive, just not captured.
  }
}

function onPointerMove(event) {
  if (originSlotId === null || event.pointerId !== activePointerId) return

  const x = event.clientX - startX
  const y = event.clientY - startY
  if (!dragging && Math.hypot(x, y) < DRAG_THRESHOLD) return

  dragging = true
  draggedSlotId.value = originSlotId
  dragDelta.value = { x, y }
  dropTargetId.value = findDropTarget(event.clientX, event.clientY)
}

function onPointerUp(event) {
  if (originSlotId === null || event.pointerId !== activePointerId) return

  const from = originSlotId
  const target = dropTargetId.value
  const wasDragging = dragging
  endGesture()

  // A tap falls through to the click handler; a drag must not also select.
  if (!wasDragging) return
  suppressClick = true
  if (target !== null) match.swapSlotPlayers(from, target)
}

function onPointerCancel() {
  if (dragging) suppressClick = true
  endGesture()
}

function endGesture() {
  activePointerId = null
  originSlotId = null
  dragging = false
  draggedSlotId.value = null
  dropTargetId.value = null
  dragDelta.value = { x: 0, y: 0 }
}

/** Keeps keyboard activation working, while a completed drag stays silent. */
function onClick(chip) {
  if (suppressClick) {
    suppressClick = false
    return
  }
  match.toggleOffSlot(chip.slotId)
}
</script>

<template>
  <div ref="pitch" class="pitch">
    <PitchMarkings />

    <button
      v-for="chip in renderedChips"
      :key="chip.key"
      type="button"
      class="chip"
      :class="{
        'chip--gk': chip.isGoalkeeper,
        'chip--due': chip.dueOff && !chip.selected,
        'chip--selected': chip.selected,
        'chip--locked': !chip.selectable,
        'chip--dragging': draggedSlotId === chip.slotId,
        'chip--target': dropTargetId === chip.slotId,
        'chip--vacant': chip.vacant,
        'chip--moved': chip.moved,
      }"
      :style="chipStyle(chip)"
      :disabled="!chip.selectable"
      :aria-pressed="chip.selected"
      :title="chipTitle(chip)"
      @pointerdown="onPointerDown($event, chip)"
      @pointermove="onPointerMove"
      @pointerup="onPointerUp"
      @pointercancel="onPointerCancel"
      @click="onClick(chip)"
    >
      <template v-if="chip.vacant">
        <span class="chip-name">{{ chip.position }}</span>
        <span class="chip-time clock-face">—</span>
      </template>
      <template v-else>
        <span class="chip-name">{{ chip.name }}</span>
        <span class="chip-time clock-face">{{ formatTime(chip.seconds) }}</span>
      </template>

      <!-- Booked: the card sits on the shirt, so it is never forgotten mid-match. -->
      <CardMarks v-if="chip.cards" class="chip-cards" :counts="chip.cards" :size="11" />

      <!-- A tick as well as the fill: colour alone is easy to miss outdoors. -->
      <span v-if="chip.selected" class="chip-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7" /></svg>
      </span>

      <!-- Longest on the pitch: the rotation says this one comes off next. -->
      <span v-else-if="chip.dueOff" class="chip-mark chip-mark--due" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="M12 5v13m0 0-5.5-5.5M12 18l5.5-5.5" /></svg>
      </span>
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
  min-width: 70px;
  max-width: 96px;
  padding: 6px 8px;
  border-radius: 9px;
  border: 1.5px solid var(--line-strong);
  background: rgba(10, 38, 25, 0.9);
  color: var(--chalk);
  backdrop-filter: blur(2px);
  /* The browser must not claim the gesture for scrolling mid-drag. */
  touch-action: none;
  /*
   * Position and transform share one timing on purpose. When a dragged chip is
   * dropped, its offset shrinks to nothing while its anchor moves to the new
   * spot; moving in step, the two cancel out and the chip settles where the
   * finger let go instead of snapping back and sliding over again.
   */
  transition:
    left 0.34s cubic-bezier(0.2, 0.8, 0.25, 1),
    top 0.34s cubic-bezier(0.2, 0.8, 0.25, 1),
    transform 0.34s cubic-bezier(0.2, 0.8, 0.25, 1),
    background 0.12s ease,
    filter 0.1s ease;
}

/* Press feedback that does not fight the positional transition above. */
.chip:active:not(:disabled) {
  filter: brightness(1.2);
}

.chip-name {
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.15;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.chip-time {
  font-size: 15px;
  font-weight: 700;
  color: var(--chalk-dim);
  letter-spacing: 0.3px;
}

.chip-mark {
  position: absolute;
  top: -8px;
  right: -8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--amber-ink);
  border: 1.5px solid var(--amber);
}

.chip-mark svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: var(--amber);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chip-mark--due {
  background: var(--alert);
  border-color: #2b0d06;
}

.chip-mark--due svg {
  stroke: #2b0d06;
}

.chip-cards {
  position: absolute;
  top: -7px;
  left: -5px;
}

.chip--gk {
  border-color: rgba(232, 163, 61, 0.55);
}

.chip--gk .chip-time {
  color: var(--amber-text);
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

/* Nobody in this shirt: a red card was shown and nobody replaced them. */
.chip--vacant {
  background: rgba(0, 0, 0, 0.3);
  border-style: dashed;
  color: var(--chalk-dim);
}

.chip--vacant {
  max-width: 108px;
}

.chip--vacant .chip-name {
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.15;
  white-space: normal;
  text-align: center;
}

/* Just arrived in this position: a ring of green that spreads and fades. */
.chip--moved {
  border-color: var(--go);
  animation: chip-moved 1.1s ease-out;
}

@keyframes chip-moved {
  0% {
    box-shadow: 0 0 0 0 rgba(95, 190, 139, 0.8);
  }
  70% {
    box-shadow: 0 0 0 12px rgba(95, 190, 139, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(95, 190, 139, 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .chip {
    transition:
      background 0.12s ease,
      filter 0.1s ease;
  }

  .chip--moved {
    animation: none;
  }
}

/* Lifted out of the pitch and following the finger. */
.chip--dragging {
  z-index: 3;
  transition: none;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.45);
}

/* Where the drag would land. */
.chip--target {
  border-color: var(--go);
  box-shadow: 0 0 0 4px rgba(95, 190, 139, 0.28);
}
</style>
