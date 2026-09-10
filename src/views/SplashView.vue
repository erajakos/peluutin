<script setup>
import BrandBadge from '@/components/BrandBadge.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'

const app = useAppStore()
const { t, tIn, locale, alternate } = useI18n()
</script>

<template>
  <div class="splash">
    <BrandBadge class="badge" />

    <UiButton class="start" :block="false" @click="app.chooseLanguage(locale)">
      {{ t('startBtn') }}
    </UiButton>

    <!-- Offered in the language it switches to, for the reader who needs it. -->
    <button type="button" class="switch" @click="app.chooseLanguage(alternate)">
      {{ tIn(alternate, 'continueInThisLanguage') }}
    </button>

    <!-- Said up front, before anything is typed in: nothing here leaves the device. -->
    <p class="local-badge">{{ t('localOnlyBadge') }}</p>
    <button type="button" class="info-link" @click="app.openInfo()">{{ t('infoLink') }}</button>
  </div>
</template>

<style scoped>
.splash {
  min-height: 82vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 20px 10px 10px;
  animation: splash-in 0.65s ease-out both;
}

@keyframes splash-in {
  from {
    opacity: 0;
    transform: translateY(10px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .splash {
    animation: none;
  }
}

.badge {
  width: min(64vw, 250px);
  margin-bottom: 40px;
}

.start {
  min-width: 210px;
  padding: 16px 40px;
  font-size: 17px;
}

.switch {
  background: none;
  color: var(--chalk-dim);
  font-size: 14px;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 12px 8px;
  margin-top: 6px;
}

.local-badge {
  font-size: 12.5px;
  color: var(--chalk-dim);
  margin: 40px 0 4px;
}

.info-link {
  background: none;
  color: var(--chalk-dim);
  font-size: 13px;
  font-weight: 500;
  padding: 8px;
}
</style>
