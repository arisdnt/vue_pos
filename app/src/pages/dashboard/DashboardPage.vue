<template>
  <div class="dashboard-page">
    <div class="dashboard-content">
      <h1>Welcome to VuePOS Indonesia</h1>
      <p>You are logged in as: {{ authStore.user?.email }}</p>
      <p>Role: {{ authStore.role }}</p>
      <p>Accessible stores: {{ authStore.accessibleStores.length }}</p>

      <button @click="handleLogout" class="win-button win-button-primary">
        Logout
      </button>

      <div style="margin-top: 24px;">
        <h2>Quick Links</h2>
        <div class="quick-links">
          <router-link to="/pos" class="win-button">POS</router-link>
          <router-link to="/products" class="win-button">Products</router-link>
          <router-link to="/customers" class="win-button">Customers</router-link>
          <router-link to="/orders" class="win-button">Orders</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/login')
}
</script>

<style scoped>
.dashboard-content {
  padding: var(--spacing-xl);
}

h1 {
  margin: 0 0 var(--spacing-md) 0;
  font-size: var(--font-size-2xl);
  color: var(--win-text);
}

.quick-links {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}
</style>
