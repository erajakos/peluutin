<script setup>
defineProps({
  /** 'hero' for the splash, 'compact' where it heads a page. */
  size: { type: String, default: 'hero', validator: (v) => ['hero', 'compact'].includes(v) },
})
</script>

<template>
  <h1 class="wordmark" :class="`wordmark--${size}`">Peluutin</h1>
</template>

<style scoped>
.wordmark {
  font-family: var(--font-display);
  font-weight: 700;
  line-height: 0.94;
  letter-spacing: 1px;
  text-transform: uppercase;
  color: var(--amber);
  margin: 0;
}

.wordmark--hero {
  font-size: clamp(34px, 12vw, 48px);
  text-align: center;
}

.wordmark--compact {
  font-size: clamp(30px, 9.5vw, 38px);
}
</style>
