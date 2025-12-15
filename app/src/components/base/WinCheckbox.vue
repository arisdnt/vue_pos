<template>
  <label class="win-checkbox" :class="{ disabled }">
    <input 
      type="checkbox"
      :checked="modelValue"
      :disabled="disabled"
      @change="handleChange"
      class="win-checkbox-input"
    />
    <span class="win-checkbox-box"></span>
    <span v-if="label || $slots.default" class="win-checkbox-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: boolean
  label?: string
  disabled?: boolean
}>(), {
  modelValue: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

function handleChange(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<style scoped>
.win-checkbox {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.win-checkbox.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.win-checkbox-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.win-checkbox-box {
  width: 16px;
  height: 16px;
  border: 1px solid var(--win-border-dark);
  background: white;
  position: relative;
  flex-shrink: 0;
}

.win-checkbox-input:checked + .win-checkbox-box {
  background: var(--win-accent);
  border-color: var(--win-accent);
}

.win-checkbox-input:checked + .win-checkbox-box::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.win-checkbox-input:focus + .win-checkbox-box {
  outline: 2px solid var(--win-accent-light);
  outline-offset: 2px;
}

.win-checkbox-input:disabled + .win-checkbox-box {
  background: #f0f0f0;
  border-color: #d0d0d0;
}

.win-checkbox-label {
  font-size: 14px;
  color: var(--win-text);
}

.win-checkbox.disabled .win-checkbox-label {
  color: var(--win-text-disabled);
}
</style>
