<template>
  <div v-if="separator" class="win-menu-separator"></div>
  <button 
    v-else
    :class="['win-menu-dropdown-item', { disabled }]"
    :disabled="disabled"
    @click="handleClick"
  >
    <span class="item-label">
      <slot>{{ label }}</slot>
    </span>
    <span v-if="shortcut" class="item-shortcut">{{ shortcut }}</span>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  shortcut?: string
  disabled?: boolean
  separator?: boolean
}>(), {
  label: '',
  shortcut: '',
  disabled: false,
  separator: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled && !props.separator) {
    emit('click', event)
  }
}
</script>

<style scoped>
.win-menu-dropdown-item {
  width: 100%;
  padding: 6px 16px 6px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  background: transparent;
  border: none;
  font-size: 12px;
  font-family: var(--font-family);
  color: var(--win-text);
  cursor: pointer;
  text-align: left;
  white-space: nowrap;
  transition: all 0.1s;
}

.win-menu-dropdown-item:hover:not(.disabled) {
  background-color: var(--win-accent);
  color: white;
}

.win-menu-dropdown-item.disabled {
  color: var(--win-text-disabled);
  cursor: not-allowed;
}

.item-label {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-shortcut {
  flex-shrink: 0;
  color: var(--win-text-secondary);
  font-size: 11px;
  white-space: nowrap;
}

.win-menu-dropdown-item:hover:not(.disabled) .item-shortcut {
  color: rgba(255, 255, 255, 0.7);
}

.win-menu-separator {
  height: 1px;
  background-color: var(--win-border);
  margin: 4px 0;
}
</style>
