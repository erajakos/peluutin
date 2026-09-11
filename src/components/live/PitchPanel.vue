<script setup>
import CardActions from '@/components/live/CardActions.vue'
import PitchMap from '@/components/live/PitchMap.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

import { useSetupStore } from '@/stores/setup.js'

const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()
</script>

<template>
  <!--
    No empty state: the live screen is only reached with a complete lineup.
    (An empty-state paragraph here once paired its v-else with the card
    buttons instead of the pitch, and showed "no one on the field" whenever
    no player was selected.)
  -->
  <UiPanel :title="t('onFieldTitle')">
    <PitchMap />
    <CardActions v-if="setup.trackCards && match.cardCandidateId !== null" />
  </UiPanel>
</template>
