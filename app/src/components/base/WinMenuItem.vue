<template>
  <button 
    :class="['win-menu-item', { active }]"
    :disabled="disabled"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
  >
    <slot>{{ label }}</slot>
  </button>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{
  label?: string
  active?: boolean
  disabled?: boolean
}>(), {
  label: '',
  active: false,
  disabled: false
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
  (e: 'mouseenter', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  if (!props.disabled) {
    emit('click', event)
  }
}

function handleMouseEnter(event: MouseEvent) {
  if (!props.disabled) {
    emit('mouseenter', event)
  }
}
</script>

<style scoped>
.win-menu-item {
  height: 32px;
  padding: 0 12px;
  background: transparent;
  border: none;
  font-size: 12px;
  font-family: var(--font-family);
  color: var(--win-text);
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: background-color 0.1s;
  -webkit-app-region: no-drag;
}

.win-menu-item:hover:not(:disabled),
.win-menu-item.active {
  background-color: rgba(0, 0, 0, 0.05);
}

.win-menu-item:disabled {
  color: var(--win-text-disabled);
  cursor: not-allowed;
}
</style>
