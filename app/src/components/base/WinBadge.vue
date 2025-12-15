<template>
  <span class="win-badge" :class="[variantClass, sizeClass]">
    <slot></slot>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error'
  size?: 'sm' | 'md' | 'lg'
}>(), {
  variant: 'default',
  size: 'md'
})

const variantClass = computed(() => `badge-${props.variant}`)
const sizeClass = computed(() => `badge-${props.size}`)
</script>

<style scoped>
.win-badge {
  display: inline-block;
  font-weight: 600;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
}

.badge-sm { padding: 2px 6px; font-size: 10px; }
.badge-md { padding: 4px 8px; font-size: 11px; }
.badge-lg { padding: 6px 12px; font-size: 12px; }

.badge-default {
  background: #e9ecef;
  color: #495057;
}

.badge-primary {
  background: var(--win-accent);
  color: white;
}

.badge-success {
  background: var(--win-success);
  color: white;
}

.badge-warning {
  background: var(--win-warning);
  color: white;
}

.badge-error {
  background: var(--win-error);
  color: white;
}
</style>
