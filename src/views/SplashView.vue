<script setup>
import BrandMark from '@/components/BrandMark.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { AVAILABLE_LOCALES, useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'

const app = useAppStore()
const { t } = useI18n()
</script>

<template>
  <div class="splash">
    <BrandMark />
    <h1 class="wordmark">
      <span class="word">Melkein</span>
      <span class="word word--accent">suunnitelma</span>
    </h1>
    <p class="tagline">{{ t('appTagline') }}</p>

    <p class="choose">{{ t('splashTagline') }}</p>
    <div class="languages">
      <UiButton
        v-for="option in AVAILABLE_LOCALES"
        :key="option.code"
        :block="false"
        @click="app.chooseLanguage(option.code)"
      >
        {{ option.label }}
      </UiButton>
    </div>

    <!-- Said up front, before anything is typed in: nothing here leaves the device. -->
    <p class="local-badge">🔒 {{ t('localOnlyBadge') }}</p>
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

.wordmark {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(30px, 11vw, 44px);
  line-height: 0.98;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  margin: 0 0 12px;
  display: flex;
  flex-direction: column;
}

/* A hand-set wordmark: the second word nudged over, as if chalked in a hurry. */
.word--accent {
  color: var(--amber);
  margin-left: 14px;
}

.tagline {
  font-size: 15px;
  color: var(--chalk-dim);
  max-width: 300px;
  line-height: 1.5;
  margin: 0 0 40px;
}

.choose {
  font-size: 13px;
  color: var(--chalk-dim);
  margin: 0 0 12px;
}

.languages {
  display: flex;
  gap: 12px;
  width: 100%;
  max-width: 320px;
}

.languages :deep(.btn) {
  flex: 1;
  padding: 14px 20px;
}

.local-badge {
  font-size: 12.5px;
  color: var(--chalk-dim);
  margin: 34px 0 6px;
}

.info-link {
  background: none;
  color: var(--chalk-dim);
  font-size: 13px;
  text-decoration: underline;
  text-underline-offset: 3px;
  padding: 6px;
}
</style>
