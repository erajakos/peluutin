<script setup>
import PitchMap from '@/components/live/PitchMap.vue'
import PlayerRow from '@/components/live/PlayerRow.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()

/** A fixed goalkeeper is not part of the rotation, so they cannot be selected. */
function isSelectable(slot) {
  return !(slot.isGoalkeeper && match.rules.fixedGoalkeeper) && !match.limitReached
}
</script>

<template>
  <UiPanel>
    <div class="section-title">
      <h3>{{ t('onFieldTitle') }}</h3>
      <span class="hint">{{ t('onFieldHint') }}</span>
    </div>

    <PitchMap v-if="match.filledSlots.length" />
    <p v-else class="count-note">{{ t('noOneOnField') }}</p>

    <!-- The pitch answers "who and roughly how long"; the list answers "exactly". -->
    <details v-if="match.filledSlots.length" class="exact">
      <summary>{{ t('showExactTimes') }}</summary>
      <PlayerRow
        v-for="slot in match.filledSlots"
        :key="slot.id"
        :position="slot.label"
        :is-goalkeeper="slot.isGoalkeeper"
        :name="match.playerName(slot.playerId)"
        :seconds="match.playersById.get(slot.playerId)?.seconds ?? 0"
        :meta="t('playingFor', formatTime(match.playersById.get(slot.playerId)?.stintSeconds ?? 0))"
        :selected="match.selectedOffSlotIds.has(slot.id)"
        :selectable="isSelectable(slot)"
        :badge="match.hints.dueOffSlotIds.has(slot.id) ? t('dueOffBadge') : ''"
        badge-tone="off"
        @toggle="match.toggleOffSlot(slot.id)"
      />
    </details>
  </UiPanel>
</template>

<style scoped>
.exact {
  margin-top: 12px;
  border-top: 1px dashed var(--line-strong);
  padding-top: 10px;
}

.exact summary {
  font-size: 13px;
  color: var(--chalk-dim);
  cursor: pointer;
  list-style: none;
  display: flex;
  align-items: center;
  gap: 6px;
}

.exact summary::-webkit-details-marker {
  display: none;
}

.exact summary::before {
  content: '▸';
  font-size: 11px;
  transition: transform 0.15s ease;
}

.exact[open] summary::before {
  transform: rotate(90deg);
}
</style>
