<script setup>
import { computed } from 'vue'
import { useFadingOffer } from '@/composables/useFadingOffer.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()

/** Changes happen the moment a player is dropped; this is the way back. */
const undoOffered = useFadingOffer(() => match.lastSub)

/**
 * What the undo will undo, in names. With changes made instantly, "undo" on
 * its own leaves a coach guessing which change it means — "Aino ↔ Bo" does not.
 */
const undoLabel = computed(() => {
  const last = match.lastSub
  if (!last) return ''
  return last.slots
    .map(({ id, playerId: offId }) => {
      const onId = match.slots.find((slot) => slot.id === id)?.playerId ?? null
      const off = offId === null ? '' : match.playerName(offId)
      const on = onId === null ? '' : match.playerName(onId)
      if (off && on) return t('undoSwapPart', off, on)
      if (off) return t('undoOffPart', off)
      return t('undoOnPart', on)
    })
    .join(', ')
})
</script>

<template>
  <div class="bar">
    <p v-if="match.limitReached" class="hint hint--alert">
      {{ t('limitReachedNote', match.subsUsed, match.rules.subLimit) }}
    </p>
    <p v-else-if="match.rules.subLimitEnabled" class="hint">
      {{ t('subsUsedNote', match.subsUsed, match.rules.subLimit) }}
    </p>

    <button
      v-if="undoOffered && match.canUndoSub && !match.hasSelection"
      type="button"
      class="undo"
      @click="match.undoSubstitution()"
    >
      {{ t('undoSubBtn', undoLabel) }}
    </button>
  </div>
</template>

<style scoped>
.bar {
  margin-top: 12px;
}

.bar:empty {
  display: none;
}

.hint {
  font-size: 15px;
  font-weight: 500;
  color: var(--chalk-dim);
  text-align: center;
  margin: 0;
}

.hint--alert {
  color: var(--alert);
  font-weight: 600;
}

.undo {
  display: block;
  margin: 12px auto 2px;
  background: none;
  color: var(--chalk-dim);
  font-size: 15px;
  font-weight: 500;
  padding: 4px 10px;
  text-decoration: underline;
  text-underline-offset: 3px;
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
