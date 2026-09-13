<script setup>
import { nextTick, ref } from 'vue'
import UiBackLink from '@/components/ui/UiBackLink.vue'
import UiButton from '@/components/ui/UiButton.vue'
import { useI18n } from '@/i18n/index.js'
import { PHASES, useAppStore } from '@/stores/app.js'
import { useTeamsStore } from '@/stores/teams.js'

const app = useAppStore()
const teams = useTeamsStore()
const { t } = useI18n()

/**
 * The team marked here is not yet the team being coached: one tap marks, the
 * button below takes it. Switching squads the instant a row is touched makes a
 * mis-tap expensive, and leaves a coach unsure whether anything happened.
 */
const chosenId = ref(teams.activeId)

const newTeam = ref('')
const input = ref(null)
const adding = ref(false)
const error = ref('')

async function startAdding() {
  adding.value = true
  await nextTick()
  input.value?.focus()
}

/** Adding a team switches to it: you added it because you are about to use it. */
function add() {
  if (!newTeam.value.trim()) return
  if (!teams.add(newTeam.value)) {
    error.value = t('teamNameTaken')
    return
  }
  newTeam.value = ''
  error.value = ''
  adding.value = false
  chosenId.value = teams.activeId
}

function choose() {
  if (chosenId.value !== null) teams.select(chosenId.value)
  app.closePage()
}

/** Editing is about one team, so it opens that team — and coaches it too. */
function edit(id) {
  teams.select(id)
  chosenId.value = id
  app.openPage(PHASES.TEAM_SQUAD)
}
</script>

<template>
  <UiBackLink @click="app.closePage()">{{ t('backBtn') }}</UiBackLink>

  <!-- Choosing, and nothing else. Editing one is a page of its own. -->
  <header class="head">
    <h1 class="title">{{ t('teamsTitle') }}</h1>
    <button type="button" class="add" @click="startAdding">{{ t('addTeamShort') }}</button>
  </header>

  <!-- Said once, plainly: two things happen on this page and they look alike. -->
  <p class="lead">{{ t('teamsLead') }}</p>

  <div v-if="adding" class="add-row">
    <input
      ref="input"
      v-model="newTeam"
      class="field field--lg"
      :placeholder="t('newTeamPlaceholder')"
      @input="error = ''"
      @keydown.enter.prevent="add"
    />
    <button class="add-btn" :aria-label="t('addTeamAria')" @click="add">+</button>
  </div>

  <p v-if="error" class="error">{{ error }}</p>

  <ul class="teams">
    <li v-for="team in teams.teams" :key="team.id" class="team-row">
      <button
        type="button"
        class="pick"
        :class="{ 'pick--active': team.id === chosenId }"
        :aria-pressed="team.id === chosenId"
        @click="chosenId = team.id"
      >
        <span class="mark" aria-hidden="true">
          <svg v-if="team.id === chosenId" viewBox="0 0 24 24">
            <path d="M5 12.5 10 17.5 19 7" />
          </svg>
        </span>
        <span class="name">{{ team.name }}</span>
        <span class="count">{{ t('squadCountNote', team.roster.length) }}</span>
      </button>

      <button
        type="button"
        class="edit"
        :aria-label="`${t('editTeamAria')}: ${team.name}`"
        @click="edit(team.id)"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M4 20h4L19 9l-4-4L4 16v4Z" />
          <path d="m14.5 5.5 4 4" />
        </svg>
      </button>
    </li>
  </ul>

  <UiButton v-if="teams.hasTeams" class="choose" @click="choose">{{ t('chooseTeamBtn') }}</UiButton>
</template>

<style scoped>
.head {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.title {
  flex: 1;
  min-width: 0;
  margin: 0;
}

/* Small, and out of the way in the corner: adding a team is a rare errand. */
.add {
  flex-shrink: 0;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.18);
  border: 1px solid var(--line-strong);
  color: var(--chalk);
  font-size: 14px;
  font-weight: 700;
}

.add:active {
  transform: translateY(1px);
}

.lead {
  font-size: 15px;
  font-weight: 500;
  line-height: 1.5;
  color: var(--chalk-dim);
  margin: -6px 0 16px;
}

.add-row {
  display: flex;
  gap: 10px;
  margin-bottom: 14px;
}

.add-row .field {
  flex: 1;
  min-width: 0;
}

.add-btn {
  flex-shrink: 0;
  width: 62px;
  border-radius: 10px;
  background: var(--go);
  color: #08281a;
  font-weight: 700;
  font-size: 26px;
}

.add-btn:active {
  transform: translateY(1px);
}

.error {
  font-size: 15px;
  font-weight: 600;
  color: var(--alert);
  margin: 0 0 14px;
}

.teams {
  list-style: none;
  margin: 0;
  padding: 0;
}

/* Not `.row`: that is a global layout helper that would share the width out. */
.team-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pick {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  min-width: 0;
  padding: 14px 12px;
  border-radius: 12px;
  background: var(--panel);
  border: 1px solid var(--line);
  color: var(--chalk);
  text-align: left;
  margin-bottom: 8px;
}

/* The one being coached: filled, the way the app marks a settled choice. */
.pick--active {
  border-color: var(--amber);
  background: rgba(232, 163, 61, 0.14);
}

.mark {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 1.5px solid var(--line-strong);
}

.pick--active .mark {
  background: var(--amber);
  border-color: var(--amber);
}

.mark svg {
  width: 13px;
  height: 13px;
  fill: none;
  stroke: var(--amber-ink);
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 17px;
  font-weight: 700;
}

.count {
  flex-shrink: 0;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--chalk-dim);
}

.edit {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 42px;
  height: 46px;
  margin-bottom: 8px;
  border-radius: 10px;
  background: none;
  color: var(--chalk-dim);
}

.edit svg {
  width: 19px;
  height: 19px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.edit:active {
  background: rgba(0, 0, 0, 0.2);
}

.choose {
  margin-top: 18px;
}
</style>
