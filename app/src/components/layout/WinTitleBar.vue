<template>
  <div class="custom-titlebar" data-tauri-drag-region>
    <!-- Left: App icon -->
    <div class="titlebar-left">
      <div class="app-icon">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect width="16" height="16" rx="2"/>
        </svg>
      </div>
    </div>

    <!-- Center: Menu items -->
    <WinMenuBar @menu-action="handleMenuAction" />

    <!-- Spacer (draggable area) -->
    <div class="titlebar-spacer" data-tauri-drag-region></div>

    <!-- Right: Window controls -->
    <div class="titlebar-controls">
      <button class="titlebar-button" @click="minimizeWindow" title="Minimize">
        <svg width="10" height="1" viewBox="0 0 10 1">
          <rect width="10" height="1" fill="currentColor"/>
        </svg>
      </button>
      
      <button class="titlebar-button" @click="toggleMaximize" title="Maximize">
        <svg v-if="!isMaximized" width="10" height="10" viewBox="0 0 10 10">
          <rect x="0" y="0" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
        <svg v-else width="10" height="10" viewBox="0 0 10 10">
          <rect x="0" y="2" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1"/>
          <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
      
      <button class="titlebar-button close-button" @click="closeWindow" title="Close">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M0,0 L10,10 M10,0 L0,10" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentWindow } from '@tauri-apps/api/window'
import WinMenuBar from './WinMenuBar.vue'
import type { MenuItem } from '@/data/menuData'

const router = useRouter()
const isMaximized = ref(false)
const appWindow = getCurrentWindow()

onMounted(async () => {
  isMaximized.value = await appWindow.isMaximized()
  appWindow.onResized(async () => {
    isMaximized.value = await appWindow.isMaximized()
  })
})

async function minimizeWindow() {
  await appWindow.minimize()
}

async function toggleMaximize() {
  await appWindow.toggleMaximize()
}

async function closeWindow() {
  await appWindow.close()
}

async function handleMenuAction(item: MenuItem) {
  if (item.id === 'logout') {
    const { useAuthStore } = await import('@/stores/authStore')
    const authStore = useAuthStore()
    await authStore.signOut()
    router.push('/login')
    return
  }
  
  if (item.id === 'exit') {
    await appWindow.close()
    return
  }
  
  if (item.route) {
    router.push(item.route)
  } else if (item.action) {
    item.action()
  }
}
</script>

<style scoped>
.custom-titlebar {
  height: 32px;
  background-color: var(--win-panel);
  border-bottom: 1px solid var(--win-border);
  display: flex;
  align-items: stretch;
  user-select: none;
  -webkit-user-select: none;
  -webkit-app-region: drag;
}

.titlebar-left {
  display: flex;
  align-items: center;
  padding: 0 8px;
  -webkit-app-region: no-drag;
}

.app-icon {
  width: 16px;
  height: 16px;
  color: var(--win-accent);
}

.titlebar-spacer {
  flex: 1;
  -webkit-app-region: drag;
}

.titlebar-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.titlebar-button {
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
}

.titlebar-button:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.titlebar-button:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.titlebar-button.close-button:hover {
  background-color: #e81123;
  color: white;
}

.titlebar-button.close-button:active {
  background-color: #c50f1f;
  color: white;
}

.titlebar-button svg {
  pointer-events: none;
}
</style>
