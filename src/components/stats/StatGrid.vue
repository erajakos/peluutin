<script setup>
import ResultBadge from '@/components/ui/ResultBadge.vue'

defineProps({
  /**
   * `{ value, label, result? }` tiles; the label may be blank when the value
   * speaks. A `result` ('win', 'draw' or 'loss') colours the tile to match.
   */
  stats: { type: Array, required: true },
})
</script>

<template>
  <div class="grid">
    <div
      v-for="stat in stats"
      :key="stat.label || stat.value"
      class="box"
      :class="stat.result && `box--${stat.result}`"
    >
      <div class="num clock-face">{{ stat.value }}</div>
      <!-- A tile whose value speaks for itself keeps the slot, not the words. -->
      <div v-if="stat.label" class="lbl">
        <ResultBadge v-if="stat.result" :result="stat.result" :size="19" />
        {{ stat.label }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.grid {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.box {
  flex: 1;
  background: var(--field-bg);
  border: 1px solid var(--line);
  border-radius: 8px;
  padding: 12px 10px;
  text-align: center;
  min-width: 0;
}

.num {
  font-size: 31px;
}

.lbl {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 14.5px;
  font-weight: 500;
  color: var(--chalk-dim);
  margin-top: 3px;
}

.box--win {
  background: rgba(95, 190, 139, 0.14);
  border-color: rgba(95, 190, 139, 0.55);
}

.box--win .num {
  color: var(--go);
}

.box--draw {
  background: rgba(185, 205, 197, 0.1);
  border-color: rgba(185, 205, 197, 0.45);
}

.box--loss {
  background: rgba(233, 105, 79, 0.14);
  border-color: rgba(233, 105, 79, 0.55);
}

.box--loss .num {
  color: var(--against);
}
</style>
