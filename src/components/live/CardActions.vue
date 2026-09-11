<script setup>
import { computed, ref } from 'vue'
import CardGlyph from '@/components/ui/CardGlyph.vue'
import UiConfirmDialog from '@/components/ui/UiConfirmDialog.vue'
import { CARD_RED, CARD_YELLOW } from '@/domain/scoring.js'
import { useI18n } from '@/i18n/index.js'
import { useMatchStore } from '@/stores/match.js'

const match = useMatchStore()
const { t } = useI18n()

/**
 * The card and the player it is for, captured together when a colour is
 * tapped — so what the dialog asks about is exactly what gets recorded.
 */
const pending = ref(null)

const name = computed(() => match.playerName(match.cardCandidateId))

/** A card that ends the player's match: a red, or a second yellow. */
const pendingIsFinal = computed(() => {
  if (!pending.value) return false
  if (pending.value.type === CARD_RED) return true
  return (match.cardCountsById.get(pending.value.playerId)?.yellow ?? 0) >= 1
})

const message = computed(() => {
  if (!pending.value) return ''
  const who = match.playerName(pending.value.playerId)
  if (pending.value.type === CARD_RED) return t('redCardConfirm', who)
  return pendingIsFinal.value ? t('secondYellowConfirm', who) : t('yellowCardConfirm', who)
})

function ask(type) {
  pending.value = { type, playerId: match.cardCandidateId }
}

function confirm() {
  match.addCard(pending.value.playerId, pending.value.type)
  pending.value = null
  match.clearSelection()
}
</script>

<template>
  <!--
    Deliberately quiet: picking a player is usually the start of a substitution,
    so the cards sit to one side as small icons rather than competing with it.
    The chip already shows who is selected, so the name is not repeated here.
  -->
  <div class="card-actions">
    <span class="label">{{ t('cardsTitle') }}</span>
    <button
      type="button"
      class="card"
      :aria-label="`${t('yellowCardAria')}: ${name}`"
      :title="t('yellowCardAria')"
      @click="ask(CARD_YELLOW)"
    >
      <CardGlyph :type="CARD_YELLOW" :size="15" />
    </button>
    <button
      type="button"
      class="card"
      :aria-label="`${t('redCardAria')}: ${name}`"
      :title="t('redCardAria')"
      @click="ask(CARD_RED)"
    >
      <CardGlyph :type="CARD_RED" :size="15" />
    </button>
  </div>

  <!-- A red card sends the player off, so it is marked as the one that is final. -->
  <UiConfirmDialog
    v-if="pending"
    :message="message"
    :confirm-label="t('yesBtn')"
    :cancel-label="t('cancelBtn')"
    :tone="pendingIsFinal ? 'danger' : 'primary'"
    @confirm="confirm"
    @cancel="pending = null"
  />
</template>

<style scoped>
.card-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: var(--chalk-dim);
  margin-right: 2px;
}

/* Small and outlined: present when needed, never louder than a substitution. */
.card {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 40px;
  border-radius: 9px;
  border: 1px solid var(--line-strong);
  background: rgba(0, 0, 0, 0.16);
}

.card:active {
  transform: translateY(1px);
  background: rgba(0, 0, 0, 0.28);
}
</style>
