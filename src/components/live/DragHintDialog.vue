<script setup>
import UiButton from '@/components/ui/UiButton.vue'
import UiDialog from '@/components/ui/UiDialog.vue'
import { useI18n } from '@/i18n/index.js'

const emit = defineEmits(['close'])
const { t } = useI18n()
</script>

<template>
  <!--
    Shown once, at the first kickoff this device ever sees: dragging is not a
    thing a coach would think to try on a pitch drawing, and a change that is
    never discovered may as well not exist. After that it is never shown again.
  -->
  <UiDialog :label="t('dragHintTitle')" @dismiss="emit('close')">
    <p class="title">{{ t('dragHintTitle') }}</p>
    <ul class="points">
      <li>{{ t('dragHintSub') }}</li>
      <li>{{ t('dragHintSwap') }}</li>
      <li>{{ t('dragHintConfirm') }}</li>
    </ul>
    <UiButton @click="emit('close')">{{ t('dragHintOk') }}</UiButton>
  </UiDialog>
</template>

<style scoped>
.title {
  font-size: 19px;
  font-weight: 700;
  text-align: center;
  color: var(--chalk);
  margin: 0 0 14px;
}

.points {
  margin: 0 0 18px;
  padding: 0;
  list-style: none;
}

.points li {
  position: relative;
  padding-left: 18px;
  margin-bottom: 10px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.45;
  color: var(--chalk-dim);
}

.points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--go);
}
</style>
