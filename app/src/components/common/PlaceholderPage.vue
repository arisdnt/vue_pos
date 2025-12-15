<template>
  <div class="placeholder-page">
    <div class="placeholder-content">
      <div class="placeholder-icon">🏗️</div>
      <h1>{{ pageTitle }}</h1>
      <p class="placeholder-description">{{ pageDescription }}</p>
      <div class="placeholder-path">
        <code>{{ currentPath }}</code>
      </div>
      <div class="placeholder-status">
        <span class="status-badge">Dalam Pengembangan</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps<{
  title?: string
  description?: string
}>()

const route = useRoute()

const currentPath = computed(() => route.path)

const pageTitle = computed(() => {
  if (props.title) return props.title
  const path = route.path.split('/').filter(Boolean)
  return path.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')).join(' - ')
})

const pageDescription = computed(() => {
  return props.description || 'Halaman ini sedang dalam tahap pengembangan. Fitur akan segera tersedia.'
})
</script>

<style scoped>
.placeholder-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background-color: #f8f9fa;
  padding: 32px;
}

.placeholder-content {
  text-align: center;
  max-width: 500px;
}

.placeholder-icon {
  font-size: 64px;
  margin-bottom: 24px;
}

h1 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.placeholder-description {
  font-size: 14px;
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.6;
}

.placeholder-path {
  margin-bottom: 24px;
}

.placeholder-path code {
  background-color: #e9ecef;
  padding: 8px 16px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
  color: #495057;
}

.status-badge {
  display: inline-block;
  padding: 6px 16px;
  background-color: #fff3cd;
  color: #856404;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid #ffc107;
}
</style>
