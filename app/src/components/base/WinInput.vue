<template>
  <input
    ref="inputRef"
    :type="type"
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="isReadonly"
    :required="required"
    :name="`field-${Math.random().toString(36).substring(7)}`"
    autocomplete="new-password"
    autocorrect="off"
    autocapitalize="off"
    spellcheck="false"
    data-form-type="other"
    data-lpignore="true"
    class="win-input"
    @input="handleInput"
    @blur="emit('blur', $event)"
    @focus="handleFocus"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string | number
  type?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
}>(), {
  type: 'text',
  disabled: false,
  readonly: false,
  required: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'blur', event: FocusEvent): void
  (e: 'focus', event: FocusEvent): void
}>()

const inputRef = ref<HTMLInputElement>()
const isMounted = ref(false)

const isReadonly = computed(() => {
  if (props.readonly) return true
  // Trick: make readonly until mounted to prevent autocomplete
  return !isMounted.value
})

onMounted(() => {
  // Remove readonly after a short delay
  setTimeout(() => {
    isMounted.value = true
  }, 100)
})

function handleInput(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}

function handleFocus(event: FocusEvent) {
  // Ensure readonly is removed on focus
  isMounted.value = true
  emit('focus', event)
}
</script>

<style scoped>
/* Inherits from windows.css .win-input */
</style>
