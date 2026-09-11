<script setup>
import BrandWordmark from '@/components/BrandWordmark.vue'
import { ref } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiConfirmDialog from '@/components/ui/UiConfirmDialog.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'

const app = useAppStore()
const { t } = useI18n()

/**
 * The page is a list of plain sections. Keeping it data-driven is what stops
 * it drifting back into a pile of one-off headings and boxes.
 */
const SECTIONS = [
  { label: 'privacyTitle', paragraphs: ['privacyBody', 'privacyNoTracking'], clearData: true },
  { label: 'installTitle', paragraphs: ['installBody', 'installIos'] },
  { label: 'madeTitle', paragraphs: ['madeBody'] },
  { label: 'authorTitle', paragraphs: ['authorBody'] },
  { label: 'licenseTitle', paragraphs: ['licenseBody'] },
]

/** What the privacy section promises, it also hands over: a way to wipe it all. */
const confirmingClear = ref(false)
</script>

<template>
  <BrandWordmark size="compact" class="wordmark" />
  <p class="body intro">{{ t('infoIntro') }}</p>

  <!--
    Two type styles for the whole page: a small amber section label and one
    body style. No boxes, no icons, no third weight.
  -->
  <section v-for="section in SECTIONS" :key="section.label" class="block">
    <h2 class="label">{{ t(section.label) }}</h2>
    <p v-for="key in section.paragraphs" :key="key" class="body">{{ t(key) }}</p>
    <button
      v-if="section.clearData"
      type="button"
      class="clear-data"
      @click="confirmingClear = true"
    >
      {{ t('clearDataBtn') }}
    </button>
  </section>

  <UiButton variant="secondary" @click="app.closeInfo()">{{ t('backBtn') }}</UiButton>

  <UiConfirmDialog
    v-if="confirmingClear"
    :message="t('clearDataConfirm')"
    :confirm-label="t('yesBtn')"
    :cancel-label="t('cancelBtn')"
    tone="danger"
    @confirm="app.forgetEverything()"
    @cancel="confirmingClear = false"
  />
</template>

<style scoped>
.wordmark {
  margin-top: 14px;
}

.label {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 1.4px;
  text-transform: uppercase;
  color: var(--amber-text);
  margin-bottom: 10px;
}

.body {
  font-size: 16.5px;
  font-weight: 500;
  line-height: 1.65;
  color: var(--chalk-dim);
  margin: 0 0 12px;
}

.body:last-child {
  margin-bottom: 0;
}

.intro {
  color: var(--chalk);
  margin-top: 14px;
}

.block {
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--line);
}

/* Outlined, not filled: it is there when wanted, never the eye's first stop. */
.clear-data {
  margin-top: 6px;
  padding: 11px 18px;
  border-radius: 10px;
  background: none;
  border: 1.5px solid rgba(233, 105, 79, 0.6);
  color: var(--against);
  font-size: 15.5px;
  font-weight: 600;
}

.clear-data:active {
  background: rgba(233, 105, 79, 0.12);
}

.block:last-of-type {
  margin-bottom: 32px;
}
</style>
