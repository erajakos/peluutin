<script setup>
defineProps({
  label: { type: String, default: '' },
  modelValue: { type: [String, Number, null], default: '' },
  /** Options are `{ value, label }`; `placeholder` becomes the empty choice. */
  options: { type: Array, required: true },
  placeholder: { type: String, default: '' },
  id: { type: String, default: undefined },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <div class="field-wrap">
    <label v-if="label" class="field-label" :for="id">{{ label }}</label>
    <select
      :id="id"
      class="field"
      :value="modelValue ?? ''"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option v-if="placeholder" value="">{{ placeholder }}</option>
      <option v-for="option in options" :key="option.value" :value="option.value">
        {{ option.label }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.field-wrap {
  width: 100%;
  min-width: 0;
}

select.field {
  padding: 10px;
}
</style>
