<template>
  <!--
    Chalk-drawn pitch, seen from behind our own goal: we attack up the screen.
    Purely decorative, so it is hidden from assistive technology — the player
    chips on top carry all the information.
  -->
  <svg class="markings" viewBox="0 0 100 112" aria-hidden="true" focusable="false">
    <rect x="3" y="3" width="94" height="106" rx="2" />
    <line x1="3" y1="56" x2="97" y2="56" />
    <circle cx="50" cy="56" r="12" />
    <circle class="spot" cx="50" cy="56" r="0.9" />

    <!-- Opponent's end -->
    <rect x="24" y="3" width="52" height="17" />
    <rect x="38" y="3" width="24" height="6" />
    <circle class="spot" cx="50" cy="13" r="0.9" />
    <path d="M 38 20 A 12 12 0 0 0 62 20" />

    <!-- Our end -->
    <rect x="24" y="92" width="52" height="17" />
    <rect x="38" y="103" width="24" height="6" />
    <circle class="spot" cx="50" cy="99" r="0.9" />
    <path d="M 38 92 A 12 12 0 0 1 62 92" />

    <!-- Corner arcs -->
    <path d="M 3 6 A 3 3 0 0 0 6 3" />
    <path d="M 94 3 A 3 3 0 0 0 97 6" />
    <path d="M 97 106 A 3 3 0 0 0 94 109" />
    <path d="M 6 109 A 3 3 0 0 0 3 106" />
  </svg>
</template>

<style scoped>
.markings {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.markings :is(rect, circle, line, path) {
  fill: none;
  stroke: rgba(241, 250, 238, 0.22);
  stroke-width: 0.6;
  stroke-linecap: round;
}

.markings .spot {
  fill: rgba(241, 250, 238, 0.3);
  stroke: none;
}
</style>
