<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import CardsPanel from '@/components/live/CardsPanel.vue'
import ScorePanel from '@/components/live/ScorePanel.vue'
import { useI18n } from '@/i18n/index.js'
import { useSetupStore } from '@/stores/setup.js'

const emit = defineEmits(['close'])
const setup = useSetupStore()
const { t } = useI18n()

const closeButton = ref(null)

/**
 * A layer over the match rather than a second view of it: the pitch is what
 * this screen is for, and logging a goal is a detour back to it.
 */
function onKeydown(event) {
  if (event.key === 'Escape') emit('close')
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  closeButton.value?.focus()
})

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="sheet" role="dialog" aria-modal="true" :aria-label="t('eventsTitle')">
    <div class="inner">
      <header class="head">
        <h1 class="title">{{ t('eventsTitle') }}</h1>
        <button ref="closeButton" type="button" class="close" :aria-label="t('closeBtn')" @click="emit('close')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6 18 18M18 6 6 18" />
          </svg>
        </button>
      </header>

      <ScorePanel />
      <CardsPanel v-if="setup.trackCards" />
    </div>
  </div>
</template>

<style scoped>
.sheet {
  position: fixed;
  inset: 0;
  z-index: 20;
  background: var(--bg);
  overflow-y: auto;
  overscroll-behavior: contain;
}

.inner {
  max-width: var(--app-width);
  margin: 0 auto;
  padding: 0 16px 48px;
}

.head {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: var(--bg);
  padding: 18px 0 14px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.2px;
}

.close {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid var(--line-strong);
  color: var(--chalk);
}

.close svg {
  width: 20px;
  height: 20px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
}

.close:active {
  transform: scale(0.96);
}
</style>
