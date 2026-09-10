<script setup>
defineProps({
  /** Section heading. A panel without one is just a container. */
  title: { type: String, default: '' },
})
</script>

<template>
  <section class="panel">
    <h2 v-if="title" class="panel-title">{{ title }}</h2>
    <slot />
  </section>
</template>

<style scoped>
.panel {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
}

/*
 * A banded header rather than a rule: the panel reads as a titled card, and the
 * heading needs no colour of its own to separate it from the content.
 */
.panel-title {
  font-family: var(--font-display);
  font-size: 21px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: var(--chalk);
  background: rgba(0, 0, 0, 0.2);
  text-align: center;
  margin: -16px -16px 16px;
  padding: 13px 16px;
  border-radius: calc(var(--radius) - 1px) calc(var(--radius) - 1px) 0 0;
}
</style>
