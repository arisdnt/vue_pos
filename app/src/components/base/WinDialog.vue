<template>
  <WinModal :modelValue="modelValue" @update:modelValue="emit('update:modelValue', $event)" :title="title" size="sm" :closeable="false">
    <div class="dialog-content">
      <div class="dialog-icon" :class="`icon-${type}`">{{ icon }}</div>
      <div class="dialog-message">{{ message }}</div>
    </div>

    <template #footer>
      <WinButton v-if="type !== 'alert'" @click="handleCancel">
        {{ cancelText }}
      </WinButton>
      <WinButton variant="primary" @click="handleConfirm">
        {{ confirmText }}
      </WinButton>
    </template>
  </WinModal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WinModal from './WinModal.vue'
import WinButton from './WinButton.vue'

const props = withDefaults(defineProps<{
  modelValue: boolean
  title?: string
  message: string
  type?: 'alert' | 'confirm' | 'warning'
  confirmText?: string
  cancelText?: string
}>(), {
  title: 'Konfirmasi',
  type: 'confirm',
  confirmText: 'OK',
  cancelText: 'Batal'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const icon = computed(() => {
  const icons = {
    alert: 'ℹ',
    confirm: '?',
    warning: '⚠'
  }
  return icons[props.type]
})

function handleConfirm() {
  emit('update:modelValue', false)
  emit('confirm')
}

function handleCancel() {
  emit('update:modelValue', false)
  emit('cancel')
}
</script>

<style scoped>
.dialog-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.dialog-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.icon-alert { color: var(--win-info); }
.icon-confirm { color: var(--win-accent); }
.icon-warning { color: var(--win-warning); }

.dialog-message {
  font-size: 14px;
  line-height: 1.5;
  color: var(--win-text);
}
</style>
