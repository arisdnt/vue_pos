<template>
  <input
    :type="type"
    :value="displayValue"
    :disabled="disabled"
    :required="required"
    :min="min"
    :max="max"
    class="win-input win-datepicker"
    @input="handleInput"
    @blur="emit('blur', $event)"
    @focus="emit('focus', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | Date
  type?: 'date' | 'datetime-local' | 'time'
  disabled?: boolean
  required?: boolean
  min?: string
  max?: string
}>(), {
  type: 'date',
  disabled: false,
  required: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

const displayValue = computed(() => {
  if (!props.modelValue) return ''
  
  if (props.modelValue instanceof Date) {
    return formatDateForInput(props.modelValue)
  }
  
  return props.modelValue
})

function formatDateForInput(date: Date): string {
  if (props.type === 'date') {
    return date.toISOString().split('T')[0]
  } else if (props.type === 'datetime-local') {
    return date.toISOString().slice(0, 16)
  } else if (props.type === 'time') {
    const timeStr = date.toTimeString()
    return timeStr.slice(0, 5)
  }
  return date.toISOString().split('T')[0]
}

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.win-datepicker {
  cursor: pointer;
}

.win-datepicker::-webkit-calendar-picker-indicator {
  cursor: pointer;
  filter: opacity(0.6);
}

.win-datepicker::-webkit-calendar-picker-indicator:hover {
  filter: opacity(1);
}
</style>
