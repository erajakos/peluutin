<script setup>
import BrandWordmark from '@/components/BrandWordmark.vue'
import MenuTile from '@/components/MenuTile.vue'
import { useI18n } from '@/i18n/index.js'
import { PHASES, useAppStore } from '@/stores/app.js'
import { useHistoryStore } from '@/stores/history.js'

const app = useAppStore()
const history = useHistoryStore()
const { t } = useI18n()
</script>

<template>
  <div class="menu">
    <BrandWordmark size="compact" class="wordmark" />

    <!-- Starting a match is why the app is opened; everything else is a detour. -->
    <nav class="tiles">
      <MenuTile primary icon="ball" :title="t('menuStartBtn')" @click="app.startNewMatch()" />
      <MenuTile
        icon="calendar"
        :title="t('menuHistory')"
        :note="
          history.hasEntries
            ? t('menuHistoryNote', history.entries.length)
            : t('menuHistoryEmptyNote')
        "
        @click="app.openPage(PHASES.HISTORY)"
      />
      <MenuTile
        icon="book"
        :title="t('menuHelp')"
        :note="t('menuHelpNote')"
        @click="app.openPage(PHASES.HELP)"
      />
      <MenuTile
        icon="info"
        :title="t('menuInfo')"
        :note="t('menuInfoNote')"
        @click="app.openPage(PHASES.INFO)"
      />
    </nav>
  </div>
</template>

<style scoped>
.menu {
  padding-top: 10px;
  animation: menu-in 0.3s ease-out both;
}

@keyframes menu-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .menu {
    animation: none;
  }
}

.wordmark {
  margin-bottom: 26px;
}

.tiles {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
