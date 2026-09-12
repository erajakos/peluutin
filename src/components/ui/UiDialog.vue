<script setup>
import { onBeforeUnmount, onMounted } from 'vue'

defineProps({
  /** What the dialog is, for a reader who cannot see it. */
  label: { type: String, required: true },
  /** 'alertdialog' when it asks a question that interrupts; 'dialog' otherwise. */
  role: {
    type: String,
    default: 'dialog',
    validator: (v) => ['dialog', 'alertdialog'].includes(v),
  },
})
const emit = defineEmits(['dismiss'])

function onKeydown(event) {
  if (event.key === 'Escape') emit('dismiss')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <!--
    Teleported to <body> so no ancestor's stacking or transform can clip it.
    Tapping the backdrop is the same as backing out.
  -->
  <Teleport to="body">
    <div class="backdrop" @click.self="emit('dismiss')">
      <div class="dialog" :role="role" aria-modal="true" :aria-label="label">
        <slot />
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(4, 18, 11, 0.62);
  backdrop-filter: blur(2px);
  animation: fade-in 0.16s ease-out;
}

.dialog {
  width: 100%;
  max-width: 360px;
  background: var(--panel);
  border: 1px solid var(--line-strong);
  border-radius: 14px;
  padding: 22px 18px 18px;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.5);
  animation: rise-in 0.2s cubic-bezier(0.2, 0.85, 0.25, 1);
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
}

@keyframes rise-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }
}

@media (prefers-reduced-motion: reduce) {
  .backdrop,
  .dialog {
    animation: none;
  }
}
</style>
