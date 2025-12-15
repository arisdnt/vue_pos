<template>
  <select
    :value="modelValue"
    :disabled="disabled"
    :required="required"
    class="win-select"
    @change="handleChange"
  >
    <slot></slot>
  </select>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string | number
  disabled?: boolean
  required?: boolean
}>(), {
  disabled: false,
  required: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const value = target.value
  // Try to parse as number if it looks like one
  const numValue = Number(value)
  emit('update:modelValue', isNaN(numValue) ? value : numValue)
}
</script>

<style scoped>
/* Inherits from windows.css .win-select */
</style>
