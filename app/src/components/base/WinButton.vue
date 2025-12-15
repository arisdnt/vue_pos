<template>
  <button 
    :type="type"
    :disabled="disabled || loading"
    :class="['win-button', variantClass, sizeClass]"
    @click="handleClick"
  >
    <span v-if="loading" class="win-button-spinner"></span>
    <slot v-else></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'button' | 'submit' | 'reset'
  variant?: 'default' | 'primary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  loading?: boolean
}>(), {
  type: 'button',
  variant: 'default',
  size: 'md',
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const variantClass = computed(() => `win-button-${props.variant}`)
const sizeClass = computed(() => `win-button-${props.size}`)

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.win-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-family);
  font-weight: 400;
  border: 1px solid var(--win-border);
  background: white;
  color: var(--win-text);
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
}

.win-button:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: var(--win-border-dark);
}

.win-button:active:not(:disabled) {
  transform: translateY(1px);
}

.win-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.win-button-sm { padding: 6px 16px; font-size: 13px; }
.win-button-md { padding: 8px 20px; font-size: 14px; }
.win-button-lg { padding: 12px 24px; font-size: 16px; }

/* Variants */
.win-button-primary {
  background: var(--win-accent);
  border-color: var(--win-accent);
  color: white;
}

.win-button-primary:hover:not(:disabled) {
  background: var(--win-accent-hover);
  border-color: var(--win-accent-hover);
}

.win-button-danger {
  background: var(--win-error);
  border-color: var(--win-error);
  color: white;
}

.win-button-danger:hover:not(:disabled) {
  background: #b71c1c;
  border-color: #b71c1c;
}

.win-button-success {
  background: var(--win-success);
  border-color: var(--win-success);
  color: white;
}

.win-button-success:hover:not(:disabled) {
  background: #0d6b0d;
  border-color: #0d6b0d;
}

/* Loading spinner */
.win-button-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
