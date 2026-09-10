<script setup>
defineProps({
  size: { type: [Number, String], default: 18 },
})
</script>

<template>
  <!-- The same ball as the crest, reduced to what still reads at 18 pixels. -->
  <svg
    class="ball"
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    aria-hidden="true"
    focusable="false"
  >
    <circle class="sphere" cx="12" cy="12" r="9.2" />
    <polygon class="panel" points="12,8.1 15.7,10.8 14.3,15.2 9.7,15.2 8.3,10.8" />
    <g class="seams">
      <path d="M12 8.1V3.6" />
      <path d="m15.7 10.8 4.3-1.4" />
      <path d="m14.3 15.2 2.6 3.6" />
      <path d="m9.7 15.2-2.6 3.6" />
      <path d="M8.3 10.8 4 9.4" />
    </g>
  </svg>
</template>

<style scoped>
.ball {
  flex-shrink: 0;
  vertical-align: -3px;
}

.sphere {
  fill: var(--chalk);
}

.panel {
  fill: #10301e;
}

.seams path {
  fill: none;
  stroke: #10301e;
  stroke-width: 1.3;
  stroke-linecap: round;
}
</style>
