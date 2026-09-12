<script setup>
import PlayerRow from '@/components/live/PlayerRow.vue'
import SubstitutionActions from '@/components/live/SubstitutionActions.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()

/**
 * A sent-off player is marked and locked, as is one already used up under a
 * no-re-entry rule; otherwise the least-rested player carries the DUE ON prompt.
 */
function badgeFor(player) {
  if (match.sentOff.has(player.id)) return { text: t('sentOffBadge'), tone: 'off' }
  if (!match.canPlayerReturn(player.id)) return { text: t('outBadge'), tone: 'off' }
  if (match.hints.dueOnPlayerIds.has(player.id)) return { text: t('dueOnBadge'), tone: 'on' }
  return { text: '', tone: 'on' }
}
</script>

<template>
  <UiPanel :title="t('benchTitle')">
    <!--
      A list with headings rather than a caption on every row: the first number
      is how long this player has been sitting right now — the question a bench
      actually asks — and the second their total for the match.
    -->
    <div class="bench">
      <div class="head">
        <span>{{ t('tablePlayer') }}</span>
        <span class="num">{{ t('benchedHeading') }}</span>
        <span class="num">{{ t('playedHeading') }}</span>
        <span />
      </div>

      <PlayerRow
        v-for="player in match.bench"
        :key="player.id"
        :name="player.name"
        :seconds="player.stintSeconds"
        :total-seconds="player.seconds"
        :cards="match.cardCountsById.get(player.id) ?? null"
        :selected="match.selectedOnPlayerIds.has(player.id)"
        :selectable="match.canPlayerReturn(player.id) && !match.limitReached"
        :badge="badgeFor(player).text"
        :badge-tone="badgeFor(player).tone"
        @toggle="match.toggleOnPlayer(player.id)"
      />
    </div>

    <SubstitutionActions />
  </UiPanel>
</template>

<style scoped>
/*
 * One grid for the headings and every row under them, so the columns line up
 * without the row component and this list each guessing the other's widths.
 */
.bench {
  --bench-grid: minmax(0, 1fr) 58px 58px 24px;
}

.head {
  display: grid;
  grid-template-columns: var(--bench-grid);
  align-items: end;
  gap: 12px;
  padding: 0 12px 8px;
  margin: 0 -12px;
  border-bottom: 1px solid var(--line-strong);
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.4px;
  color: var(--chalk-dim);
}

.head .num {
  text-align: right;
}
</style>
