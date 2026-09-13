<script setup>
import { ref } from 'vue'
import AddPlayerRow from '@/components/setup/AddPlayerRow.vue'
import SetupProgress from '@/components/setup/SetupProgress.vue'
import UiBackLink from '@/components/ui/UiBackLink.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const setup = useSetupStore()
const { t } = useI18n()

const error = ref('')

function submit() {
  if (app.openLineup()) error.value = ''
  else error.value = t('setupErrorNote', setup.fieldSize, setup.attending.length)
}
</script>

<template>
  <SetupProgress :step="3" />
  <UiBackLink @click="app.backToSettings()">{{ t('backBtn') }}</UiBackLink>

  <h1 class="title squad-title">{{ t('squadTitle') }}</h1>

  <!--
    Who turned up, not who is in the team. Tapping a name leaves them out of
    this match and nothing more: a birthday party is not a transfer. Someone
    new typed in here does join the team, because that is what has happened.
  -->
  <AddPlayerRow @added="error = ''" />

  <ul v-if="setup.roster.length" class="roster">
    <li v-for="player in setup.roster" :key="player.id">
      <button
        type="button"
        class="chip"
        :class="{ 'chip--out': !setup.attendingIds.includes(player.id) }"
        :aria-pressed="setup.attendingIds.includes(player.id)"
        @click="setup.toggleAttending(player.id)"
      >
        <span class="mark" aria-hidden="true">
          <svg v-if="setup.attendingIds.includes(player.id)" viewBox="0 0 24 24">
            <path d="M5 12.5 10 17.5 19 7" />
          </svg>
        </span>
        {{ player.name }}
      </button>
    </li>
  </ul>

  <div class="count-row">
    <p class="count" :class="{ 'count--ready': setup.hasEnoughPlayers }">
      {{ t('rosterCountNote', setup.attending.length, setup.fieldSize) }}
    </p>
  </div>

  <p class="error">{{ error }}</p>

  <UiButton size="lg" :disabled="!setup.hasEnoughPlayers" @click="submit">
    {{ t('continueBtn') }}
  </UiButton>
</template>

<style scoped>
.squad-title {
  margin-bottom: 20px;
}

.roster {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 18px 0 0;
  padding: 0;
}

/* Here: filled and ticked. Not here: outlined and dim, but still in the team. */
.chip {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 15px 9px 11px;
  border-radius: 999px;
  background: var(--panel);
  border: 1px solid var(--line-strong);
  color: var(--chalk);
  font-size: 16.5px;
  font-weight: 600;
}

.chip--out {
  opacity: 0.45;
  background: none;
}

.mark {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 19px;
  height: 19px;
  border-radius: 50%;
  background: var(--go);
  border: 1.5px solid var(--go);
}

.chip--out .mark {
  background: none;
  border-color: var(--line-strong);
}

.mark svg {
  width: 12px;
  height: 12px;
  fill: none;
  stroke: #08281a;
  stroke-width: 3.2;
  stroke-linecap: round;
  stroke-linejoin: round;
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
