<script setup>
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'

defineProps({
  /** Rows from `playingTimeRows` — already sorted and annotated. */
  rows: { type: Array, required: true },
  minutesHeading: { type: String, required: true },
  showDelta: { type: Boolean, default: false },
})
const { t } = useI18n()

function sign(delta) {
  return delta >= 0 ? '+' : '−'
}
</script>

<template>
  <table class="table">
    <thead>
      <tr>
        <th>{{ t('tablePlayer') }}</th>
        <th class="right">{{ minutesHeading }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rows" :key="row.id">
        <td>
          {{ row.name }}
          <span v-if="row.isGoalkeeper" class="gk-tag">{{ t('gkTag') }}</span>
        </td>
        <td class="num">
          {{ formatTime(row.seconds) }}
          <span v-if="showDelta && !row.isGoalkeeper" class="delta" :class="`delta--${row.band}`">
            {{ sign(row.delta) }}{{ formatTime(Math.abs(row.delta)) }}
          </span>
        </td>
      </tr>
    </tbody>
  </table>
</template>

<style scoped>
.table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 8px;
}

.table th {
  text-align: left;
  font-size: 11px;
  letter-spacing: 0.3px;
  color: var(--chalk-dim);
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line-strong);
}

.table th.right {
  text-align: right;
}

.table td {
  padding: 10px 0;
  border-bottom: 1px solid var(--line);
  font-size: 15px;
}

.table td.num {
  font-family: var(--font-display);
  text-align: right;
}

/* Distance from the squad average: green is fair, red needs a word after. */
.delta {
  font-size: 12px;
  margin-left: 6px;
}

.delta--good {
  color: var(--go);
}

.delta--warn {
  color: var(--amber);
}

.delta--bad {
  color: var(--alert);
}

.gk-tag {
  font-size: 11px;
  color: var(--amber);
  display: block;
  margin-top: 1px;
}
</style>
