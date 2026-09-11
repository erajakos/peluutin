<script setup>
import ResultBadge from '@/components/ui/ResultBadge.vue'
import { resultOf } from '@/domain/scoring.js'
import { useI18n } from '@/i18n/index.js'

defineProps({
  matches: { type: Array, required: true },
  teamName: { type: String, required: true },
})
const { t } = useI18n()

function result(match) {
  return resultOf(match.usScore, match.opponentScore)
}
</script>

<template>
  <div v-for="match in matches" :key="match.id" class="match-row">
    <span class="fixture">{{ teamName }} vs {{ match.opponent }}</span>
    <span class="score">
      <span class="clock-face">{{ match.usScore }}–{{ match.opponentScore }}</span>
      <ResultBadge :result="result(match)" />
    </span>
  </div>
  <p v-if="!matches.length" class="count-note">{{ t('noMatchesNote') }}</p>
</template>

<style scoped>
.match-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 15.5px;
}

.match-row:last-child {
  border-bottom: none;
}

.fixture {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
  font-size: 17px;
}
</style>
