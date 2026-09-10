<script setup>
defineProps({
  /** primary: the one obvious next step. secondary: an alternative. text: a quiet link. */
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'text'].includes(value),
  },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: true },
})
</script>

<template>
  <button
    type="button"
    :class="['btn', `btn--${variant}`, { 'btn--block': block }]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  font-family: inherit;
  border-radius: 8px;
  transition: transform 0.1s ease;
}

.btn:active:not(:disabled) {
  transform: scale(0.985);
}

.btn--block {
  width: 100%;
}

.btn--primary {
  background: var(--amber);
  color: var(--amber-ink);
  font-weight: 700;
  font-size: 15.5px;
  line-height: 1.25;
  padding: 14px 12px;
}

.btn--primary:disabled {
  background: #4b5a4f;
  color: #8aa08e;
  cursor: not-allowed;
}

.btn--secondary {
  background: transparent;
  color: var(--chalk);
  border: 1px solid var(--line-strong);
  font-weight: 600;
  font-size: 14px;
  padding: 11px;
}

.btn--secondary:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.btn--text {
  background: none;
  color: var(--chalk-dim);
  font-size: 13px;
  padding: 6px 0;
  text-decoration: underline;
  text-underline-offset: 3px;
}
</style>
