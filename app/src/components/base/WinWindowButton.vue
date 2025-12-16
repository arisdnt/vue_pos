<template>
  <button 
    :class="['win-window-button', variantClass]"
    :title="title"
    @click="handleClick"
  >
    <slot></slot>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'minimize' | 'maximize' | 'close'
  title?: string
}>(), {
  variant: 'minimize',
  title: ''
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const variantClass = computed(() => `win-window-button-${props.variant}`)

function handleClick(event: MouseEvent) {
  emit('click', event)
}
</script>

<style scoped>
.win-window-button {
  width: 46px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: var(--win-text);
  cursor: pointer;
  transition: background-color 0.1s;
  -webkit-app-region: no-drag;
}

.win-window-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.win-window-button:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.win-window-button-close:hover {
  background-color: #e81123;
  color: white;
}

.win-window-button-close:active {
  background-color: #c50f1f;
  color: white;
}

.win-window-button svg {
  pointer-events: none;
}
</style>
