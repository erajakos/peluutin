<script setup>
import UiButton from '@/components/ui/UiButton.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'

const app = useAppStore()
const { t } = useI18n()

/**
 * Written as the app behaves, not as it once did: whenever the way a match is
 * run changes, these sentences change with it. They are one list in the locale
 * file for exactly that reason — there is one place to keep true.
 */
</script>

<template>
  <h1 class="title">{{ t('helpTitle') }}</h1>
  <p class="body intro">{{ t('helpIntro') }}</p>

  <section v-for="(section, index) in t('helpSections')" :key="section.title" class="block">
    <span class="step">{{ index + 1 }}</span>
    <h2 class="label">{{ section.title }}</h2>
    <p class="body">{{ section.body }}</p>
  </section>

  <UiButton variant="secondary" @click="app.closePage()">{{ t('backBtn') }}</UiButton>
</template>

<style scoped>
.title {
  margin-bottom: 14px;
  text-align: center;
}

.block {
  position: relative;
  margin-top: 22px;
  padding-top: 18px;
  padding-left: 38px;
  border-top: 1px solid var(--line);
}

.block:last-of-type {
  margin-bottom: 30px;
}

.step {
  position: absolute;
  left: 0;
  top: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: rgba(232, 163, 61, 0.16);
  border: 1px solid rgba(232, 163, 61, 0.5);
  color: var(--amber-text);
  font-size: 14px;
  font-weight: 700;
}

.label {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--amber-text);
  margin: 0 0 8px;
}

.body {
  font-size: 16.5px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--chalk-dim);
  margin: 0;
}

.intro {
  color: var(--chalk);
  text-align: center;
  margin-bottom: 4px;
}
</style>
