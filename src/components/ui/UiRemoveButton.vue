<script setup>
defineProps({
  label: { type: String, required: true },
})
</script>

<template>
  <button type="button" class="remove" :aria-label="label">&times;</button>
</template>

<style scoped>
.remove {
  background: none;
  color: var(--chalk-dim);
  font-size: 18px;
  line-height: 1;
  padding: 4px 6px;
}
</style>
