<script setup>
import { computed } from 'vue'
import BallIcon from '@/components/ui/BallIcon.vue'
import { TEAM_US, runningScores } from '@/domain/scoring.js'
import { formatTime } from '@/domain/time.js'
import { useI18n } from '@/i18n/index.js'

const props = defineProps({
  goals: { type: Array, required: true },
  opponentName: { type: String, required: true },
  /** Resolves a player id to a name; ids may belong to players long since off. */
  resolveName: { type: Function, required: true },
})
const { t } = useI18n()

/** Every goal in order, each with the scoreline it produced and who got it. */
const entries = computed(() => {
  const scores = runningScores(props.goals)
  return props.goals.map((goal, index) => ({
    id: goal.id,
    atSecond: goal.atSecond,
    score: scores[index],
    ours: goal.team === TEAM_US,
    scorer:
      goal.team === TEAM_US
        ? goal.playerId
          ? props.resolveName(goal.playerId)
          : t('unknownScorerOption')
        : props.opponentName,
  }))
})
</script>

<template>
  <div
    v-for="entry in entries"
    :key="entry.id"
    class="goal"
    :class="{ 'goal--theirs': !entry.ours }"
  >
    <BallIcon />
    <span class="time clock-face">{{ formatTime(entry.atSecond) }}</span>
    <span class="score clock-face">{{ entry.score.us }}–{{ entry.score.opponent }}</span>
    <span class="scorer" :class="{ 'scorer--theirs': !entry.ours }">{{ entry.scorer }}</span>
  </div>
</template>

<style scoped>
.goal {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 0;
  border-bottom: 1px solid var(--line);
  font-size: 15.5px;
}

.goal:last-child {
  border-bottom: none;
}

.time {
  width: 46px;
  flex-shrink: 0;
  font-size: 15px;
  color: var(--chalk-dim);
}

.score {
  flex-shrink: 0;
  min-width: 48px;
  font-size: 18px;
  letter-spacing: 0.5px;
}

.scorer {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* A goal against: tinted, so the story of the match reads at a glance. */
.goal--theirs .score,
.goal--theirs .scorer {
  color: var(--against);
}

.scorer--theirs {
  font-weight: 500;
}
</style>
