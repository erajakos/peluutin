<script setup>
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import CardMarks from '@/components/ui/CardMarks.vue'
import UiConfirmDialog from '@/components/ui/UiConfirmDialog.vue'
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
/** How long a player who has just changed place stays highlighted. */
const MOVED_HIGHLIGHT_MS = 1200

const pitch = ref(null)
const sideline = ref(null)
const board = ref(null)

/**
 * A confirmed change is watched, not just noticed: the players walk. Each chip
 * is drawn in its new home and then animated from where it stood a moment ago
 * — the substitute up from the touchline, the player they replace down onto
 * it — so the change the coach planned is the change they see happen.
 *
 * The chips are separate elements on the pitch and on the touchline, so this
 * measures before the swap and plays afterwards rather than moving anything.
 */
const TRAVEL_MS = 460
const previousRects = new Map()

function captureRects() {
  previousRects.clear()
  board.value?.querySelectorAll('[data-player-id]').forEach((element) => {
    previousRects.set(element.dataset.playerId, element.getBoundingClientRect())
  })
}

function playTravel() {
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches
  board.value?.querySelectorAll('[data-player-id]').forEach((element) => {
    const before = previousRects.get(element.dataset.playerId)
    if (!before) return
    const now = element.getBoundingClientRect()
    const dx = before.left - now.left
    const dy = before.top - now.top
    if (reduced || Math.hypot(dx, dy) < 2) return

    // Put the chip back where it was, then let it travel to where it belongs.
    const base = element.classList.contains('chip--bench') ? '' : 'translate(-50%, -50%) '
    element.style.transition = 'none'
    element.style.transform = `${base}translate(${dx}px, ${dy}px)`
    element.style.zIndex = '4'
    element.getBoundingClientRect()

    requestAnimationFrame(() => {
      element.style.transition = `transform ${TRAVEL_MS}ms cubic-bezier(0.2, 0.8, 0.25, 1)`
      element.style.transform = base
      setTimeout(() => {
        element.style.transition = ''
        element.style.transform = ''
        element.style.zIndex = ''
      }, TRAVEL_MS + 40)
    })
  })
  previousRects.clear()
}

// Measured before the swap lands in the DOM, played once it has.
watch(
  () => match.subsUsed,
  () => {
    captureRects()
    nextTick(playTravel)
  },
  { flush: 'pre' },
)

/**
 * Players who have just taken up a new position, however it happened — a drag,
 * a substitution. Watching who stands in each slot catches all of them in one
 * place instead of every action announcing itself.
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

const fieldChips = computed(() => {
  const spots = pitchLayout(match.slots)
  return match.slots.map((slot, index) => {
    const player = slot.playerId === null ? null : match.playersById.get(slot.playerId)
    const lockedGk = slot.isGoalkeeper && match.goalkeeperLocked
    return {
      // Keyed by player, not by position: when two players trade places their
      // chips travel across the pitch to each other's spot, instead of two
      // names silently changing in place.
      key: player ? `player-${player.id}` : `vacant-${slot.id}`,
      slotId: slot.id,
      playerId: player?.id ?? null,
      position: slot.label,
      name: player?.name ?? '',
      // Left empty by a sending-off: drawn anyway, so being a player short is
      // something the coach can see rather than count.
      vacant: player === null,
      seconds: player?.seconds ?? 0,
      stintSeconds: player?.stintSeconds ?? 0,
      isGoalkeeper: slot.isGoalkeeper,
      captain: player !== null && player.id === match.captainId,
      due: match.hints.dueOffSlotIds.has(slot.id),
      picked: match.pickedSlotId === slot.id,
      moved: player !== null && recentlyMoved.value.has(player.id),
      cards: player ? (match.cardCountsById.get(player.id) ?? null) : null,
      // A keeper meant to play the whole match is neither picked nor dragged
      // by accident — but a tap still asks, rather than doing nothing at all.
      selectable: !lockedGk,
      asksFirst: lockedGk,
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
const renderedFieldChips = computed(() =>
  [...fieldChips.value].sort((a, b) => a.key.localeCompare(b.key)),
)

const benchChips = computed(() =>
  match.bench.map((player) => {
    return {
      key: `bench-${player.id}`,
      playerId: player.id,
      name: player.name,
      seconds: player.seconds,
      stintSeconds: player.stintSeconds,
      sentOff: match.sentOff.has(player.id),
      selectable: match.canPlayerReturn(player.id),
      due: match.hints.dueOnPlayerIds.has(player.id),
      picked: match.pickedPlayerId === player.id,
      cards: match.cardCountsById.get(player.id) ?? null,
    }
  }),
)

function fieldTitle(chip) {
  if (chip.vacant) return `${chip.position} — ${t('vacantLabel')}`
  const spell = t('playingFor', formatTime(chip.stintSeconds))
  const total = t('totalFor', formatTime(chip.seconds))
  const due = chip.due ? ` · ${t('dueOffBadge')}` : ''
  return `${chip.position} — ${chip.name} · ${spell} · ${total}${due}`
}

function benchTitle(chip) {
  const rest = t('restingFor', formatTime(chip.stintSeconds))
  const total = t('totalFor', formatTime(chip.seconds))
  return `${chip.name} · ${rest} · ${total}`
}

// --- Dragging ------------------------------------------------------------
/** What is being dragged: a position on the field, or a player on the bench. */
const dragged = ref(null)
/**
 * The chip under the finger is drawn again over the whole page, rather than
 * moved from where it sits. The touchline strip scrolls and the board clips,
 * so a chip carried out of either would simply disappear at its edge.
 */
const ghost = ref(null)
/** Where it would land: a slot id, 'sideline', or null. */
const dropTarget = ref(null)

// Gesture bookkeeping: not reactive, because nothing renders from it.
let activePointerId = null
let origin = null
let startX = 0
let startY = 0
let dragging = false
let suppressClick = false
let slotTargets = []
let benchTargets = []
/** Where inside the chip the finger landed, so the ghost sits under it. */
let grabOffsetX = 0
let grabOffsetY = 0
let pendingGhost = null

function chipStyle(chip, kind) {
  if (kind !== 'field') return {}
  return {
    left: `${chip.x}%`,
    top: `clamp(${CHIP_EDGE_PX}px, ${chip.y}%, calc(100% - ${CHIP_EDGE_PX}px))`,
  }
}

/** Every shirt on the field, with where it actually sits right now. */
function centresOf(root, read) {
  if (!root) return []
  return [...root.querySelectorAll('[data-player-id], [data-slot-id]')].map((element) => {
    const rect = element.getBoundingClientRect()
    return { ...read(element), x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
  })
}

function collectTargets() {
  slotTargets = centresOf(pitch.value, (element) => ({ slotId: Number(element.dataset.slotId) }))
  // Every substitute is a target of their own: dropping a player on one names
  // that substitute for the change, rather than leaving it to the suggestion.
  benchTargets = centresOf(sideline.value, (element) => ({
    playerId: Number(element.dataset.playerId),
  }))
}

/** The nearest of these centres to the pointer, if any is near enough. */
function nearest(targets, clientX, clientY, skip) {
  let best = null
  let bestDistance = DROP_RADIUS
  targets.forEach((target) => {
    if (skip(target)) return
    const distance = Math.hypot(clientX - target.x, clientY - target.y)
    if (distance < bestDistance) {
      bestDistance = distance
      best = target
    }
  })
  return best
}

/**
 * Where a drop would land: a shirt on the pitch, one substitute in particular,
 * or the touchline itself. A substitute under the finger wins over the strip
 * they are standing on — naming them is the whole point of dropping on them.
 */
function findDropTarget(clientX, clientY) {
  const strip = sideline.value?.getBoundingClientRect()
  const overStrip = strip && clientY >= strip.top && clientX >= strip.left && clientX <= strip.right

  if (overStrip) {
    const substitute = nearest(
      benchTargets,
      clientX,
      clientY,
      (target) => origin?.playerId === target.playerId,
    )
    return substitute ? { playerId: substitute.playerId } : 'sideline'
  }

  const shirt = nearest(slotTargets, clientX, clientY, (target) => origin?.slotId === target.slotId)
  return shirt ? shirt.slotId : null
}

function onPointerDown(event, chip, kind) {
  // A new gesture. A drag across two elements fires no click to use up the
  // flag it set, and left standing it would swallow this tap instead.
  suppressClick = false
  if (match.pendingGoal || !chip.selectable) return
  activePointerId = event.pointerId
  origin = kind === 'field' ? { slotId: chip.slotId } : { playerId: chip.playerId }
  startX = event.clientX
  startY = event.clientY
  dragging = false
  collectTargets()

  const rect = event.currentTarget.getBoundingClientRect()
  grabOffsetX = event.clientX - rect.left
  grabOffsetY = event.clientY - rect.top
  pendingGhost = {
    name: chip.vacant ? chip.position : chip.name,
    time: chip.vacant ? '—' : formatTime(chip.stintSeconds),
    width: rect.width,
    height: rect.height,
    gk: Boolean(chip.isGoalkeeper),
    left: rect.left,
    top: rect.top,
  }

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
  if (origin === null || event.pointerId !== activePointerId) return

  const x = event.clientX - startX
  const y = event.clientY - startY
  if (!dragging && Math.hypot(x, y) < DRAG_THRESHOLD) return

  dragging = true
  dragged.value = origin
  ghost.value = {
    ...pendingGhost,
    left: event.clientX - grabOffsetX,
    top: event.clientY - grabOffsetY,
  }
  dropTarget.value = findDropTarget(event.clientX, event.clientY)
}

function onPointerUp(event) {
  if (origin === null || event.pointerId !== activePointerId) return

  const from = origin
  const target = dropTarget.value
  const wasDragging = dragging
  endGesture()

  // A tap falls through to the click handler; a drag must not also pick.
  if (!wasDragging) return
  suppressClick = true
  if (target === null) return

  if (from.slotId !== undefined) {
    // Dropped on one substitute in particular: that is the change, made now,
    // and no suggestion gets a say in it.
    if (target?.playerId !== undefined) {
      match.substitute(from.slotId, target.playerId)
      return
    }
    // Dropped on the touchline itself: off, with whoever is due on sent on —
    // or, with nobody to bring on, asked about first.
    if (target === 'sideline') {
      if (spareSubstitutes.value) match.planOff(from.slotId)
      else takingOffSlotId.value = from.slotId
      return
    }
    // Dropped on another shirt: the two trade positions.
    match.swapSlotPlayers(from.slotId, target)
    return
  }

  // A substitute dropped on a shirt takes it, now. Dropped back among the
  // substitutes, nothing happens: they never left.
  if (target === 'sideline' || target?.playerId !== undefined) return
  match.substitute(target, from.playerId)
}

function onPointerCancel() {
  if (dragging) suppressClick = true
  endGesture()
}

function endGesture() {
  activePointerId = null
  origin = null
  dragging = false
  slotTargets = []
  benchTargets = []
  pendingGhost = null
  dragged.value = null
  dropTarget.value = null
  ghost.value = null
}

/**
 * A goal waiting for a scorer turns every player into the answer: the coach is
 * already looking at the pitch, and the player who scored is drawn on it. Until
 * that is answered, a tap means "this one scored" and nothing else.
 *
 * A substitute is asked about first. They can have scored — the goal may be
 * being logged after they came off, or the record put right later — but a
 * player on the touchline is a surprising answer, and a surprising answer is
 * usually a mis-tap.
 */
function answersGoal(playerId, fromBench = false) {
  if (!match.pendingGoal || playerId === null) return false
  if (fromBench) scorerFromBenchId.value = playerId
  else match.confirmGoal(playerId)
  return true
}

const scorerFromBenchId = ref(null)

function onBenchScorerConfirmed() {
  match.confirmGoal(scorerFromBenchId.value)
  scorerFromBenchId.value = null
}

/** Keeps keyboard activation working, while a completed drag stays silent. */
function onFieldClick(chip) {
  if (suppressClick) {
    suppressClick = false
    return
  }
  if (answersGoal(chip.playerId)) return
  if (chip.asksFirst) {
    unlockingSlotId.value = chip.slotId
    return
  }
  match.pickSlot(chip.slotId)
}

function onBenchClick(chip) {
  if (suppressClick) {
    suppressClick = false
    return
  }
  if (answersGoal(chip.playerId, true)) return
  match.pickBenchPlayer(chip.playerId)
}

/** Substitutes free to come on: nobody left over means nobody to swap with. */
const spareSubstitutes = computed(() => match.availableBench.length > 0)

/** Walking off with nobody replacing them is asked about, never assumed. */
const takingOffSlotId = ref(null)

function onTakeOff() {
  match.takeOff(takingOffSlotId.value)
  takingOffSlotId.value = null
}

/**
 * Changing the keeper is a decision, not a mis-tap, so it is asked once — and
 * only ever because the coach reached for the keeper themselves. Nothing here
 * suggests it: the keeper is never prompted to come off. After the first time,
 * they are like anyone else for the rest of the match.
 */
const unlockingSlotId = ref(null)

function onUnlockGoalkeeper() {
  const slotId = unlockingSlotId.value
  unlockingSlotId.value = null
  match.unlockGoalkeeper()
  match.pickSlot(slotId)
}
</script>

<template>
  <!--
    One surface: the pitch, and the bench along the touchline beneath it. A
    change is made by dragging a player from one to the other — which only
    works if both are on the screen at once, hence the bench living here rather
    than in a panel of its own further down the page.
  -->
  <div
    ref="board"
    class="pitch-board"
    :class="{
      'pitch-board--dragging': dragged !== null,
      'pitch-board--asking': match.pendingGoal,
    }"
  >
    <div ref="pitch" class="pitch">
      <PitchMarkings />

      <button
        v-for="chip in renderedFieldChips"
        :key="chip.key"
        type="button"
        class="chip"
        :data-slot-id="chip.slotId"
        :data-player-id="chip.playerId ?? undefined"
        :class="{
          'chip--gk': chip.isGoalkeeper,
          'chip--due': chip.due && !chip.picked,
          'chip--picked': chip.picked,
          'chip--locked': !chip.selectable,
          'chip--dragging': dragged?.slotId === chip.slotId,
          'chip--target': dropTarget === chip.slotId,
          'chip--vacant': chip.vacant,
          'chip--moved': chip.moved,
        }"
        :style="chipStyle(chip, 'field')"
        :disabled="!chip.selectable && !chip.asksFirst && !match.pendingGoal"
        :aria-pressed="chip.picked"
        :title="fieldTitle(chip)"
        @pointerdown="onPointerDown($event, chip, 'field')"
        @pointermove="onPointerMove"
        @pointerup="onPointerUp"
        @pointercancel="onPointerCancel"
        @click="onFieldClick(chip)"
      >
        <template v-if="chip.vacant">
          <span class="chip-name">{{ chip.position }}</span>
          <span class="chip-time clock-face">—</span>
        </template>
        <template v-else>
          <span class="chip-name">{{ chip.name }}</span>
          <span class="chip-time clock-face">{{ formatTime(chip.stintSeconds) }}</span>
        </template>

        <!-- Booked: the card sits on the shirt, so it is never forgotten mid-match. -->
        <CardMarks v-if="chip.cards" class="chip-cards" :counts="chip.cards" :size="11" />

        <!-- The armband, worn where an armband is worn. -->
        <span v-if="chip.captain" class="armband" :title="t('captainLabel')">C</span>

        <span v-if="chip.picked" class="chip-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7" /></svg>
        </span>
        <!-- Longest on the pitch: the rotation says this one comes off next. -->
        <span v-else-if="chip.due" class="chip-mark chip-mark--due" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M12 5v13m0 0-5.5-5.5M12 18l5.5-5.5" /></svg>
        </span>
      </button>
    </div>

    <!-- The touchline: everyone waiting, and where a player dropped goes off. -->
    <div ref="sideline" class="sideline" :class="{ 'sideline--target': dropTarget === 'sideline' }">
      <p class="sideline-title">{{ t('benchTitle') }}</p>

      <div class="waiting">
        <p v-if="!benchChips.length" class="sideline-empty">{{ t('benchEmptyNote') }}</p>

        <button
          v-for="chip in benchChips"
          :key="chip.key"
          type="button"
          class="chip chip--bench"
          :data-player-id="chip.playerId"
          :class="{
            'chip--due': chip.due && !chip.picked,
            'chip--picked': chip.picked,
            'chip--locked': !chip.selectable,
            'chip--dragging': dragged?.playerId === chip.playerId,
            'chip--target': dropTarget?.playerId === chip.playerId,
          }"
          :style="chipStyle(chip, 'bench')"
          :disabled="!chip.selectable && !match.pendingGoal"
          :aria-pressed="chip.picked"
          :title="benchTitle(chip)"
          @pointerdown="onPointerDown($event, chip, 'bench')"
          @pointermove="onPointerMove"
          @pointerup="onPointerUp"
          @pointercancel="onPointerCancel"
          @click="onBenchClick(chip)"
        >
          <span class="chip-name">{{ chip.name }}</span>
          <span class="chip-time clock-face">{{ formatTime(chip.stintSeconds) }}</span>

          <CardMarks v-if="chip.cards" class="chip-cards" :counts="chip.cards" :size="11" />

          <span v-if="chip.picked" class="chip-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 12.5 10 17.5 19 7" /></svg>
          </span>
          <span v-else-if="chip.due" class="chip-mark chip-mark--duein" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M12 19V6m0 0-5.5 5.5M12 6l5.5 5.5" /></svg>
          </span>
        </button>
      </div>
    </div>
  </div>

  <!--
    Over the whole page, so it is never cut off by the scrolling touchline or
    the edge of the board. It only follows the finger; the drop is decided from
    the pointer, not from where this lands.
  -->
  <Teleport to="body">
    <div
      v-if="ghost"
      class="chip chip--ghost"
      :class="{ 'chip--gk': ghost.gk }"
      :style="{
        left: `${ghost.left}px`,
        top: `${ghost.top}px`,
        width: `${ghost.width}px`,
        height: `${ghost.height}px`,
      }"
      aria-hidden="true"
    >
      <span class="chip-name">{{ ghost.name }}</span>
      <span class="chip-time clock-face">{{ ghost.time }}</span>
    </div>
  </Teleport>

  <UiConfirmDialog
    v-if="scorerFromBenchId !== null"
    :message="t('benchScorerConfirm', match.playerName(scorerFromBenchId))"
    :confirm-label="t('yesBtn')"
    :cancel-label="t('cancelBtn')"
    @confirm="onBenchScorerConfirmed"
    @cancel="scorerFromBenchId = null"
  />

  <UiConfirmDialog
    v-if="takingOffSlotId !== null"
    :message="t('takeOffConfirm')"
    :confirm-label="t('yesBtn')"
    :cancel-label="t('cancelBtn')"
    @confirm="onTakeOff"
    @cancel="takingOffSlotId = null"
  />

  <UiConfirmDialog
    v-if="unlockingSlotId !== null"
    :message="t('unlockGkConfirm')"
    :confirm-label="t('yesBtn')"
    :cancel-label="t('cancelBtn')"
    @confirm="onUnlockGoalkeeper"
    @cancel="unlockingSlotId = null"
  />
</template>

<style scoped>
/*
 * Waiting on a scorer: every player is an answer, so every player is lit —
 * and lit properly. A soft glow is invisible on a bright afternoon, so the
 * shirts turn over entirely: green ground, dark ink, which reads at arm's
 * length in sunlight where a coloured outline does not.
 */
.pitch-board--asking .chip {
  background: var(--go);
  border-color: #08281a;
  color: #08281a;
  opacity: 1;
  animation: scorer-wanted 1.6s ease-in-out infinite;
}

.pitch-board--asking .chip .chip-time {
  color: rgba(8, 40, 26, 0.78);
}

.pitch-board--asking .chip--vacant {
  background: rgba(0, 0, 0, 0.3);
  border-color: var(--line-strong);
  color: var(--chalk-dim);
  opacity: 0.45;
  animation: none;
}

@keyframes scorer-wanted {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(250, 255, 250, 0.55);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(250, 255, 250, 0.12);
  }
}

@media (prefers-reduced-motion: reduce) {
  .pitch-board--asking .chip {
    animation: none;
    box-shadow: 0 0 0 2px rgba(250, 255, 250, 0.5);
  }
}

.pitch-board--asking .chip--vacant {
  border-color: var(--line-strong);
  opacity: 0.5;
}

.pitch-board {
  border-radius: var(--radius);
  overflow: hidden;
  background: linear-gradient(to bottom, #17512f 0%, #123f26 100%);
}

.pitch {
  position: relative;
  aspect-ratio: 100 / 96;
  width: 100%;
  background:
    repeating-linear-gradient(
      to bottom,
      rgba(255, 255, 255, 0.022) 0 8%,
      rgba(0, 0, 0, 0.022) 8% 16%
    ),
    linear-gradient(to bottom, #17512f 0%, #123f26 100%);
}

/* Beyond the touchline: a strip of darker ground where the substitutes wait. */
.sideline {
  padding: 8px 10px 10px;
  background: rgba(0, 0, 0, 0.26);
  border-top: 2px dashed rgba(255, 255, 255, 0.22);
  transition: background 0.15s ease;
}

.sideline-title {
  margin: 0 0 7px;
  text-align: center;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 1.3px;
  text-transform: uppercase;
  color: var(--chalk-dim);
}

/*
 * Centred, because a half-empty bench pinned to one side reads as a mistake.
 * `safe` keeps the first player reachable when there are more than fit:
 * centring an overflowing row would push its start out of scrolling reach.
 */
.waiting {
  display: flex;
  align-items: center;
  justify-content: center;
  justify-content: safe center;
  gap: 8px;
  min-height: 56px;
  overflow-x: auto;
}

.sideline--target {
  background: rgba(95, 190, 139, 0.22);
}

.sideline-empty {
  flex: 1;
  margin: 0;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  color: var(--chalk-dim);
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

/* On the touchline the chips sit in a row, not at a position on the pitch. */
.chip--bench {
  position: relative;
  transform: none;
  flex: 0 0 auto;
}

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

/* The same armband the lineup and the results use. */
.armband {
  position: absolute;
  bottom: -7px;
  left: -7px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: var(--amber);
  border: 1.5px solid var(--amber-ink);
  color: var(--amber-ink);
  font-size: 11.5px;
  font-weight: 700;
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

.chip-mark--duein {
  background: var(--go);
  border-color: #08281a;
}

.chip-mark--duein svg {
  stroke: #08281a;
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

/* Most minutes on the pitch — the rotation says this one comes off next. */
.chip--due {
  border-color: var(--alert);
  box-shadow: 0 0 0 3px rgba(233, 105, 79, 0.16);
}

.chip--bench.chip--due {
  border-color: var(--go);
  box-shadow: 0 0 0 3px rgba(95, 190, 139, 0.16);
}

/* Picked, waiting for the other half of the change. */
.chip--picked {
  background: var(--amber);
  border-color: var(--amber);
  color: var(--amber-ink);
}

.chip--picked .chip-time {
  color: rgba(42, 27, 4, 0.75);
}

.chip--locked {
  opacity: 0.62;
  cursor: default;
}

/* Nobody in this shirt: a red card was shown and nobody replaced them. */
.chip--vacant {
  background: rgba(0, 0, 0, 0.3);
  border-style: dashed;
  color: var(--chalk-dim);
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

/* Left behind while its copy travels: still there, visibly picked up. */
.chip--dragging {
  opacity: 0.35;
  transition: none;
}

/*
 * The travelling copy. Fixed to the viewport and outside every box that
 * scrolls or clips, which is the whole point of drawing it separately.
 */
.chip--ghost {
  position: fixed;
  z-index: 60;
  transform: scale(1.08);
  justify-content: center;
  pointer-events: none;
  transition: none;
  box-shadow: 0 12px 26px rgba(0, 0, 0, 0.5);
}

/* Where the drag would land. */
.chip--target {
  border-color: var(--go);
  box-shadow: 0 0 0 4px rgba(95, 190, 139, 0.28);
}
</style>
