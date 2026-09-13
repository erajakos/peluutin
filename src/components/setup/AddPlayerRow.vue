<script setup>
import { nextTick, ref } from 'vue'
import { useI18n } from '@/i18n/index.js'
import { useSetupStore } from '@/stores/setup.js'

const setup = useSetupStore()
const { t } = useI18n()
const emit = defineEmits(['added'])

const name = ref('')
const input = ref(null)

/**
 * A player typed in here joins the team, wherever "here" is: a child who turns
 * up at the ground is in the squad from now on, not a guest for the afternoon.
 * Keep focus in the field so a whole squad can be typed without reaching away.
 */
async function add() {
  if (!setup.addPlayer(name.value)) return
  name.value = ''
  emit('added')
  await nextTick()
  input.value?.focus()
}
</script>

<template>
  <div class="add-row">
    <input
      ref="input"
      v-model="name"
      class="field field--lg"
      :placeholder="t('playerNamePlaceholder')"
      @keydown.enter.prevent="add"
    />
    <button class="add-btn" :aria-label="t('addPlayerAria')" @click="add">+</button>
  </div>
</template>

<style scoped>
.add-row {
  display: flex;
  gap: 10px;
}

.add-row .field {
  flex: 1;
  min-width: 0;
}

.add-btn {
  flex-shrink: 0;
  width: 62px;
  border-radius: 10px;
  background: var(--go);
  color: #08281a;
  font-weight: 700;
  font-size: 26px;
}

.add-btn:active {
  transform: translateY(1px);
}
</style>
