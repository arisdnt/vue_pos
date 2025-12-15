<template>
  <div class="win-statusbar">
    <!-- Left: Status info -->
    <div class="statusbar-left">
      <div class="status-item" :class="{ online: isOnline, offline: !isOnline }">
        <span class="status-indicator"></span>
        <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
      </div>
      
      <div class="status-separator"></div>
      
      <div class="status-item route-path">
        <span class="route-label">{{ currentRoute }}</span>
        <button class="copy-button" @click="copyRoute" title="Copy route">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <rect x="2" y="2" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1"/>
            <rect x="3" y="3" width="7" height="7" fill="none" stroke="currentColor" stroke-width="1"/>
          </svg>
        </button>
      </div>
      
      <div class="status-separator" v-if="syncStatus"></div>
      
      <div class="status-item" v-if="syncStatus">
        <span>{{ syncStatus }}</span>
      </div>
    </div>

    <!-- Center: Current store & register -->
    <div class="statusbar-center">
      <div class="status-item" v-if="storeName">
        <span class="status-icon">🏪</span>
        <span>{{ storeName }}</span>
      </div>
      
      <div class="status-separator" v-if="registerName"></div>
      
      <div class="status-item" v-if="registerName">
        <span class="status-icon">💰</span>
        <span>{{ registerName }}</span>
      </div>
    </div>

    <!-- Right: User & time -->
    <div class="statusbar-right">
      <div class="status-item" v-if="userName">
        <span class="status-icon">👤</span>
        <span>{{ userName }}</span>
        <span class="user-role" v-if="userRole">({{ userRole }})</span>
      </div>
      
      <div class="status-separator"></div>
      
      <div class="status-item">
        <span>{{ currentTime }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

// Props for external status
const props = defineProps<{
  syncStatus?: string
  storeName?: string
  registerName?: string
}>()

// Online status
const isOnline = ref(navigator.onLine)

// Current time
const currentTime = ref('')
let timeInterval: ReturnType<typeof setInterval>

// Current route
const currentRoute = computed(() => route.path)

// Copy route to clipboard
async function copyRoute() {
  try {
    await navigator.clipboard.writeText(currentRoute.value)
  } catch (err) {
    console.error('Failed to copy route:', err)
  }
}

// Computed user info
const userName = computed(() => {
  const user = authStore.user
  if (!user) return null
  return user.email?.split('@')[0] || 'User'
})

const userRole = computed(() => {
  const role = authStore.role
  if (!role) return null
  const roleNames: Record<string, string> = {
    owner: 'Owner',
    manager: 'Manager',
    cashier: 'Kasir'
  }
  return roleNames[role] || role
})

// Update time
function updateTime() {
  const now = new Date()
  currentTime.value = now.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

// Online/offline handlers
function handleOnline() {
  isOnline.value = true
}

function handleOffline() {
  isOnline.value = false
}

onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
  
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
})

onUnmounted(() => {
  clearInterval(timeInterval)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
})
</script>

<style scoped>
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

.statusbar-left,
.statusbar-center,
.statusbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.statusbar-left {
  flex: 1;
  justify-content: flex-start;
}

.statusbar-center {
  flex: 1;
  justify-content: center;
}

.statusbar-right {
  flex: 1;
  justify-content: flex-end;
}

.status-item {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #999;
}

.status-item.online .status-indicator {
  background-color: #107c10;
}

.status-item.offline .status-indicator {
  background-color: #d13438;
}

.status-icon {
  font-size: 10px;
}

.user-role {
  color: var(--win-text-disabled);
  font-size: 10px;
}

.status-separator {
  width: 1px;
  height: 14px;
  background-color: var(--win-border);
}

.route-path {
  background-color: rgba(0, 0, 0, 0.03);
  padding: 2px 6px;
  gap: 6px;
}

.route-label {
  font-family: 'Consolas', 'Courier New', monospace;
  font-size: 10px;
  color: var(--win-text);
}

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
