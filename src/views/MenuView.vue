<script setup>
import BrandWordmark from '@/components/BrandWordmark.vue'
import MenuTile from '@/components/MenuTile.vue'
import { useI18n } from '@/i18n/index.js'
import { PHASES, useAppStore } from '@/stores/app.js'
import { useHistoryStore } from '@/stores/history.js'
import { useTeamsStore } from '@/stores/teams.js'

const app = useAppStore()
const history = useHistoryStore()
const teams = useTeamsStore()
const { t } = useI18n()
</script>

<template>
  <div class="menu">
    <BrandWordmark size="compact" class="wordmark" />

    <!--
      Who is being coached, and the way to another team. Shown only once there
      is a team: before that the app asks for one as part of the first match.
    -->
    <button v-if="teams.hasTeams" type="button" class="team" @click="app.openPage(PHASES.TEAMS)">
      <span class="team-label">{{ t('menuTeam') }}</span>
      <span class="team-name">{{ teams.name }}</span>
      <span class="team-chevron" aria-hidden="true">
        <svg viewBox="0 0 24 24"><path d="m9.5 5.5 7 6.5-7 6.5" /></svg>
      </span>
    </button>

    <!-- Starting a match is why the app is opened; everything else is a detour. -->
    <nav class="tiles">
      <MenuTile primary icon="ball" :title="t('menuStartBtn')" @click="app.startNewMatch()" />
      <MenuTile
        icon="calendar"
        :title="t('menuHistory')"
        :note="
          history.hasEntries ? t('menuHistoryNote', history.ours.length) : t('menuHistoryEmptyNote')
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

/* Quiet: which team is being coached is worth knowing, not worth shouting. */
.team {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid var(--line);
  color: var(--chalk);
}

.team-label {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--chalk-dim);
}

.team-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-align: left;
  font-size: 16px;
  font-weight: 700;
}

.team-chevron {
  display: flex;
  flex-shrink: 0;
  color: var(--chalk-dim);
}

.team-chevron svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.4;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
