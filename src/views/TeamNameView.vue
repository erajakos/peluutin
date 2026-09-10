<script setup>
import { ref } from 'vue'
import UiButton from '@/components/ui/UiButton.vue'
import UiPanel from '@/components/ui/UiPanel.vue'
import UiTextField from '@/components/ui/UiTextField.vue'
import { useI18n } from '@/i18n/index.js'
import { useAppStore } from '@/stores/app.js'

const app = useAppStore()
const { t } = useI18n()

const name = ref(app.teamName)
const error = ref('')

function submit() {
  if (app.confirmTeamName(name.value)) error.value = ''
  else error.value = t('teamNameRequired')
}
</script>

<template>
  <div class="eyebrow">{{ t('setupEyebrow') }}</div>
  <h1 class="title">{{ t('teamNameTitle') }}</h1>
  <p class="sub">{{ t('teamNameSub') }}</p>

  <UiPanel>
    <UiTextField
      id="team-name"
      v-model="name"
      :label="t('teamNameLabel')"
      :placeholder="t('teamNamePlaceholder')"
      @keyup.enter="submit"
    />
  </UiPanel>

  <UiButton @click="submit">{{ t('teamContinueBtn') }}</UiButton>
  <p class="error-note">{{ error }}</p>
</template>
