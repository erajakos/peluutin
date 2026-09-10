<script setup>
import { onMounted, ref } from 'vue'

defineProps({
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  min: { type: [String, Number], default: undefined },
  id: { type: String, default: undefined },
  /** 'lg' for screens that ask one question and deserve a generous target. */
  size: { type: String, default: 'md', validator: (value) => ['md', 'lg'].includes(value) },
  autofocus: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])

const input = ref(null)

// A screen with a single field should be ready to type into.
onMounted(() => {
  if (input.value?.autofocus) input.value.focus()
})
</script>

<template>
  <div class="field-wrap">
    <label v-if="label" class="field-label" :for="id">{{ label }}</label>
    <input
      :id="id"
      ref="input"
      class="field"
      :class="{ 'field--lg': size === 'lg' }"
      :autofocus="autofocus"
      :type="type"
      :min="min"
      :value="modelValue"
      :placeholder="placeholder"
      @input="$emit('update:modelValue', $event.target.value)"
    />
  </div>
</template>

<style scoped>
.field-wrap {
  width: 100%;
}
</style>
