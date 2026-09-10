<script setup>
defineProps({
  /** `{ value, label }` tiles; the label may be blank when the value speaks. */
  stats: { type: Array, required: true },
})
</script>

<template>
  <div class="grid">
    <div v-for="stat in stats" :key="stat.label || stat.value" class="box">
      <div class="num clock-face">{{ stat.value }}</div>
      <!-- A tile whose value speaks for itself keeps the slot, not the words. -->
      <div v-if="stat.label" class="lbl">{{ stat.label }}</div>
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
  font-size: 24px;
}

.lbl {
  font-size: 11px;
  color: var(--chalk-dim);
  margin-top: 2px;
}
</style>
