<script setup>
defineProps({
  usName: { type: String, required: true },
  opponentName: { type: String, required: true },
  usScore: { type: Number, required: true },
  opponentScore: { type: Number, required: true },
})
</script>

<template>
  <div class="score-line">
    <div class="side">
      <div class="score clock-face">{{ usScore }}</div>
      <div class="team">{{ usName }}</div>
    </div>
    <div class="dash clock-face">–</div>
    <div class="side">
      <div class="score clock-face">{{ opponentScore }}</div>
      <div class="team">{{ opponentName }}</div>
    </div>
  </div>
</template>

<style scoped>
.score-line {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 14px;
}

.side {
  flex: 1;
  text-align: center;
  min-width: 0;
}

.score {
  font-size: 40px;
  line-height: 1;
}

.team {
  font-size: 12px;
  color: var(--chalk-dim);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin-top: 2px;
}

.dash {
  font-size: 26px;
  color: var(--chalk-dim);
}
</style>
