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
  /** 'lg' for a screen's single, obvious action. */
  size: { type: String, default: 'md', validator: (value) => ['md', 'lg'].includes(value) },
})
</script>

<template>
  <button
    type="button"
    :class="['btn', `btn--${variant}`, `btn--${size}`, { 'btn--block': block }]"
    :disabled="disabled"
  >
    <slot />
  </button>
</template>

<style scoped>
.btn {
  font-family: inherit;
  font-weight: 700;
  border-radius: 10px;
  min-height: 50px;
  padding: 13px 18px;
  font-size: 16.5px;
  line-height: 1.25;
  transition:
    transform 0.1s ease,
    background 0.12s ease,
    border-color 0.12s ease;
}

.btn--block {
  width: 100%;
}

.btn:active:not(:disabled) {
  transform: translateY(1px);
}

/* The action the screen exists for: solid, with a lip so it reads as raised. */
.btn--primary {
  background: var(--amber);
  color: var(--amber-ink);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.28);
}

.btn--primary:disabled {
  background: #405044;
  color: #85997f;
  box-shadow: none;
  cursor: not-allowed;
}

/* An equal-weight alternative: same shape, outlined instead of filled. */
.btn--secondary {
  background: rgba(0, 0, 0, 0.16);
  color: var(--chalk);
  border: 1.5px solid var(--line-strong);
}

.btn--secondary:active:not(:disabled) {
  background: rgba(0, 0, 0, 0.28);
}

.btn--secondary:disabled {
  opacity: 0.42;
  cursor: not-allowed;
}

/* Not really a button: a way out, kept quiet on purpose. */
.btn--text {
  background: none;
  color: var(--chalk-dim);
  font-weight: 500;
  font-size: 15px;
  min-height: 0;
  padding: 8px 4px;
  text-decoration: underline;
  text-underline-offset: 3px;
}

.btn--lg {
  font-size: 17.5px;
  min-height: 58px;
  padding: 18px 20px;
}
</style>
