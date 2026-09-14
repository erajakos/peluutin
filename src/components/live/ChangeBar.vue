<script setup>
import { onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()

/**
 * Changes happen the moment a player is dropped, so this is only the way back
 * from a mis-drop: offered when a change is made, and gone a few seconds later.
 * A coach who meant it never has to dismiss anything, and never taps it by
 * accident either, since by then it is gone.
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
      {{ t('undoSubBtn') }}
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
