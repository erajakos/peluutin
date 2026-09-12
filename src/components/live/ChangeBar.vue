<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()

/**
 * A way back from a mis-tap, and nothing more: the offer appears when a change
 * is made and goes quietly a few seconds later. A coach who meant the change
 * never has to dismiss anything, and never taps it by accident either, since
 * by then it is gone.
 */
const UNDO_WINDOW_MS = 12_000
const undoOffered = ref(false)
let undoTimer = null

watch(
  () => match.lastSub,
  (last) => {
    clearTimeout(undoTimer)
    undoOffered.value = Boolean(last)
    if (!last) return
    undoTimer = setTimeout(() => {
      undoOffered.value = false
    }, UNDO_WINDOW_MS)
  },
)

onBeforeUnmount(() => clearTimeout(undoTimer))

/** The change as it stands, one line per position: who goes off, who comes on. */
function pairFor(slotId) {
  const slot = match.slots.find((candidate) => candidate.id === slotId)
  const incomingId = match.plannedIncomingId(slotId)
  return {
    slotId,
    off: match.playerName(slot?.playerId) || slot?.label || '',
    on: incomingId === null ? '' : match.playerName(incomingId),
  }
}
</script>

<template>
  <div class="bar">
    <!-- Nothing planned: the pitch speaks for itself, so this stays out of the way. -->
    <template v-if="match.hasSelection">
      <!--
        The way a substitution is written on a team sheet or shown on a screen:
        a red arrow down for the player coming off, a green one up for the
        player coming on. No word for either, in any language.
      -->
      <ul class="pairs">
        <li v-for="(slotId, index) in match.plannedSlotIds" :key="slotId" class="pair">
          <span v-if="match.plannedCount > 1" class="pair-no">{{ index + 1 }}</span>

          <span class="side side--off">
            <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 5v13m0 0-5.5-5.5M12 18l5.5-5.5" />
            </svg>
            <span class="who">{{ pairFor(slotId).off }}</span>
          </span>

          <span class="side side--on" :class="{ 'side--missing': !pairFor(slotId).on }">
            <svg class="arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 19V6m0 0-5.5 5.5M12 6l5.5 5.5" />
            </svg>
            <span class="who">{{ pairFor(slotId).on || t('whoComesOnNote') }}</span>
          </span>

          <button
            type="button"
            class="drop"
            :aria-label="t('cancelChangeAria')"
            @click="match.unstage(slotId)"
          >
            ×
          </button>
        </li>
      </ul>

      <p v-if="!match.plannedCount" class="hint">{{ t('pickPartnerNote') }}</p>

      <!-- Complete and within the rules: the button says so before it is read. -->
      <UiButton
        class="confirm"
        :class="{ 'confirm--ready': match.canConfirmSub }"
        :disabled="!match.canConfirmSub"
        @click="match.confirmSubstitution()"
      >
        {{ t('confirmSubBtn', match.plannedCount) }}
      </UiButton>
    </template>

    <p v-else-if="match.limitReached" class="hint hint--alert">
      {{ t('limitReachedNote', match.subsUsed, match.rules.subLimit) }}
    </p>
    <p v-else-if="match.rules.subLimitEnabled" class="hint">
      {{ t('subsUsedNote', match.subsUsed, match.rules.subLimit) }}
    </p>

    <button
      v-if="undoOffered && match.canUndoSub && !match.hasSelection"
      type="button"
      class="minor undo"
      @click="match.undoSubstitution()"
    >
      {{ t('undoSubBtn') }}
    </button>
  </div>
</template>

<style scoped>
.bar {
  margin-top: 12px;
}

.pairs {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
}

.pair {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
  font-size: 16px;
  font-weight: 600;
}

.pair:last-child {
  border-bottom: none;
}

.pair-no {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  color: var(--chalk-dim);
  font-size: 12px;
  font-weight: 700;
}

.side {
  display: flex;
  align-items: center;
  gap: 5px;
  flex: 1;
  min-width: 0;
}

.who {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.arrow {
  flex-shrink: 0;
  width: 17px;
  height: 17px;
  fill: none;
  stroke-width: 2.6;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.side--off .arrow {
  stroke: var(--alert);
}

.side--on {
  color: var(--go);
}

.side--on .arrow {
  stroke: var(--go);
}

/* Chosen to come off, with nobody picked to come on yet. */
.side--missing {
  color: var(--chalk-dim);
  font-weight: 500;
}

.side--missing .arrow {
  stroke: var(--chalk-dim);
}

.drop {
  flex-shrink: 0;
  background: none;
  color: var(--chalk-dim);
  font-size: 20px;
  line-height: 1;
  padding: 4px 6px;
}

/* Ready to go: a slow breath of green, quiet enough to ignore mid-match. */
.confirm--ready {
  animation: ready 2.2s ease-in-out infinite;
}

@keyframes ready {
  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(95, 190, 139, 0);
  }
  50% {
    box-shadow: 0 0 0 5px rgba(95, 190, 139, 0.32);
  }
}

@media (prefers-reduced-motion: reduce) {
  .confirm--ready {
    animation: none;
    box-shadow: 0 0 0 3px rgba(95, 190, 139, 0.35);
  }
}

.hint {
  font-size: 15px;
  font-weight: 500;
  color: var(--chalk-dim);
  text-align: center;
  margin: 0 0 12px;
}

.hint--alert {
  color: var(--alert);
  font-weight: 600;
  margin-bottom: 0;
}

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

/* Fades in where it will be looked for, and leaves without being dismissed. */
.undo {
  animation: undo-in 0.25s ease-out;
}

@keyframes undo-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .undo {
    animation: none;
  }
}
</style>
