<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'

defineProps({
  message: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  cancelLabel: { type: String, required: true },
  /** 'danger' for what cannot be undone; 'primary' for a normal next step. */
  tone: { type: String, default: 'primary', validator: (v) => ['primary', 'danger'].includes(v) },
})
const emit = defineEmits(['confirm', 'cancel'])

const cancelButton = ref(null)

function onKeydown(event) {
  if (event.key === 'Escape') emit('cancel')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  // Focus the safe choice: an accidental Enter should back out, not commit.
  cancelButton.value?.$el?.focus()
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <!--
    Teleported to <body> so no ancestor's stacking or transform can clip it.
    Tapping the backdrop is the same as cancelling.
  -->
  <Teleport to="body">
    <div class="backdrop" @click.self="emit('cancel')">
      <div class="dialog" role="alertdialog" aria-modal="true" :aria-label="message">
        <p class="message">{{ message }}</p>
        <div class="actions">
          <UiButton ref="cancelButton" variant="secondary" @click="emit('cancel')">
            {{ cancelLabel }}
          </UiButton>
          <UiButton :class="{ danger: tone === 'danger' }" @click="emit('confirm')">
            {{ confirmLabel }}
          </UiButton>
        </div>
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

.message {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.35;
  text-align: center;
  color: var(--chalk);
  margin: 0 0 20px;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions > * {
  flex: 1;
}

/* Only for what cannot be taken back. */
.danger {
  background: var(--alert);
  color: #2b0d06;
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
