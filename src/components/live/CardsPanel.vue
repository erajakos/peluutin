<script setup>
import CardGlyph from '@/components/ui/CardGlyph.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import UiRemoveButton from '@/components/ui/UiRemoveButton.vue'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()
</script>

<template>
  <!--
    The record of cards shown, with a way to take one back. Cards are issued
    from the pitch: tap the player, then the colour.
  -->
  <UiPanel :title="t('cardsTitle')">
    <div v-for="card in match.cards" :key="card.id" class="card-row">
      <span class="card-time clock-face">{{ formatTime(card.atSecond) }}</span>
      <CardGlyph :type="card.type" />
      <span class="card-name">{{ match.playerName(card.playerId) }}</span>
      <UiRemoveButton :label="t('removeAria')" @click="match.removeCard(card.id)" />
    </div>
    <p v-if="!match.cards.length" class="count-note">{{ t('noCardsNote') }}</p>
  </UiPanel>
</template>

<style scoped>
.card-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
  font-size: 15.5px;
}

.card-row:last-child {
  border-bottom: none;
}

.card-time {
  width: 44px;
  flex-shrink: 0;
  color: var(--chalk-dim);
  font-size: 15px;
}

.card-name {
  flex: 1;
  font-weight: 600;
}
</style>
