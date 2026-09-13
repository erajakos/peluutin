<script setup>
import { computed } from 'vue'
import PlayingTimeTable from '@/components/summary/PlayingTimeTable.vue'
import CardMarks from '@/components/ui/CardMarks.vue'
import { matchdaySummary } from '@/domain/matchday.js'
import { useI18n } from '@/i18n/index.js'

const props = defineProps({
  match: { type: Object, required: true },
})
const { t } = useI18n()

/** A day of exactly one match sums it up in the terms already written. */
const summary = computed(() => matchdaySummary([props.match]))

const scorers = computed(() => {
  const { entries, unknown } = summary.value.scorers
  const items = entries.map((entry) => `${entry.name} ×${entry.count}`)
  if (unknown) items.push(`${t('unknownScorerOption')} ×${unknown}`)
  return items
})
</script>

<template>
  <div class="detail">
    <p v-if="scorers.length" class="line">
      <span class="label">{{ t('topScorersTitle') }}</span>
      {{ scorers.join(', ') }}
    </p>

    <div v-if="summary.cards.length" class="line">
      <span class="label">{{ t('cardsSummaryTitle') }}</span>
      <span v-for="entry in summary.cards" :key="entry.id" class="booked">
        {{ entry.name }}
        <CardMarks :counts="entry" :size="13" />
      </span>
    </div>

    <PlayingTimeTable :rows="summary.minutes" :minutes-heading="t('tableMinutes')" />
  </div>
</template>

<style scoped>
.detail {
  padding: 4px 0 10px;
  animation: detail-in 0.18s ease-out;
}

@keyframes detail-in {
  from {
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .detail {
    animation: none;
  }
}

.line {
  font-size: 15px;
  font-weight: 500;
  color: var(--chalk);
  margin: 0 0 10px;
}

.label {
  display: block;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.1px;
  text-transform: uppercase;
  color: var(--amber-text);
  margin-bottom: 3px;
}

.booked {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  margin-right: 12px;
}
</style>
