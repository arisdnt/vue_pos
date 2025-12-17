<template>
  <div id="app" class="app-container">
    <!-- Custom Title Bar for Tauri borderless window (hidden on login page) -->
    <WinTitleBar v-if="showTitleBar" :title="pageTitle" />
    
    <div class="app-content">
      <router-view v-slot="{ Component }">
        <component :is="Component" @update:title="updateTitle" />
      </router-view>
    </div>

    <!-- Status Bar (hidden on login page) -->
    <WinStatusBar v-if="showTitleBar" :store-name="currentStore" :sync-status="syncStatus" />
    
    <!-- Global Popup Portal -->
    <PopupPortal />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import PopupPortal from './components/PopupPortal.vue'
import WinTitleBar from './components/layout/WinTitleBar.vue'
import WinStatusBar from './components/layout/WinStatusBar.vue'

const router = useRouter()
const route = useRoute()
const pageTitle = ref('VuePOS Indonesia')
const currentStore = ref('Toko Utama')
const syncStatus = ref('Tersinkronisasi')

// Hide title bar and status bar on login page
const showTitleBar = computed(() => {
  return route.name !== 'login'
})

// Update title based on route
router.afterEach((to) => {
  const routeTitle = to.meta.title as string
  pageTitle.value = routeTitle ? `${routeTitle} - VuePOS Indonesia` : 'VuePOS Indonesia'
})

function updateTitle(title: string) {
  pageTitle.value = title
}
</script>

<style>
#app {
  font-family: var(--font-family);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.app-content {
  flex: 1;
  overflow: hidden;
  background-color: #ffffff;
}
</style>
