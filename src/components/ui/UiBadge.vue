<script setup>
defineProps({
  /** on: coming into the game. off: leaving it (or out for good). */
  tone: { type: String, default: 'on', validator: (v) => ['on', 'off'].includes(v) },
})
</script>

<template>
  <span class="badge" :class="`badge--${tone}`"><slot /></span>
</template>

<style scoped>
.badge {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.3px;
  padding: 3px 6px;
  border-radius: 4px;
  margin-left: 6px;
  white-space: nowrap;
}

.badge--off {
  background: rgba(233, 105, 79, 0.18);
  color: var(--alert);
}

.badge--on {
  background: rgba(95, 190, 139, 0.18);
  color: var(--go);
}
</style>
