<script setup>
defineProps({
  /** 'hero' for the splash, 'compact' where it heads a page. */
  size: { type: String, default: 'hero', validator: (v) => ['hero', 'compact'].includes(v) },
})
</script>

<template>
  <!-- Two words, second in amber: the one piece of type that has to be the same everywhere. -->
  <h1 class="wordmark" :class="`wordmark--${size}`">
    <span class="word">Melkein</span>
    <span class="word word--accent">suunnitelma</span>
  </h1>
</template>

<style scoped>
.wordmark {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: 0.94;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0;
  display: flex;
  flex-direction: column;
}

.wordmark--hero {
  font-size: clamp(30px, 11vw, 44px);
  align-items: center;
}

.wordmark--compact {
  font-size: clamp(26px, 8.5vw, 34px);
  align-items: flex-start;
}

.word--accent {
  color: var(--amber);
}

/* Nudged over, as if chalked in a hurry. */
.wordmark--hero .word--accent {
  margin-left: 14px;
}
</style>
