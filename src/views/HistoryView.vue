<script setup>
import { computed, ref } from 'vue'
import MatchDetail from '@/components/history/MatchDetail.vue'
import ResultBadge from '@/components/ui/ResultBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { resultOf } from '@/domain/scoring.js'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useHistoryStore } from '@/stores/history.js'

const app = useAppStore()
const history = useHistoryStore()
const { t, locale } = useI18n()

/** The day written out the way a calendar would: "la 12.9.2026". */
const dayFormat = computed(
  () =>
    new Intl.DateTimeFormat(locale.value === 'fi' ? 'fi-FI' : 'en-GB', {
      weekday: 'short',
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }),
)

/** One match open at a time: the list is for finding, the detail for reading. */
const openId = ref(null)

function toggle(id) {
  openId.value = openId.value === id ? null : id
}
</script>

<template>
  <h1 class="title">{{ t('historyTitle') }}</h1>

  <p v-if="!history.hasEntries" class="empty">{{ t('historyEmpty') }}</p>

  <UiPanel v-for="day in history.days" :key="day.key" :title="dayFormat.format(day.playedAt)">
    <p class="day-line">
      {{ t('historyDayNote', day.summary.played, day.summary.goalsFor, day.summary.goalsAgainst) }}
    </p>

    <div v-for="match in day.matches" :key="match.id" class="match">
      <button
        type="button"
        class="match-row"
        :aria-expanded="openId === match.id"
        @click="toggle(match.id)"
      >
        <span class="fixture">{{ match.opponent }}</span>
        <span class="score clock-face">{{ match.usScore }}–{{ match.opponentScore }}</span>
        <ResultBadge :result="resultOf(match.usScore, match.opponentScore)" />
        <span class="chevron" :class="{ 'chevron--open': openId === match.id }" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="m9.5 5.5 7 6.5-7 6.5" /></svg>
        </span>
      </button>

      <MatchDetail v-if="openId === match.id" :match="match" />
    </div>
  </UiPanel>

  <UiButton variant="secondary" @click="app.closePage()">{{ t('backBtn') }}</UiButton>
</template>

<style scoped>
.title {
  margin-bottom: 18px;
  text-align: center;
}

.empty {
  font-size: 16.5px;
  font-weight: 500;
  color: var(--chalk-dim);
  text-align: center;
  margin: 30px 0 34px;
}

.day-line {
  font-size: 14.5px;
  font-weight: 600;
  color: var(--chalk-dim);
  text-align: center;
  margin: -4px 0 10px;
}

.match {
  border-bottom: 1px solid var(--line);
}

.match:last-child {
  border-bottom: none;
}

.match-row {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 11px 0;
  background: none;
  color: var(--chalk);
  text-align: left;
  font-size: 16.5px;
}

.fixture {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}

.score {
  flex-shrink: 0;
  font-size: 17px;
}

.chevron {
  display: flex;
  flex-shrink: 0;
  color: var(--chalk-dim);
  transition: transform 0.15s ease;
}

.chevron svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chevron--open {
  transform: rotate(90deg);
}
</style>
