<template>
  <div class="win-alert" :class="typeClass">
    <div class="alert-icon">{{ icon }}</div>
    <div class="alert-content">
      <div v-if="title" class="alert-title">{{ title }}</div>
      <div class="alert-message">
        <slot>{{ message }}</slot>
      </div>
    </div>
    <button v-if="closeable" class="alert-close" @click="emit('close')">×</button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  type?: 'info' | 'success' | 'warning' | 'error'
  title?: string
  message?: string
  closeable?: boolean
}>(), {
  type: 'info',
  closeable: false
})

const emit = defineEmits<{
  (e: 'close'): void
}>()

const typeClass = computed(() => `alert-${props.type}`)

const icon = computed(() => {
  const icons = {
    info: 'ℹ',
    success: '✓',
    warning: '⚠',
    error: '✕'
  }
  return icons[props.type]
})
</script>

<style scoped>
.win-alert {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 16px;
  border: 1px solid;
  margin-bottom: 16px;
}

.alert-icon {
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
}

.alert-title {
  font-weight: 600;
  margin-bottom: 4px;
  font-size: 14px;
}

.alert-message {
  font-size: 13px;
  line-height: 1.5;
}

.alert-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.6;
}

.alert-close:hover {
  opacity: 1;
}

.alert-info {
  background: #e3f2fd;
  border-color: #2196f3;
  color: #0d47a1;
}

.alert-info .alert-icon {
  color: #2196f3;
}

.alert-success {
  background: #e8f5e9;
  border-color: #4caf50;
  color: #1b5e20;
}

.alert-success .alert-icon {
  color: #4caf50;
}

.alert-warning {
  background: #fff3e0;
  border-color: #ff9800;
  color: #e65100;
}

.alert-warning .alert-icon {
  color: #ff9800;
}

.alert-error {
  background: #ffebee;
  border-color: #f44336;
  color: #b71c1c;
}

.alert-error .alert-icon {
  color: #f44336;
}
</style>
