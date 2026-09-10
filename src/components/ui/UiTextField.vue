<script setup>
defineProps({
  label: { type: String, default: '' },
  modelValue: { type: [String, Number], default: '' },
  placeholder: { type: String, default: '' },
  type: { type: String, default: 'text' },
  min: { type: [String, Number], default: undefined },
  id: { type: String, default: undefined },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="field-wrap">
    <label v-if="label" class="field-label" :for="id">{{ label }}</label>
    <input
      :id="id"
      class="field"
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
