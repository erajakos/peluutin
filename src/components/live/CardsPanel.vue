<script setup>
import { computed, ref } from 'vue'
import PlayerPicker from '@/components/live/PlayerPicker.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import UiRemoveButton from '@/components/ui/UiRemoveButton.vue'
import { CARD_RED, CARD_YELLOW } from '@/domain/scoring.js'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'
import { useSetupStore } from '@/stores/setup.js'

const match = useMatchStore()
const setup = useSetupStore()
const { t } = useI18n()

/** Colour chosen first, player second — a referee shows the card before you look. */
const pendingType = ref(null)

const prompt = computed(() =>
  pendingType.value === CARD_RED ? t('redCardAria') : t('yellowCardAria'),
)

function issue(playerId) {
  match.addCard(playerId, pendingType.value)
  pendingType.value = null
}

function icon(type) {
  return type === CARD_YELLOW ? '🟨' : '🟥'
}
</script>

<template>
  <UiPanel>
    <div class="section-title">
      <h3>{{ t('cardsTitle') }}</h3>
    </div>

    <PlayerPicker
      v-if="pendingType"
      :players="setup.roster"
      :prompt="`${icon(pendingType)} ${prompt}`"
      @pick="issue"
      @cancel="pendingType = null"
    />
    <div v-else class="action-pair card-buttons">
      <button type="button" class="card-btn" @click="pendingType = CARD_YELLOW">
        🟨 {{ t('yellowCardAria') }}
      </button>
      <button type="button" class="card-btn" @click="pendingType = CARD_RED">
        🟥 {{ t('redCardAria') }}
      </button>
    </div>

    <div v-for="card in match.cards" :key="card.id" class="card-row">
      <span class="card-time clock-face">{{ formatTime(card.atSecond) }}</span>
      <span class="card-icon">{{ icon(card.type) }}</span>
      <span class="card-name">{{ match.playerName(card.playerId) }}</span>
      <UiRemoveButton :label="t('removeAria')" @click="match.removeCard(card.id)" />
    </div>
    <p v-if="!match.cards.length" class="count-note">{{ t('noCardsNote') }}</p>
  </UiPanel>
</template>

<style scoped>
.card-buttons {
  margin-bottom: 10px;
}

.card-btn {
  padding: 12px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  background: var(--field-bg);
  border: 1px solid var(--line-strong);
  color: var(--chalk);
}

.card-btn:active {
  transform: scale(0.98);
}

.card-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
}

.card-row:last-child {
  border-bottom: none;
}

.card-time {
  width: 42px;
  flex-shrink: 0;
  color: var(--chalk-dim);
  font-size: 14px;
}

.card-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.card-name {
  flex: 1;
}
</style>
