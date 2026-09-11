<script setup>
import { useI18n } from '@/i18n/index.js'

defineProps({
  result: { type: String, required: true, validator: (v) => ['win', 'draw', 'loss'].includes(v) },
  size: { type: Number, default: 24 },
})
const { t } = useI18n()

const LETTER_KEYS = { win: 'resultTagWin', draw: 'resultTagDraw', loss: 'resultTagLoss' }
</script>

<template>
  <!--
    The form guide every football fan already reads: a coloured disc with the
    result's initial. Green won, grey drew, red lost — the colour says it before
    the letter is read.
  -->
  <span
    class="result-badge"
    :class="`result-badge--${result}`"
    :style="{ width: `${size}px`, height: `${size}px`, fontSize: `${Math.round(size * 0.56)}px` }"
    >{{ t(LETTER_KEYS[result]) }}</span
  >
</template>

<style scoped>
.result-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  font-weight: 700;
  line-height: 1;
  color: #0c2417;
}

.result-badge--win {
  background: var(--go);
}

.result-badge--draw {
  background: #b9cdc5;
}

.result-badge--loss {
  background: var(--alert);
  color: #2a0c05;
}
</style>
