<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="win-modal-overlay">
        <div class="win-modal-container" :class="sizeClass" role="dialog">
          <div class="win-modal-header">
            <h3 class="win-modal-title">{{ title }}</h3>
            <button class="win-modal-close" @click="handleClose" aria-label="Close">
              <span>×</span>
            </button>
          </div>

          <div class="win-modal-body">
            <slot></slot>
          </div>

          <div v-if="$slots.footer" class="win-modal-footer">
            <slot name="footer"></slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  closeable?: boolean
}>(), {
  size: 'md',
  closeable: true
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const sizeClass = computed(() => `modal-${props.size}`)

function handleClose() {
  if (props.closeable) {
    emit('update:modelValue', false)
  }
}
</script>

<style scoped>
.win-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050; /* var(--z-modal) with fallback */
}

.win-modal-container {
  background: white;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.modal-sm { width: 400px; max-width: 90vw; }
.modal-md { width: 500px; max-width: 90vw; }
.modal-lg { width: 700px; max-width: 90vw; }
.modal-xl { width: 900px; max-width: 90vw; }

.win-modal-header {
  padding: 16px 24px;
  border-bottom: 1px solid #cccccc; /* var(--win-border) with fallback */
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.win-modal-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #000000; /* var(--win-text) with fallback */
}

.win-modal-close {
  background: none;
  border: none;
  font-size: 28px;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666666; /* var(--win-text-secondary) with fallback */
}

.win-modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #000000; /* var(--win-text) with fallback */
}

.win-modal-body {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

.win-modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #cccccc; /* var(--win-border) with fallback */
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .win-modal-container,
.modal-leave-active .win-modal-container {
  transition: transform 0.2s ease;
}

.modal-enter-from .win-modal-container,
.modal-leave-to .win-modal-container {
  transform: scale(0.95);
}
</style>
