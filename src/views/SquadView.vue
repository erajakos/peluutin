<script setup>
import { nextTick, ref } from 'vue'
import SetupProgress from '@/components/setup/SetupProgress.vue'
import UiBackLink from '@/components/ui/UiBackLink.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiConfirmDialog from '@/components/ui/UiConfirmDialog.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const setup = useSetupStore()
const { t } = useI18n()

const newPlayer = ref('')
const input = ref(null)
const error = ref('')
const confirmingClear = ref(false)

/** Keep focus in the field so a whole squad can be typed without reaching away. */
async function add() {
  if (!setup.addPlayer(newPlayer.value)) return
  newPlayer.value = ''
  error.value = ''
  await nextTick()
  input.value?.focus()
}

/** The squad is remembered, so a different group of players starts from empty. */
function clearRoster() {
  setup.clearRoster()
  confirmingClear.value = false
  error.value = ''
}

function submit() {
  if (app.openLineup()) error.value = ''
  else error.value = t('setupErrorNote', setup.fieldSize, setup.roster.length)
}
</script>

<template>
  <SetupProgress :step="3" />
  <UiBackLink @click="app.backToSettings()">{{ t('backBtn') }}</UiBackLink>

  <h1 class="title squad-title">{{ t('squadTitle') }}</h1>

  <div class="add-row">
    <input
      ref="input"
      v-model="newPlayer"
      class="field field--lg"
      :placeholder="t('playerNamePlaceholder')"
      @keydown.enter.prevent="add"
    />
    <button class="add-btn" :aria-label="t('addPlayerAria')" @click="add">+</button>
  </div>

  <!-- Names as chips: a squad reads faster across than down. -->
  <ul v-if="setup.roster.length" class="roster">
    <li v-for="player in setup.roster" :key="player.id" class="chip">
      <span>{{ player.name }}</span>
      <button
        type="button"
        class="chip-remove"
        :aria-label="`${t('removeAria')}: ${player.name}`"
        @click="setup.removePlayer(player.id)"
      >
        &times;
      </button>
    </li>
  </ul>

  <div class="count-row">
    <p class="count" :class="{ 'count--ready': setup.hasEnoughPlayers }">
      {{ t('rosterCountNote', setup.roster.length, setup.fieldSize) }}
    </p>
    <button
      v-if="setup.roster.length"
      type="button"
      class="clear-all"
      @click="confirmingClear = true"
    >
      {{ t('clearRosterBtn') }}
    </button>
  </div>

  <p class="error">{{ error }}</p>

  <UiButton size="lg" :disabled="!setup.hasEnoughPlayers" @click="submit">
    {{ t('continueBtn') }}
  </UiButton>

  <UiConfirmDialog
    v-if="confirmingClear"
    :message="t('clearRosterConfirm')"
    :confirm-label="t('yesBtn')"
    :cancel-label="t('cancelBtn')"
    tone="danger"
    @confirm="clearRoster"
    @cancel="confirmingClear = false"
  />
</template>

<style scoped>
.squad-title {
  margin-bottom: 20px;
}

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

.roster {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 0 0;
  padding: 0;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 9px 6px 9px 15px;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line-strong);
  font-size: 16.5px;
  font-weight: 600;
}

.chip-remove {
  background: none;
  color: var(--chalk-dim);
  font-size: 19px;
  line-height: 1;
  padding: 2px 9px;
}

.count-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

.count {
  font-size: 15px;
  font-weight: 500;
  color: var(--chalk-dim);
  margin: 0;
}

/* Rarely needed, so it stays quiet: plain text, off to the side. */
.clear-all {
  flex-shrink: 0;
  background: none;
  color: var(--chalk-dim);
  font-size: 15px;
  font-weight: 600;
  padding: 6px 0 6px 10px;
}

.count--ready {
  color: var(--go);
}

.error {
  font-size: 15px;
  font-weight: 600;
  color: var(--alert);
  min-height: 20px;
  margin: 8px 0 14px;
}
</style>
