<script setup>
import { computed } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import { isAssignmentComplete, slotAssignedTo } from '@/domain/substitutions.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()

const assignment = computed(() => match.pendingAssignment)

/**
 * One row per vacated position, offering every incoming player as a chip.
 * Nobody is filtered out: tapping a player who is already pencilled in
 * elsewhere trades the two, so reordering a double substitution is a single
 * tap rather than a clear-then-choose dance.
 */
const assignmentRows = computed(() =>
  assignment.value.offSlotIds.map((slotId) => {
    const slot = match.slots.find((candidate) => candidate.id === slotId)
    return {
      slotId,
      position: slot.label,
      leaving: match.playerName(slot.playerId),
      chosenId: assignment.value.map[slotId] ?? null,
      candidates: assignment.value.onPlayerIds.map((playerId) => ({
        id: playerId,
        name: match.playerName(playerId),
        elsewhere: slotAssignedTo(assignment.value, playerId) !== null,
      })),
    }
  }),
)

const offNames = computed(() =>
  [...match.selectedOffSlotIds]
    .map((slotId) => match.slots.find((slot) => slot.id === slotId))
    .filter(Boolean)
    .map((slot) => match.playerName(slot.playerId))
    .join(', '),
)

const onNames = computed(() =>
  [...match.selectedOnPlayerIds].map((playerId) => match.playerName(playerId)).join(', '),
)

const status = computed(() => {
  if (!offNames.value) return t('subPrompt')
  if (!onNames.value) return t('comingOffOnly', offNames.value)
  return t('comingOffOn', offNames.value, onNames.value)
})
</script>

<template>
  <!--
    Sticky by design: the coach's thumb stays here while their eyes are on the
    pitch, so the confirm action must never scroll out of reach.
  -->
  <div class="sub-bar">
    <!-- Multi-player change: say who takes which position. -->
    <template v-if="assignment">
      <p class="status">{{ t('assignTitle') }}</p>
      <div v-for="row in assignmentRows" :key="row.slotId" class="assign-row">
        <div class="assign-from">
          <span class="assign-position">{{ row.position }}</span>
          <span class="assign-leaving">{{ row.leaving }}</span>
        </div>
        <div class="assign-choices">
          <button
            v-for="candidate in row.candidates"
            :key="candidate.id"
            type="button"
            class="choice"
            :class="{
              'choice--on': candidate.id === row.chosenId,
              'choice--elsewhere': candidate.elsewhere && candidate.id !== row.chosenId,
            }"
            @click="match.setAssignment(row.slotId, candidate.id)"
          >
            {{ candidate.name }}
          </button>
        </div>
      </div>
      <div class="action-pair spaced">
        <UiButton variant="secondary" @click="match.cancelAssignment()">
          {{ t('cancelBtn') }}
        </UiButton>
        <UiButton :disabled="!isAssignmentComplete(assignment)" @click="match.applyAssignment()">
          {{ t('applySubBtn') }}
        </UiButton>
      </div>
    </template>

    <!-- No substitutions left under the match's own rules. -->
    <p v-else-if="match.limitReached" class="status status--alert">
      {{ t('limitReachedNote', match.subsUsed, match.rules.subLimit) }}
    </p>

    <template v-else>
      <p class="status">
        {{ status }}
        <template v-if="match.rules.subLimitEnabled">
          <span class="divider">·</span>
          {{ t('subsUsedNote', match.subsUsed, match.rules.subLimit) }}
        </template>
      </p>
      <p v-if="match.autoSelectedOn" class="auto-note">{{ t('autoPickedNote') }}</p>
      <div class="action-pair">
        <UiButton variant="secondary" @click="match.clearSelection()">{{ t('clearBtn') }}</UiButton>
        <UiButton :disabled="!match.canConfirmSub" @click="match.confirmSubstitution()">
          {{ t('confirmSubBtn') }}
        </UiButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.sub-bar {
  position: sticky;
  bottom: 0;
  background: var(--bg2);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  padding: 12px 14px;
  margin-top: 16px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45);
}

.status {
  font-size: 13px;
  color: var(--chalk-dim);
  margin: 0 0 10px;
  line-height: 1.45;
}

.status--alert {
  color: var(--alert);
  margin-bottom: 0;
}

.auto-note {
  font-size: 12px;
  color: var(--go);
  margin: -4px 0 10px;
}

.divider {
  margin: 0 6px;
}

.assign-row {
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
}

.assign-row:last-of-type {
  border-bottom: none;
}

.assign-from {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 8px;
}

.assign-position {
  font-size: 13px;
  font-weight: 600;
  color: var(--chalk);
}

.assign-leaving {
  font-size: 12px;
  color: var(--chalk-dim);
}

.assign-leaving::before {
  content: '↑ ';
  color: var(--alert);
}

.assign-choices {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.choice {
  padding: 9px 14px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: var(--field-bg);
  color: var(--chalk);
  font-size: 14px;
  font-weight: 600;
}

.choice:active {
  transform: scale(0.96);
}

.choice--on {
  background: var(--go);
  border-color: var(--go);
  color: #08281a;
}

/* Pencilled in for another position — tapping it here trades the two. */
.choice--elsewhere {
  opacity: 0.5;
  border-style: dashed;
}

.spaced {
  margin-top: 10px;
}
</style>
