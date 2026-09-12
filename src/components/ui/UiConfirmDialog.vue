<script setup>
import { onMounted, ref } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiDialog from '@/components/ui/UiDialog.vue'

defineProps({
  message: { type: String, required: true },
  confirmLabel: { type: String, required: true },
  cancelLabel: { type: String, required: true },
  /** 'danger' for what cannot be undone; 'primary' for a normal next step. */
  tone: { type: String, default: 'primary', validator: (v) => ['primary', 'danger'].includes(v) },
})
const emit = defineEmits(['confirm', 'cancel'])

const cancelButton = ref(null)

onMounted(() => {
  // Focus the safe choice: an accidental Enter should back out, not commit.
  cancelButton.value?.$el?.focus()
})
</script>

<template>
  <UiDialog role="alertdialog" :label="message" @dismiss="emit('cancel')">
    <p class="message">{{ message }}</p>
    <div class="actions">
      <UiButton ref="cancelButton" variant="secondary" @click="emit('cancel')">
        {{ cancelLabel }}
      </UiButton>
      <UiButton :class="{ danger: tone === 'danger' }" @click="emit('confirm')">
        {{ confirmLabel }}
      </UiButton>
    </div>
  </UiDialog>
</template>

<style scoped>
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
</style>
