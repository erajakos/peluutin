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

/** Empty until there is a selection: an idle instruction is just noise. */
const status = computed(() => {
  if (!offNames.value) return ''
  if (!onNames.value) return t('comingOffOnly', offNames.value)
  return t('comingOffOn', offNames.value, onNames.value)
})
</script>

<template>
  <!--
    Lives at the foot of the bench panel: incoming players are chosen just
    above, so the action that commits them belongs in the same box.
  -->
  <div class="sub-actions">
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
      <UiButton
        class="commit"
        :disabled="!isAssignmentComplete(assignment)"
        @click="match.applyAssignment()"
      >
        {{ t('applySubBtn') }}
      </UiButton>
      <button type="button" class="minor" @click="match.cancelAssignment()">
        {{ t('cancelBtn') }}
      </button>
    </template>

    <template v-else>
      <!-- No substitutions left under the match's own rules. -->
      <p v-if="match.limitReached" class="status status--alert">
        {{ t('limitReachedNote', match.subsUsed, match.rules.subLimit) }}
      </p>
      <p v-else-if="status || match.rules.subLimitEnabled" class="status">
        {{ status }}
        <template v-if="status && match.rules.subLimitEnabled">
          <span class="divider">·</span>
        </template>
        <template v-if="match.rules.subLimitEnabled">
          {{ t('subsUsedNote', match.subsUsed, match.rules.subLimit) }}
        </template>
      </p>

      <p v-if="match.autoSelectedOn" class="auto-note">{{ t('autoPickedNote') }}</p>

      <UiButton
        v-if="!match.limitReached"
        class="commit"
        :disabled="!match.canConfirmSub"
        @click="match.confirmSubstitution()"
      >
        {{ t('confirmSubBtn') }}
      </UiButton>

      <!-- Two on the pitch selected: they can trade shirts without a sub. -->
      <UiButton
        v-if="match.canSwapPositions"
        variant="secondary"
        class="swap"
        @click="match.swapPositions()"
      >
        {{ t('swapPositionsBtn') }}
      </UiButton>

      <button v-if="match.hasSelection" type="button" class="minor" @click="match.clearSelection()">
        {{ t('clearBtn') }}
      </button>
    </template>
  </div>
</template>

<style scoped>
.sub-actions {
  border-top: 1px solid var(--line);
  margin-top: 14px;
  padding-top: 14px;
}

.status {
  font-size: 14.5px;
  color: var(--chalk-dim);
  margin: 0 0 10px;
  line-height: 1.45;
}

.status--alert {
  color: var(--alert);
  margin-bottom: 0;
}

.auto-note {
  font-size: 14.5px;
  font-weight: 600;
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
  font-size: 14.5px;
  font-weight: 600;
  color: var(--chalk);
}

.assign-leaving {
  font-size: 14.5px;
  font-weight: 500;
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
  padding: 11px 16px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: var(--field-bg);
  color: var(--chalk);
  font-size: 15.5px;
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

/* The one thing these actions exist to do. */
.commit {
  margin-top: 0;
}

.swap {
  margin-top: 8px;
}

/* A way to undo a selection — available, but never competing with the commit. */
.minor {
  display: block;
  margin: 12px auto 2px;
  background: none;
  color: var(--chalk-dim);
  font-size: 15px;
  font-weight: 500;
  padding: 4px 10px;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
