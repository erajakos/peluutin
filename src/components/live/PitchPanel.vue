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
  <UiPanel :title="t('onFieldTitle')">
    <PitchMap v-if="match.slots.length" />
    <CardActions v-if="setup.trackCards && match.cardCandidateId !== null" />
    <p v-else class="count-note">{{ t('noOneOnField') }}</p>
  </UiPanel>
</template>
