<template>
  <div class="win-spinner" :class="sizeClass">
    <div class="spinner-ring"></div>
    <span v-if="text" class="spinner-text">{{ text }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  size?: 'sm' | 'md' | 'lg'
  text?: string
}>(), {
  size: 'md'
})

const sizeClass = computed(() => `spinner-${props.size}`)
</script>

<style scoped>
.win-spinner {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.spinner-ring {
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-top-color: var(--win-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-sm .spinner-ring { width: 16px; height: 16px; border-width: 2px; }
.spinner-md .spinner-ring { width: 32px; height: 32px; border-width: 3px; }
.spinner-lg .spinner-ring { width: 48px; height: 48px; border-width: 4px; }

.spinner-text {
  font-size: 13px;
  color: var(--win-text-secondary);
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
