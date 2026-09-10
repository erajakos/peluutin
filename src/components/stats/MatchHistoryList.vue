<script setup>
import { resultOf } from '@/domain/scoring.js'
import { useI18n } from '@/i18n/index.js'

defineProps({
  matches: { type: Array, required: true },
  teamName: { type: String, required: true },
})
const { t } = useI18n()

const TAG_KEYS = { win: 'resultTagWin', draw: 'resultTagDraw', loss: 'resultTagLoss' }

function result(match) {
  return resultOf(match.usScore, match.opponentScore)
}
</script>

<template>
  <div v-for="match in matches" :key="match.id" class="row">
    <span class="fixture">{{ teamName }} vs {{ match.opponent }}</span>
    <span class="score">
      {{ match.usScore }}–{{ match.opponentScore }}
      <span class="tag" :class="`tag--${result(match)}`">{{ t(TAG_KEYS[result(match)]) }}</span>
    </span>
  </div>
  <p v-if="!matches.length" class="count-note">{{ t('noMatchesNote') }}</p>
</template>

<style scoped>
.row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 9px 0;
  border-bottom: 1px solid var(--line);
  font-size: 15.5px;
}

.row:last-child {
  border-bottom: none;
}

.fixture {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score {
  flex-shrink: 0;
}

.tag {
  font-size: 13.5px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 4px;
  margin-left: 8px;
}

.tag--win {
  background: rgba(95, 190, 139, 0.18);
  color: var(--go);
}

.tag--draw {
  background: rgba(169, 198, 190, 0.18);
  color: var(--chalk-dim);
}

.tag--loss {
  background: rgba(233, 105, 79, 0.18);
  color: var(--alert);
}
</style>
