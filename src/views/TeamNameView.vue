<script setup>
import { ref } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiTextField from '@/components/ui/UiTextField.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'

const app = useAppStore()
const { t } = useI18n()

const name = ref(app.teamName)
const error = ref('')

function submit() {
  if (app.confirmTeamName(name.value)) error.value = ''
  else error.value = name.value.trim() ? t('teamNameTaken') : t('teamNameRequired')
}
</script>

<template>
  <!--
    One question, asked once. No eyebrow, no explanation, no panel around a
    single field — anything else here is furniture.
  -->
  <div class="ask">
    <h1 class="question">{{ t('teamNameTitle') }}</h1>

    <UiTextField
      id="team-name"
      v-model="name"
      size="lg"
      autofocus
      :placeholder="t('teamNamePlaceholder')"
      @keyup.enter="submit"
    />

    <p class="error">{{ error }}</p>

    <UiButton size="lg" @click="submit">{{ t('teamContinueBtn') }}</UiButton>
  </div>
</template>

<style scoped>
.ask {
  min-height: 74vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-bottom: 40px;
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
  color: var(--alert);
  min-height: 20px;
  margin: 10px 0 14px;
}
</style>
