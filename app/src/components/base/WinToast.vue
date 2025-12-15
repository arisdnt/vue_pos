<template>
  <Teleport to="body">
    <TransitionGroup name="toast" tag="div" class="win-toast-container">
      <div 
        v-for="toast in toasts" 
        :key="toast.id"
        class="win-toast"
        :class="`toast-${toast.type}`"
      >
        <div class="toast-icon">{{ getIcon(toast.type) }}</div>
        <div class="toast-content">
          <div class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click="removeToast(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration: number
}

const toasts = ref<Toast[]>([])
let toastId = 0

function getIcon(type: string) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  }
  return icons[type as keyof typeof icons]
}

function showToast(message: string, type: Toast['type'] = 'info', duration = 3000) {
  const id = toastId++
  const toast: Toast = { id, message, type, duration }
  
  toasts.value.push(toast)
  
  if (duration > 0) {
    setTimeout(() => {
      removeToast(id)
    }, duration)
  }
}

function removeToast(id: number) {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Expose methods
defineExpose({
  showToast,
  success: (msg: string, duration?: number) => showToast(msg, 'success', duration),
  error: (msg: string, duration?: number) => showToast(msg, 'error', duration),
  warning: (msg: string, duration?: number) => showToast(msg, 'warning', duration),
  info: (msg: string, duration?: number) => showToast(msg, 'info', duration),
})
</script>

<style scoped>
.win-toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: var(--z-tooltip);
  display: flex;
  flex-direction: column;
  gap: 12px;
  pointer-events: none;
}

.win-toast {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 300px;
  max-width: 500px;
  padding: 12px 16px;
  background: white;
  border: 1px solid;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  pointer-events: auto;
}

.toast-icon {
  font-size: 18px;
  font-weight: bold;
  flex-shrink: 0;
}

.toast-content {
  flex: 1;
}

.toast-message {
  font-size: 14px;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  opacity: 0.6;
}

.toast-close:hover {
  opacity: 1;
}

.toast-success {
  border-color: var(--win-success);
  background: #e8f5e9;
}

.toast-success .toast-icon {
  color: var(--win-success);
}

.toast-error {
  border-color: var(--win-error);
  background: #ffebee;
}

.toast-error .toast-icon {
  color: var(--win-error);
}

.toast-warning {
  border-color: var(--win-warning);
  background: #fff3e0;
}

.toast-warning .toast-icon {
  color: var(--win-warning);
}

.toast-info {
  border-color: var(--win-info);
  background: #e3f2fd;
}

.toast-info .toast-icon {
  color: var(--win-info);
}

/* Transitions */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.toast-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
