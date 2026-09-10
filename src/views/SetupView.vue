<script setup>
import { ref } from 'vue'
import FormationPanel from '@/components/setup/FormationPanel.vue'
import MatchFormatPanel from '@/components/setup/MatchFormatPanel.vue'
import SquadPanel from '@/components/setup/SquadPanel.vue'
import SubstitutionRulesPanel from '@/components/setup/SubstitutionRulesPanel.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCheckLine from '@/components/ui/UiCheckLine.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const setup = useSetupStore()
const { t } = useI18n()

const error = ref('')

/** Both checks must pass before a lineup can be built at all. */
function submit() {
  setup.opponentName = setup.opponentName.trim()
  if (!setup.opponentName) {
    error.value = t('opponentRequired')
    return
  }
  if (!setup.hasEnoughPlayers) {
    error.value = t('setupErrorNote', setup.fieldSize, setup.roster.length)
    return
  }
  error.value = ''
  app.openLineup()
}
</script>

<template>
  <div class="eyebrow">{{ t('setupEyebrow') }}</div>
  <h1 class="title">{{ t('setupTitle') }}</h1>
  <p class="sub">{{ t('setupSub') }}</p>

  <MatchFormatPanel />
  <SubstitutionRulesPanel />

  <UiPanel>
    <UiCheckLine v-model="setup.trackCards" tight>{{ t('trackCardsLabel') }}</UiCheckLine>
  </UiPanel>

  <FormationPanel />
  <SquadPanel />

  <UiButton @click="submit">{{ t('continueBtn') }}</UiButton>
  <p class="error-note">{{ error }}</p>
</template>
