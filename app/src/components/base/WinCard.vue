<template>
  <div class="win-card" :class="{ clickable: clickable, 'no-padding': noPadding }">
    <div v-if="title || $slots.header" class="card-header">
      <slot name="header">
        <h3 class="card-title">{{ title }}</h3>
      </slot>
    </div>
    
    <div class="card-body">
      <slot></slot>
    </div>

    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  clickable?: boolean
  noPadding?: boolean
}>(), {
  clickable: false,
  noPadding: false
})
</script>

<style scoped>
.win-card {
  background: white;
  border: 1px solid var(--win-border);
  display: flex;
  flex-direction: column;
  height: 100%;
}

.win-card.clickable {
  cursor: pointer;
  transition: all 0.15s;
}

.win-card.clickable:hover {
  border-color: var(--win-border-dark);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 6px 12px;
  border-bottom: 1px solid var(--win-border);
  flex-shrink: 0;
}

.card-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--win-text);
}

.card-body {
  padding: 6px;
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.win-card.no-padding .card-body {
  padding: 0;
}

.card-footer {
  padding: 4px 12px;
  border-top: 1px solid var(--win-border);
  background: #fafafa;
  flex-shrink: 0;
}
</style>
