<template>
  <div class="stat-card" :class="{ clickable: clickable }">
    <div class="stat-icon" :style="{ background: iconBg }">
      <component :is="icon" :size="20" />
    </div>
    <div class="stat-content">
      <div class="stat-label">{{ label }}</div>
      <div class="stat-value">{{ value }}</div>
      <div v-if="subtitle" class="stat-subtitle">{{ subtitle }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
  icon: Component
  iconBg?: string
  label: string
  value: string | number
  subtitle?: string
  clickable?: boolean
}>()
</script>

<style scoped>
.stat-card { display: flex; gap: 12px; padding: 16px; background: white; border: 1px solid var(--win-border); transition: all 0.15s; }
.stat-card.clickable { cursor: pointer; }
.stat-card.clickable:hover { border-color: var(--win-border-dark); background: #fafafa; }
.stat-icon { width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; color: white; flex-shrink: 0; }
.stat-content { display: flex; flex-direction: column; justify-content: center; min-width: 0; }
.stat-label { font-size: 12px; color: var(--win-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; }
.stat-value { font-size: 22px; font-weight: 600; color: var(--win-text); line-height: 1.2; }
.stat-subtitle { font-size: 11px; color: var(--win-text-secondary); margin-top: 2px; }
</style>
