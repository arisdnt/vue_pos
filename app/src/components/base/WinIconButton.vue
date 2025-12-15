<template>
  <button 
    :type="type"
    :disabled="disabled"
    :class="['win-icon-button', variantClass, sizeClass, { 'icon-only': !$slots.default }]"
    @click="handleClick"
    :title="tooltip"
  >
    <component v-if="icon" :is="icon" :size="iconSize" :stroke-width="2" />
    <span v-if="$slots.default" class="button-text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue'

const props = withDefaults(defineProps<{
  icon?: Component
  type?: 'button' | 'submit' | 'reset'
  variant?: 'default' | 'primary' | 'danger' | 'success' | 'ghost' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  tooltip?: string
}>(), {
  type: 'button',
  variant: 'default',
  size: 'md',
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const variantClass = computed(() => `btn-${props.variant}`)
const sizeClass = computed(() => `btn-${props.size}`)

const iconSize = computed(() => {
  const sizes = { sm: 14, md: 16, lg: 18 }
  return sizes[props.size]
})

function handleClick(event: MouseEvent) {
  if (!props.disabled) {
    emit('click', event)
  }
}
</script>

<style scoped>
.win-icon-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: var(--font-family);
  font-weight: 400;
  border: 1px solid;
  cursor: pointer;
  transition: all 0.15s;
  user-select: none;
  border-radius: 2px;
}

.win-icon-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.win-icon-button:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.win-icon-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Sizes */
.btn-sm { padding: 6px 10px; font-size: 12px; }
.btn-md { padding: 8px 14px; font-size: 14px; }
.btn-lg { padding: 10px 18px; font-size: 16px; }

.icon-only.btn-sm { padding: 6px; }
.icon-only.btn-md { padding: 8px; }
.icon-only.btn-lg { padding: 10px; }

.button-text {
  line-height: 1;
}

/* Default Variant - Light Gray */
.btn-default {
  background: #f3f3f3;
  border-color: #d0d0d0;
  color: #333333;
}

.btn-default:hover:not(:disabled) {
  background: #e8e8e8;
  border-color: #b8b8b8;
}

/* Primary Variant - Blue */
.btn-primary {
  background: #e3f2fd;
  border-color: #90caf9;
  color: #0d47a1;
}

.btn-primary:hover:not(:disabled) {
  background: #bbdefb;
  border-color: #64b5f6;
}

/* Danger Variant - Red */
.btn-danger {
  background: #ffebee;
  border-color: #ef5350;
  color: #c62828;
}

.btn-danger:hover:not(:disabled) {
  background: #ffcdd2;
  border-color: #e53935;
}

/* Success Variant - Green */
.btn-success {
  background: #e8f5e9;
  border-color: #66bb6a;
  color: #2e7d32;
}

.btn-success:hover:not(:disabled) {
  background: #c8e6c9;
  border-color: #4caf50;
}

/* Ghost Variant - Transparent with hover */
.btn-ghost {
  background: transparent;
  border-color: transparent;
  color: #666666;
}

.btn-ghost:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #e0e0e0;
}

/* Warning Variant - Orange/Yellow */
.btn-warning {
  background: #fff3e0;
  border-color: #ffb74d;
  color: #e65100;
}

.btn-warning:hover:not(:disabled) {
  background: #ffe0b2;
  border-color: #ffa726;
}

/* Info Variant - Cyan/Teal */
.btn-info {
  background: #e0f7fa;
  border-color: #4dd0e1;
  color: #006064;
}

.btn-info:hover:not(:disabled) {
  background: #b2ebf2;
  border-color: #26c6da;
}
</style>
