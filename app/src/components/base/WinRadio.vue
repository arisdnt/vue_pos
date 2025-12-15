<template>
  <label class="win-radio" :class="{ disabled }">
    <input 
      type="radio"
      :name="name"
      :value="value"
      :checked="modelValue === value"
      :disabled="disabled"
      @change="handleChange"
      class="win-radio-input"
    />
    <span class="win-radio-circle"></span>
    <span v-if="label || $slots.default" class="win-radio-label">
      <slot>{{ label }}</slot>
    </span>
  </label>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: any
  value: any
  name: string
  label?: string
  disabled?: boolean
}>(), {
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

function handleChange() {
  emit('update:modelValue', props.value)
}
</script>

<style scoped>
.win-radio {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  user-select: none;
}

.win-radio.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.win-radio-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.win-radio-circle {
  width: 16px;
  height: 16px;
  border: 1px solid var(--win-border-dark);
  border-radius: 50%;
  background: white;
  position: relative;
  flex-shrink: 0;
}

.win-radio-input:checked + .win-radio-circle {
  border-color: var(--win-accent);
}

.win-radio-input:checked + .win-radio-circle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: var(--win-accent);
  border-radius: 50%;
}

.win-radio-input:focus + .win-radio-circle {
  outline: 2px solid var(--win-accent-light);
  outline-offset: 2px;
}

.win-radio-label {
  font-size: 14px;
  color: var(--win-text);
}
</style>
