<script setup>
import { ref, watch } from 'vue'
import SquadEditor from '@/components/setup/SquadEditor.vue'
import UiBackLink from '@/components/ui/UiBackLink.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiConfirmDialog from '@/components/ui/UiConfirmDialog.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useSetupStore } from '@/stores/setup.js'
import { useTeamsStore } from '@/stores/teams.js'

const app = useAppStore()
const setup = useSetupStore()
const teams = useTeamsStore()
const { t } = useI18n()

const name = ref(teams.name)
const error = ref('')
const removing = ref(false)

watch(
  () => teams.name,
  (current) => (name.value = current),
)

/**
 * The name is saved as it is left, not behind a button: there is one team on
 * this page and nothing else to confirm. A name another team already has is
 * refused, and the field says so rather than quietly keeping the old one.
 */
function saveName() {
  const clean = name.value.trim()
  if (!clean) {
    name.value = teams.name
    error.value = ''
    return
  }
  // Back to the name it already has: nothing to save, and nothing to complain
  // about either — a warning left standing about a name no longer typed is a
  // lie the next reader has to work out.
  if (clean === teams.name) {
    error.value = ''
    return
  }
  if (teams.rename(teams.activeId, clean)) error.value = ''
  else error.value = t('teamNameTaken')
}

function remove() {
  teams.remove(teams.activeId)
  removing.value = false
  app.closePage()
}
</script>

<template>
  <UiBackLink @click="app.closePage()">{{ t('backBtn') }}</UiBackLink>

  <!-- One team: its name, its players, and the way to be rid of it. -->
  <h1 class="title">{{ t('editTeamTitle') }}</h1>

  <label class="field-label" for="team-name">{{ t('teamNameLabel') }}</label>
  <input
    id="team-name"
    v-model="name"
    class="field field--lg"
    :placeholder="t('newTeamPlaceholder')"
    @blur="saveName"
    @keydown.enter.prevent="saveName"
  />
  <p v-if="error" class="error">{{ error }}</p>

  <h2 class="sub">{{ t('squadCountNote', setup.roster.length) }}</h2>
  <SquadEditor />

  <!--
    Everything here saves itself — the name as it is left, a player the moment
    they are typed in — so the button at the foot is not "save", it is "done".
    Getting rid of the team is a different kind of thing, and looks it.
  -->
  <UiButton class="done" @click="app.closePage()">{{ t('doneBtn') }}</UiButton>

  <!--
    Well below the button a thumb is aiming for, behind a rule, in the same
    grey as everything else that does nothing: red would catch the eye, which
    is the opposite of what is wanted from a thing nobody meant to press. The
    question it asks is what actually removes the team.
  -->
  <div class="danger-zone">
    <button type="button" class="remove" @click="removing = true">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M4.5 6.5h15" />
        <path d="M9.5 6.5V4.8h5v1.7" />
        <path d="M6.5 6.5 7.4 19a1.4 1.4 0 0 0 1.4 1.3h6.4a1.4 1.4 0 0 0 1.4-1.3l.9-12.5" />
        <path d="M10.3 10v6.6M13.7 10v6.6" />
      </svg>
      {{ t('removeTeamBtn') }}
    </button>
  </div>

  <UiConfirmDialog
    v-if="removing"
    :message="t('removeTeamConfirm', teams.name)"
    :confirm-label="t('yesBtn')"
    :cancel-label="t('cancelBtn')"
    tone="danger"
    @confirm="remove"
    @cancel="removing = false"
  />
</template>

<style scoped>
.title {
  margin-bottom: 18px;
  text-align: center;
}

.sub {
  font-size: 13.5px;
  font-weight: 700;
  letter-spacing: 1.2px;
  text-transform: uppercase;
  color: var(--amber-text);
  margin: 26px 0 12px;
}

.error {
  font-size: 15px;
  font-weight: 600;
  color: var(--alert);
  margin: 8px 0 0;
}

.done {
  margin-top: 28px;
}

.danger-zone {
  margin-top: 64px;
  padding-top: 18px;
  border-top: 1px solid var(--line);
  /* Off to the right, away from the middle where thumbs land. */
  text-align: right;
}

/* A button, plainly — but a grey one, off to the side, well out of the way. */
.remove {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 16px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.18);
  border: 1.5px solid var(--line-strong);
  color: var(--chalk-dim);
  font-size: 14.5px;
  font-weight: 600;
}

.remove svg {
  width: 17px;
  height: 17px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.7;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.remove:active {
  transform: translateY(1px);
  color: var(--against);
  border-color: rgba(233, 105, 79, 0.6);
}
</style>
