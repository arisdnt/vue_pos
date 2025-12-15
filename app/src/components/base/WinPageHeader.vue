<template>
  <div class="win-page-header">
    <div class="header-left">
      <h1 class="header-title">
        <slot name="title">{{ title }}</slot>
      </h1>
      <p v-if="subtitle || $slots.subtitle" class="header-subtitle">
        <slot name="subtitle">{{ subtitle }}</slot>
      </p>
    </div>
    <div v-if="$slots.actions" class="header-actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  subtitle?: string
}>(), {})
</script>

<style scoped>
.win-page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  border-bottom: 1px solid #e1e1e1;
  background: linear-gradient(to bottom, #ffffff 0%, #fafafa 100%);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
  position: relative;
  z-index: 10;
}

.header-left {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #1a1a1a;
  letter-spacing: -0.01em;
  line-height: 1.3;
}

.header-subtitle {
  font-size: 12px;
  color: #707070;
  margin: 0;
  font-weight: 400;
  letter-spacing: 0;
}

.header-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  padding-left: 16px;
}
</style>
