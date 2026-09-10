<template>
  <!--
    A real control, not a stray line of grey text: bordered, thumb-sized, and
    obviously tappable at the top of a screen you can leave.
  -->
  <button type="button" class="back">
    <svg class="chevron" width="15" height="15" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M14.5 5.5 8 12l6.5 6.5" />
    </svg>
    <span><slot /></span>
  </button>
</template>

<style scoped>
.back {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 14px 8px 10px;
  margin-bottom: 20px;
  border-radius: 999px;
  border: 1px solid var(--line-strong);
  background: rgba(0, 0, 0, 0.18);
  color: var(--chalk);
  font-size: 14.5px;
  font-weight: 600;
  transition:
    background 0.12s ease,
    transform 0.1s ease;
}

.back:active {
  transform: scale(0.97);
  background: rgba(0, 0, 0, 0.3);
}

.chevron {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
