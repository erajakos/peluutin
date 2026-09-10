<script setup>
import { useI18n } from '@/i18n/index.js'

defineProps({
  players: { type: Array, required: true },
  prompt: { type: String, required: true },
  /** Current pick, if this picker is correcting an existing entry. */
  selectedId: { type: Number, default: null },
  /** Offer an "unknown" choice — a goal can have no named scorer, a card cannot. */
  allowUnknown: { type: Boolean, default: false },
})
const emit = defineEmits(['pick', 'cancel'])
const { t } = useI18n()
</script>

<template>
  <!--
    Names as tap targets rather than a dropdown. A native select is fiddly with
    one thumb on the touchline, and on a screen whose clock reflows every second
    it is the control most likely to close under the coach mid-tap.
  -->
  <div class="picker">
    <p class="prompt">{{ prompt }}</p>
    <div class="grid">
      <button
        v-for="player in players"
        :key="player.id"
        type="button"
        class="name-chip"
        :class="{ 'name-chip--on': player.id === selectedId }"
        @click="emit('pick', player.id)"
      >
        {{ player.name }}
      </button>
      <button
        v-if="allowUnknown"
        type="button"
        class="name-chip name-chip--unknown"
        :class="{ 'name-chip--on': selectedId === null }"
        @click="emit('pick', null)"
      >
        {{ t('unknownScorerOption') }}
      </button>
    </div>
    <button type="button" class="cancel" @click="emit('cancel')">{{ t('cancelBtn') }}</button>
  </div>
</template>

<style scoped>
.picker {
  background: var(--field-bg);
  border: 1px solid var(--line-strong);
  border-radius: var(--radius);
  padding: 12px;
  margin-bottom: 10px;
}

.prompt {
  font-size: 13px;
  color: var(--chalk-dim);
  margin: 0 0 10px;
}

.grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.name-chip {
  padding: 10px 14px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: var(--panel);
  color: var(--chalk);
  font-size: 14px;
  font-weight: 600;
}

.name-chip:active {
  transform: scale(0.96);
}

.name-chip--unknown {
  color: var(--chalk-dim);
  font-weight: 500;
  border-style: dashed;
}

.name-chip--on {
  background: var(--amber);
  border-color: var(--amber);
  color: var(--amber-ink);
}

.cancel {
  margin-top: 12px;
  background: none;
  color: var(--chalk-dim);
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 4px 0;
}
</style>
