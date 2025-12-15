<template>
  <div class="win-checkbox-list">
    <div v-if="loading" class="list-loading">
      <WinSpinner size="sm" />
      <span>{{ loadingText }}</span>
    </div>

    <div v-else-if="items.length === 0" class="list-empty">
      {{ emptyText }}
    </div>

    <div v-else class="list-container" :style="{ maxHeight }">
      <label 
        v-for="item in items" 
        :key="item.id" 
        class="list-item"
      >
        <WinCheckbox 
          :model-value="isChecked(item.id)"
          @update:model-value="handleToggle(item.id, $event)"
        />
        <span class="item-label">{{ item.label }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WinCheckbox, WinSpinner } from '@/components/base'

export interface CheckboxListItem {
  id: number | string
  label: string
}

const props = withDefaults(defineProps<{
  items: CheckboxListItem[]
  modelValue: (number | string)[]
  loading?: boolean
  loadingText?: string
  emptyText?: string
  maxHeight?: string
}>(), {
  loading: false,
  loadingText: 'Loading...',
  emptyText: 'No items available',
  maxHeight: '200px'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: (number | string)[]): void
}>()

function isChecked(id: number | string): boolean {
  return props.modelValue.includes(id)
}

function handleToggle(id: number | string, checked: boolean) {
  let newValue: (number | string)[]
  
  if (checked) {
    newValue = [...props.modelValue, id]
  } else {
    newValue = props.modelValue.filter(v => v !== id)
  }
  
  emit('update:modelValue', newValue)
}
</script>

<style scoped>
.win-checkbox-list {
  width: 100%;
}

.list-loading,
.list-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  color: var(--win-text-disabled);
  font-size: 14px;
}

.list-container {
  border: 1px solid var(--win-border);
  overflow-y: auto;
  padding: 4px;
}

.list-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  cursor: pointer;
  transition: background-color 0.15s;
}

.list-item:hover {
  background-color: var(--win-hover, #f5f5f5);
}

.item-label {
  font-size: 14px;
  user-select: none;
}
</style>
