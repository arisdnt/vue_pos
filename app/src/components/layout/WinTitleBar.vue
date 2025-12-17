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
      <WinWindowButton variant="minimize" title="Minimize" @click="minimizeWindow">
        <svg width="10" height="1" viewBox="0 0 10 1">
          <rect width="10" height="1" fill="currentColor"/>
        </svg>
      </WinWindowButton>
      
      <WinWindowButton variant="maximize" title="Maximize" @click="toggleMaximize">
        <svg v-if="!isMaximized" width="10" height="10" viewBox="0 0 10 10">
          <rect x="0" y="0" width="10" height="10" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
        <svg v-else width="10" height="10" viewBox="0 0 10 10">
          <rect x="0" y="2" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1"/>
          <rect x="2" y="0" width="8" height="8" fill="none" stroke="currentColor" stroke-width="1"/>
        </svg>
      </WinWindowButton>
      
      <WinWindowButton variant="close" title="Close" @click="closeWindow">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M0,0 L10,10 M10,0 L0,10" stroke="currentColor" stroke-width="1"/>
        </svg>
      </WinWindowButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCurrentWindow } from '@tauri-apps/api/window'
import WinMenuBar from './WinMenuBar.vue'
import { WinWindowButton } from '@/components/base'
import type { MenuItem } from '@/data/menuData'

const router = useRouter()
const isMaximized = ref(false)

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window

onMounted(async () => {
  if (!isTauri) return
  
  try {
    const appWindow = getCurrentWindow()
    isMaximized.value = await appWindow.isMaximized()
    appWindow.onResized(async () => {
      isMaximized.value = await appWindow.isMaximized()
    })
  } catch (error) {
    console.warn('Failed to initialize window controls:', error)
  }
})

async function minimizeWindow() {
  if (!isTauri) return
  
  try {
    const appWindow = getCurrentWindow()
    await appWindow.minimize()
  } catch (error) {
    console.error('Failed to minimize window:', error)
  }
}

async function toggleMaximize() {
  if (!isTauri) return
  
  try {
    const appWindow = getCurrentWindow()
    await appWindow.toggleMaximize()
  } catch (error) {
    console.error('Failed to toggle maximize:', error)
  }
}

async function closeWindow() {
  if (!isTauri) return
  
  try {
    const appWindow = getCurrentWindow()
    await appWindow.close()
  } catch (error) {
    console.error('Failed to close window:', error)
  }
}

async function handleMenuAction(item: MenuItem) {
  if (item.id === 'logout') {
    try {
      const { useAuthStore } = await import('@/stores/authStore')
      const authStore = useAuthStore()
      await authStore.signOut()
    } catch (error) {
      console.error('[TitleBar] Failed to logout from menu:', error)
    }
    router.push('/login')
    return
  }
  
  if (item.id === 'exit') {
    // Selalu coba logout dulu agar sesi dan data lokal bersih
    try {
      const { useAuthStore } = await import('@/stores/authStore')
      const authStore = useAuthStore()
      await authStore.signOut()
    } catch (error) {
      console.warn('[TitleBar] Failed to sign out before exit:', error)
    }

    if (isTauri) {
      try {
        const appWindow = getCurrentWindow()
        await appWindow.close()
      } catch (error) {
        console.error('Failed to close window:', error)
      }
    } else {
      // Fallback saat berjalan di browser/dev: arahkan ke login
      router.push('/login')
      try {
        window.close()
      } catch {
        // window.close bisa ditolak browser, abaikan saja
      }
    }
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
</style>
