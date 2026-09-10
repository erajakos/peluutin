<script setup>
defineProps({
  modelValue: { type: Boolean, required: true },
  tight: { type: Boolean, default: false },
})
defineEmits(['update:modelValue'])
</script>

<template>
  <label class="checkline" :class="{ 'checkline--tight': tight }">
    <input
      type="checkbox"
      :checked="modelValue"
      @change="$emit('update:modelValue', $event.target.checked)"
    />
    <span><slot /></span>
  </label>
</template>

<style scoped>
.checkline {
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 14px;
  color: var(--chalk);
  margin-bottom: 10px;
  cursor: pointer;
}

.checkline--tight {
  margin-bottom: 0;
}

.checkline input {
  width: 18px;
  height: 18px;
  accent-color: var(--amber);
}
</style>
