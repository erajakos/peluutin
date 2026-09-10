<script setup>
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'

const app = useAppStore()
const { t } = useI18n()
</script>

<template>
  <button class="link-back" @click="app.closeInfo()">{{ t('backBtn') }}</button>

  <div class="eyebrow">{{ t('infoEyebrow') }}</div>
  <h1 class="title">{{ t('infoTitle') }}</h1>
  <p class="sub">{{ t('infoIntro') }}</p>

  <UiPanel>
    <h2 class="heading"><span class="icon">🔒</span>{{ t('privacyTitle') }}</h2>
    <p class="body">{{ t('privacyBody') }}</p>
    <p class="body body--strong">{{ t('privacyNoTracking') }}</p>
    <p class="body body--quiet">{{ t('privacyRefresh') }}</p>
  </UiPanel>

  <UiPanel>
    <h2 class="heading"><span class="icon">📱</span>{{ t('madeTitle') }}</h2>
    <p class="body">{{ t('madeBody') }}</p>
  </UiPanel>

  <UiPanel>
    <h2 class="heading"><span class="icon">✍️</span>{{ t('authorTitle') }}</h2>
    <p class="body">{{ t('authorBody') }}</p>
  </UiPanel>

  <UiPanel>
    <h2 class="heading"><span class="icon">🌱</span>{{ t('licenseTitle') }}</h2>
    <p class="body">{{ t('licenseBody') }}</p>
  </UiPanel>

  <UiButton @click="app.closeInfo()">{{ t('backBtn') }}</UiButton>
</template>

<style scoped>
.heading {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
}

.icon {
  font-size: 16px;
}

.body {
  font-size: 14px;
  line-height: 1.6;
  color: var(--chalk-dim);
  margin: 0 0 10px;
}

.body:last-child {
  margin-bottom: 0;
}

.body--strong {
  color: var(--chalk);
  font-weight: 600;
}

.body--quiet {
  font-size: 13px;
  opacity: 0.85;
}
</style>
