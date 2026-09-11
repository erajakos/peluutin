<script setup>
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'

defineProps({
  /** Rows from `playingTimeRows` — already sorted and annotated. */
  rows: { type: Array, required: true },
  minutesHeading: { type: String, required: true },
  showDelta: { type: Boolean, default: false },
  /** Marked with an armband, when the match had one. */
  captainId: { type: Number, default: null },
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
          <span
            v-if="captainId !== null && row.id === captainId"
            class="armband"
            :title="t('captainLabel')"
            :aria-label="t('captainLabel')"
          >
            C
          </span>
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
  font-size: 14px;
  letter-spacing: 0.4px;
  color: var(--chalk-dim);
  font-weight: 700;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--line-strong);
}

.table th.right {
  text-align: right;
}

.table td {
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
  font-size: 16.5px;
}

.table td.num {
  font-family: var(--font-display);
  text-align: right;
}

/* Distance from the squad average: green is fair, red needs a word after. */
.delta {
  font-size: 14.5px;
  font-weight: 600;
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

/* The captain's armband: the one mark every football fan already reads. */
.armband {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin-left: 8px;
  border-radius: 5px;
  border: 1.5px solid var(--amber);
  color: var(--amber-text);
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  vertical-align: 2px;
}

.gk-tag {
  font-size: 14px;
  font-weight: 600;
  color: var(--amber-text);
  display: block;
  margin-top: 2px;
}
</style>
