<script setup>
import { ref } from 'vue'
import SetupProgress from '@/components/setup/SetupProgress.vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiTextField from '@/components/ui/UiTextField.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'
import { useSetupStore } from '@/stores/setup.js'

const app = useAppStore()
const setup = useSetupStore()
const { t } = useI18n()

const name = ref(setup.opponentName)
const error = ref('')

function submit() {
  if (app.confirmOpponent(name.value)) error.value = ''
  else error.value = t('opponentRequired')
}
</script>

<template>
  <SetupProgress :step="1" />

  <div class="ask">
    <h1 class="question">{{ t('opponentTitle') }}</h1>

    <UiTextField
      id="opponent"
      v-model="name"
      size="lg"
      autofocus
      :placeholder="t('opponentPlaceholder')"
      @keyup.enter="submit"
    />

    <p class="error">{{ error }}</p>

    <UiButton size="lg" @click="submit">{{ t('teamContinueBtn') }}</UiButton>

    <p class="team">
      {{ t('yourTeamLabel') }}: <b>{{ app.teamName }}</b>
      <button class="link-inline" @click="app.editTeamName()">{{ t('changeTeamLink') }}</button>
    </p>
  </div>
</template>

<style scoped>
.ask {
  min-height: 64vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 30px;
}

.question {
  font-size: clamp(26px, 7.5vw, 32px);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.3px;
  margin-bottom: 22px;
}

.error {
  font-size: 15px;
  font-weight: 600;
  color: var(--alert);
  min-height: 20px;
  margin: 10px 0 14px;
}

/* Context, not a control: which side is "us" in every screen that follows. */
.team {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
  color: var(--chalk-dim);
  margin: 26px 0 0;
}
</style>
