<script setup>
import { ref } from 'vue'
import AddPlayerRow from '@/components/setup/AddPlayerRow.vue'
import UiConfirmDialog from '@/components/ui/UiConfirmDialog.vue'
import { useI18n } from '@/i18n/index.js'
import { useSetupStore } from '@/stores/setup.js'

const setup = useSetupStore()
const { t } = useI18n()

const confirmingClear = ref(false)
const emit = defineEmits(['change'])

function remove(id) {
  setup.removePlayer(id)
  emit('change')
}

/** The squad is remembered, so a different group of players starts from empty. */
function clearRoster() {
  setup.clearRoster()
  confirmingClear.value = false
  emit('change')
}
</script>

<template>
  <!--
    The squad of whichever team is being coached. The same editor serves the
    setup screen and the team list, because it is the same squad either way.
  -->
  <AddPlayerRow @added="emit('change')" />

  <!-- Names as chips: a squad reads faster across than down. -->
  <ul v-if="setup.roster.length" class="roster">
    <li v-for="player in setup.roster" :key="player.id" class="chip">
      <span>{{ player.name }}</span>
      <button
        type="button"
        class="chip-remove"
        :aria-label="`${t('removeAria')}: ${player.name}`"
        @click="remove(player.id)"
      >
        &times;
      </button>
    </li>
  </ul>

  <div class="count-row">
    <slot name="count" />
    <button
      v-if="setup.roster.length"
      type="button"
      class="clear-all"
      @click="confirmingClear = true"
    >
      {{ t('clearRosterBtn') }}
    </button>
  </div>

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

/* Rarely needed, so it stays quiet: plain text, off to the side. */
.clear-all {
  flex-shrink: 0;
  margin-left: auto;
  background: none;
  color: var(--chalk-dim);
  font-size: 15px;
  font-weight: 600;
  padding: 6px 0 6px 10px;
}
</style>
