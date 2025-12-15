<template>
  <div class="win-field" :class="{ error: !!error, disabled: disabled }">
    <label v-if="label" :for="inputId" class="win-field-label">
      {{ label }}
      <span v-if="required" class="win-field-required">*</span>
    </label>
    
    <div class="win-field-input">
      <slot></slot>
    </div>

    <span v-if="error" class="win-field-error">{{ error }}</span>
    <span v-else-if="hint" class="win-field-hint">{{ hint }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  label?: string
  error?: string
  hint?: string
  required?: boolean
  disabled?: boolean
  id?: string
}>(), {
  required: false,
  disabled: false
})

const inputId = computed(() => props.id || `field-${Math.random().toString(36).substr(2, 9)}`)
</script>

<style scoped>
.win-field {
  margin-bottom: 16px;
}

.win-field-label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--win-text);
}

.win-field-required {
  color: var(--win-error);
  margin-left: 2px;
}

.win-field-input {
  position: relative;
}

.win-field-error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--win-error);
}

.win-field-hint {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--win-text-secondary);
}

.win-field.error .win-field-input :deep(input),
.win-field.error .win-field-input :deep(select),
.win-field.error .win-field-input :deep(textarea) {
  border-color: var(--win-error);
}

.win-field.error .win-field-input :deep(input):focus,
.win-field.error .win-field-input :deep(select):focus,
.win-field.error .win-field-input :deep(textarea):focus {
  border-color: var(--win-error);
}

.win-field.disabled .win-field-label {
  color: var(--win-text-disabled);
}
</style>
