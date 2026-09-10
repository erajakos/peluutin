<script setup>
defineProps({
  usName: { type: String, required: true },
  opponentName: { type: String, required: true },
  usScore: { type: Number, required: true },
  opponentScore: { type: Number, required: true },
  /** 'compact' for the match header, 'full' for a panel. */
  size: { type: String, default: 'full', validator: (v) => ['compact', 'full'].includes(v) },
})
</script>

<template>
  <!--
    Laid out the way a broadcast does it: both sides named on one line, the
    score directly beneath, so a glance reads left-to-right as "us, them" and
    top-to-bottom as "who, how many".
  -->
  <div class="board" :class="`board--${size}`">
    <span class="team">{{ usName }}</span>
    <span />
    <span class="team">{{ opponentName }}</span>

    <span class="num clock-face">{{ usScore }}</span>
    <span class="dash clock-face">–</span>
    <span class="num clock-face">{{ opponentScore }}</span>
  </div>
</template>

<style scoped>
.board {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  column-gap: 10px;
  width: 100%;
}

.team {
  text-align: center;
  color: var(--chalk-dim);
  font-weight: 700;
  letter-spacing: 0.6px;
  text-transform: uppercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.num {
  text-align: center;
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

.dash {
  color: var(--chalk-dim);
  line-height: 1;
}

.board--full .team {
  font-size: 15px;
  margin-bottom: 4px;
}

.board--full .num {
  font-size: 46px;
}

.board--full .dash {
  font-size: 32px;
}

.board--compact .team {
  font-size: 15px;
  letter-spacing: 0.8px;
  margin-bottom: 2px;
}

.board--compact .num {
  font-size: 44px;
}

.board--compact .dash {
  font-size: 26px;
}
</style>
