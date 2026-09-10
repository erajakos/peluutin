<script setup>
import PlayerRow from '@/components/live/PlayerRow.vue'
import SubstitutionActions from '@/components/live/SubstitutionActions.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()

/**
 * A player already used up under a no-re-entry rule is marked OUT and locked;
 * otherwise the least-rested player carries the DUE ON prompt.
 */
function badgeFor(player) {
  if (!match.canPlayerReturn(player.id)) return { text: t('outBadge'), tone: 'off' }
  if (match.hints.dueOnPlayerIds.has(player.id)) return { text: t('dueOnBadge'), tone: 'on' }
  return { text: '', tone: 'on' }
}
</script>

<template>
  <UiPanel :title="t('benchTitle')">
    <template v-if="match.bench.length">
      <PlayerRow
        v-for="player in match.bench"
        :key="player.id"
        :name="player.name"
        :seconds="player.seconds"
        :meta="t('restingFor', formatTime(player.stintSeconds))"
        :selected="match.selectedOnPlayerIds.has(player.id)"
        :selectable="match.canPlayerReturn(player.id) && !match.limitReached"
        :badge="badgeFor(player).text"
        :badge-tone="badgeFor(player).tone"
        @toggle="match.toggleOnPlayer(player.id)"
      />
    </template>
    <p v-else class="count-note">{{ t('benchEmpty') }}</p>

    <SubstitutionActions />
  </UiPanel>
</template>

