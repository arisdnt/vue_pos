<template>
  <WinStatusBar>
    <template #left-content>
      <StatusItem :class="{ online: isOnline, offline: !isOnline }">
        <StatusIndicator :status="isOnline ? 'online' : 'offline'" />
        <span>{{ isOnline ? 'Online' : 'Offline' }}</span>
      </StatusItem>
      
      <StatusSeparator />
      
      <StatusItem class="route-path">
        <StatusLabel variant="route">{{ currentRoute }}</StatusLabel>
        <CopyButton @click="copyRoute" title="Copy route" />
      </StatusItem>
      
      <StatusSeparator v-if="syncStatus" />
      
      <StatusItem v-if="syncStatus">
        <span>{{ syncStatus }}</span>
      </StatusItem>
    </template>

    <template #center-content>
      <StatusItem v-if="storeName">
        <StatusIcon>🏪</StatusIcon>
        <span>{{ storeName }}</span>
      </StatusItem>
      
      <StatusSeparator v-if="registerName" />
      
      <StatusItem v-if="registerName">
        <StatusIcon>💰</StatusIcon>
        <span>{{ registerName }}</span>
      </StatusItem>
    </template>

    <template #right-content>
      <StatusItem v-if="userName">
        <StatusIcon>👤</StatusIcon>
        <span>{{ userName }}</span>
        <StatusLabel v-if="userRole" variant="role">({{ userRole }})</StatusLabel>
      </StatusItem>
      
      <StatusSeparator />
      
      <StatusItem>
        <span>{{ currentTime }}</span>
      </StatusItem>
    </template>
  </WinStatusBar>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { WinStatusBar, StatusItem, StatusSeparator, StatusIndicator, StatusIcon, StatusLabel, CopyButton } from '@/components/base'

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
.route-path {
  background-color: rgba(0, 0, 0, 0.03);
  padding: 2px 6px;
  gap: 6px;
}
</style>
