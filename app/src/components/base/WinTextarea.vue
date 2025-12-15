<template>
  <textarea
    :value="modelValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :readonly="readonly"
    :required="required"
    :rows="rows"
    class="win-textarea"
    @input="handleInput"
  ></textarea>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  rows?: number
}>(), {
  disabled: false,
  readonly: false,
  required: false,
  rows: 3
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

function handleInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value)
}
</script>

<style scoped>
.win-textarea {
  width: 100%;
  padding: 8px 12px;
  font-size: 14px;
  font-family: var(--font-family);
  color: var(--win-text);
  background: white;
  border: 1px solid var(--win-border);
  resize: vertical;
  min-height: 60px;
}

.win-textarea:hover {
  border-color: var(--win-border-dark);
}

.win-textarea:focus {
  border-color: var(--win-accent);
  outline: none;
}

.win-textarea:disabled {
  background: #f0f0f0;
  color: var(--win-text-disabled);
  cursor: not-allowed;
}
</style>
