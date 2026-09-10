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
  display: inline-block;
  font-size: 11.5px;
  font-weight: 700;
  letter-spacing: 0.4px;
  padding: 3px 8px;
  border-radius: 5px;
  margin-left: 8px;
  white-space: nowrap;
  vertical-align: 1px;
}

.badge--off {
  background: var(--alert);
  color: #2b0d06;
}

.badge--on {
  background: var(--go);
  color: #06231a;
}
</style>
