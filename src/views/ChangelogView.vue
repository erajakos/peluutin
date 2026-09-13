<script setup>
import { computed } from 'vue'
import UiBackLink from '@/components/ui/UiBackLink.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { RELEASES } from '@/changelog.js'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'

const app = useAppStore()
const { t, locale } = useI18n()

const dayFormat = computed(
  () =>
    new Intl.DateTimeFormat(locale.value === 'fi' ? 'fi-FI' : 'en-GB', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
    }),
)

/** Newest first, each release in the reader's language. */
const releases = computed(() =>
  RELEASES.map((release) => ({
    ...release,
    ...(release[locale.value] ?? release.en),
    when: dayFormat.value.format(new Date(release.date)),
  })),
)
</script>

<template>
  <!-- A way out at the top as well as the foot: a page can be long. -->
  <UiBackLink @click="app.closePage()">{{ t('backBtn') }}</UiBackLink>

  <h1 class="title">{{ t('changelogTitle') }}</h1>

  <section v-for="release in releases" :key="release.version" class="release">
    <p class="stamp">
      <span class="version">{{ release.version }}</span>
      <span class="when">{{ release.when }}</span>
    </p>
    <h2 class="name">{{ release.title }}</h2>
    <ul class="changes">
      <li v-for="change in release.changes" :key="change">{{ change }}</li>
    </ul>
  </section>

  <UiButton variant="secondary" @click="app.closePage()">{{ t('backBtn') }}</UiButton>
</template>

<style scoped>
.title {
  margin-bottom: 18px;
  text-align: center;
}

.release {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid var(--line);
}

.release:last-of-type {
  margin-bottom: 30px;
}

.stamp {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin: 0 0 6px;
}

.version {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 0.6px;
  color: var(--amber-text);
}

.when {
  font-size: 13.5px;
  font-weight: 500;
  color: var(--chalk-dim);
}

.name {
  font-size: 17.5px;
  font-weight: 700;
  color: var(--chalk);
  margin: 0 0 10px;
}

.changes {
  margin: 0;
  padding: 0;
  list-style: none;
}

.changes li {
  position: relative;
  padding-left: 17px;
  margin-bottom: 9px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.55;
  color: var(--chalk-dim);
}

.changes li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 10px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--amber);
}
</style>
