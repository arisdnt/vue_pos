<template>
  <div class="win-statusbar">
    <slot name="left">
      <div class="statusbar-section">
        <slot name="left-content"></slot>
      </div>
    </slot>

    <slot name="center">
      <div class="statusbar-section statusbar-center">
        <slot name="center-content"></slot>
      </div>
    </slot>

    <slot name="right">
      <div class="statusbar-section statusbar-right">
        <slot name="right-content"></slot>
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
// WinStatusBar base component - container for status bar with 3 sections
</script>

<!-- Child Components -->
<script lang="ts">
import { defineComponent, h, computed } from 'vue'

// StatusItem Component
export const StatusItem = defineComponent({
  name: 'StatusItem',
  setup(_, { slots }) {
    return () => h('div', { class: 'status-item' }, slots.default?.())
  }
})

// StatusSeparator Component
export const StatusSeparator = defineComponent({
  name: 'StatusSeparator',
  setup() {
    return () => h('div', { class: 'status-separator' })
  }
})

// StatusIndicator Component
export const StatusIndicator = defineComponent({
  name: 'StatusIndicator',
  props: {
    status: {
      type: String as () => 'online' | 'offline' | 'warning' | 'error' | 'success',
      default: 'offline'
    }
  },
  setup(props) {
    const statusClass = computed(() => `status-indicator-${props.status}`)
    return () => h('span', {
      class: ['status-indicator', statusClass.value]
    })
  }
})

// StatusIcon Component
export const StatusIcon = defineComponent({
  name: 'StatusIcon',
  setup(_, { slots }) {
    return () => h('span', { class: 'status-icon' }, slots.default?.())
  }
})

// StatusLabel Component
export const StatusLabel = defineComponent({
  name: 'StatusLabel',
  props: {
    variant: {
      type: String as () => 'default' | 'secondary' | 'route' | 'role',
      default: 'default'
    }
  },
  setup(props, { slots }) {
    const variantClass = computed(() => `status-label-${props.variant}`)
    return () => h('span', {
      class: ['status-label', variantClass.value]
    }, slots.default?.())
  }
})

// CopyButton Component
export const CopyButton = defineComponent({
  name: 'CopyButton',
  props: {
    title: { type: String, default: 'Copy' }
  },
  emits: ['click'],
  setup(props, { emit }) {
    const handleClick = (e: MouseEvent) => {
      emit('click', e)
    }
    
    return () => h('button', {
      class: 'copy-button',
      title: props.title,
      onClick: handleClick
    }, [
      h('svg', {
        width: '12',
        height: '12',
        viewBox: '0 0 12 12',
        fill: 'currentColor'
      }, [
        h('rect', { x: '2', y: '2', width: '7', height: '7', fill: 'none', stroke: 'currentColor', 'stroke-width': '1' }),
        h('rect', { x: '3', y: '3', width: '7', height: '7', fill: 'none', stroke: 'currentColor', 'stroke-width': '1' })
      ])
    ])
  }
})
</script>

<style scoped>
/* Container */
.win-statusbar {
  height: 24px;
  background-color: var(--win-panel);
  border-top: 1px solid var(--win-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 8px;
  font-size: 11px;
  color: var(--win-text-secondary);
  flex-shrink: 0;
}

.statusbar-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
}

.statusbar-center {
  justify-content: center;
}

.statusbar-right {
  justify-content: flex-end;
}

/* StatusItem */
.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

/* StatusSeparator */
.status-separator {
  width: 1px;
  height: 14px;
  background-color: var(--win-border);
}

/* StatusIndicator */
.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
}

.status-indicator-online {
  background-color: #107c10;
}

.status-indicator-offline {
  background-color: #d13438;
}

.status-indicator-warning {
  background-color: #ff8c00;
}

.status-indicator-error {
  background-color: #d13438;
}

.status-indicator-success {
  background-color: #107c10;
}

/* StatusIcon */
.status-icon {
  font-size: 10px;
}

/* StatusLabel */
.status-label-route {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 10px;
  color: var(--win-text);
}

.status-label-role {
  color: var(--win-text-disabled);
  font-size: 10px;
}

.status-label-secondary {
  color: var(--win-text-secondary);
  font-size: 10px;
}

/* CopyButton */
.copy-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  padding: 0;
  background: transparent;
  border: none;
  color: var(--win-text-secondary);
  cursor: pointer;
  transition: all 0.1s;
}

.copy-button:hover {
  color: var(--win-accent);
  background-color: rgba(0, 120, 212, 0.1);
}

.copy-button:active {
  transform: scale(0.95);
}
</style>
