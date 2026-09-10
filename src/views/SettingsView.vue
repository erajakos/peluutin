<script setup>
import FormationPanel from '@/components/setup/FormationPanel.vue'
import MatchFormatPanel from '@/components/setup/MatchFormatPanel.vue'
import SetupProgress from '@/components/setup/SetupProgress.vue'
import SubstitutionRulesPanel from '@/components/setup/SubstitutionRulesPanel.vue'
import UiBackLink from '@/components/ui/UiBackLink.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiCheckLine from '@/components/ui/UiCheckLine.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const setup = useSetupStore()
const { t } = useI18n()
</script>

<template>
  <SetupProgress :step="2" />
  <UiBackLink @click="app.backToOpponent()">{{ t('backBtn') }}</UiBackLink>

  <h1 class="title settings-title">{{ t('settingsTitle') }}</h1>

  <MatchFormatPanel />
  <FormationPanel />
  <SubstitutionRulesPanel />

  <UiPanel :title="t('sectionCards')">
    <UiCheckLine v-model="setup.trackCards" tight>{{ t('trackCardsLabel') }}</UiCheckLine>
  </UiPanel>

  <UiButton size="lg" @click="app.openSquad()">{{ t('teamContinueBtn') }}</UiButton>
</template>

<style scoped>
.settings-title {
  margin-bottom: 20px;
}
</style>
