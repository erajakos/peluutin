<script setup>
import { nextTick, ref } from 'vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import UiRemoveButton from '@/components/ui/UiRemoveButton.vue'
import { useI18n } from '@/i18n/index.js'
import { useSetupStore } from '@/stores/setup.js'

const setup = useSetupStore()
const { t } = useI18n()

const newPlayer = ref('')
const input = ref(null)

/** Keep focus in the field so a whole squad can be typed without reaching for the mouse. */
async function add() {
  if (!setup.addPlayer(newPlayer.value)) return
  newPlayer.value = ''
  await nextTick()
  input.value?.focus()
}
</script>

<template>
  <UiPanel>
    <span class="field-label">{{ t('squadLabel') }}</span>

    <div class="add-row">
      <input
        ref="input"
        v-model="newPlayer"
        class="field"
        :placeholder="t('playerNamePlaceholder')"
        @keydown.enter.prevent="add"
      />
      <button class="add-btn" :aria-label="t('addPlayerAria')" @click="add">+</button>
    </div>

    <ul class="roster">
      <li v-for="player in setup.roster" :key="player.id" class="roster-item">
        <span>{{ player.name }}</span>
        <UiRemoveButton :label="t('removeAria')" @click="setup.removePlayer(player.id)" />
      </li>
    </ul>

    <p class="count-note">{{ t('rosterCountNote', setup.roster.length, setup.fieldSize) }}</p>
  </UiPanel>
</template>

<style scoped>
.add-row {
  display: flex;
  gap: 8px;
  margin-bottom: 6px;
}

.add-row .field {
  flex: 1;
}

.add-btn {
  background: var(--go);
  color: #08281a;
  font-weight: 700;
  padding: 0 16px;
  border-radius: var(--radius-sm);
  font-size: 20px;
}

.roster {
  list-style: none;
  margin: 0 0 12px;
  padding: 0;
}

.roster-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 4px;
  border-bottom: 1px solid var(--line);
  font-size: 15px;
}

.roster-item:last-child {
  border-bottom: none;
}
</style>
