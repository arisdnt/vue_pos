<template>
  <div class="login-page">
    <!-- Window controls -->
    <div class="login-window-controls">
      <button class="control-button" @click="minimizeWindow" title="Minimize">
        <svg width="10" height="1" viewBox="0 0 10 1">
          <rect width="10" height="1" fill="currentColor"/>
        </svg>
      </button>
      <button class="control-button close-button" @click="closeWindow" title="Close">
        <svg width="10" height="10" viewBox="0 0 10 10">
          <path d="M0,0 L10,10 M10,0 L0,10" stroke="currentColor" stroke-width="1"/>
        </svg>
      </button>
    </div>

    <div class="login-container">
      <!-- Left: Branding -->
      <div class="login-left">
        <LoginBranding />
      </div>

      <!-- Right: Form -->
      <div class="login-right">
        <div class="login-box">
          <div class="login-header">
            <h2>Selamat Datang</h2>
            <p>Masuk ke akun Anda</p>
          </div>

          <LoginForm 
            :loading="loading" 
            :error="error" 
            @submit="handleLogin" 
          />

          <div class="login-footer">
            <p>© 2025 VuePOS Indonesia</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { getCurrentWindow } from '@tauri-apps/api/window'
import LoginBranding from '@/components/auth/LoginBranding.vue'
import LoginForm from '@/components/auth/LoginForm.vue'

const router = useRouter()
const authStore = useAuthStore()

const error = ref('')
const loading = ref(false)

// Check if running in Tauri environment
const isTauri = typeof window !== 'undefined' && '__TAURI__' in window

async function handleLogin(credentials: { email: string; password: string }) {
  error.value = ''
  loading.value = true

  try {
    await authStore.signIn(credentials.email, credentials.password)
    router.push('/dashboard')
  } catch (err: any) {
    error.value = err.message || 'Login gagal. Periksa kembali email dan password Anda.'
  } finally {
    loading.value = false
  }
}

async function minimizeWindow() {
  if (!isTauri) return
  
  try {
    const appWindow = getCurrentWindow()
    await appWindow.minimize()
  } catch (error) {
    console.error('Failed to minimize window:', error)
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
</script>

<style scoped>
.login-page {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.login-window-controls {
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  z-index: 1000;
}

.control-button {
  width: 46px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.1s;
}

.control-button:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
}

.control-button.close-button:hover {
  background-color: #e81123;
  color: white;
}

.login-container {
  display: flex;
  height: 100%;
}

.login-left {
  flex: 0 0 70%;
  background: linear-gradient(135deg, #0078d4 0%, #005a9e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
}

.login-right {
  flex: 0 0 30%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
}

.login-box {
  width: 100%;
  max-width: 360px;
}

.login-header {
  margin-bottom: 32px;
}

.login-header h2 {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.login-header p {
  font-size: 14px;
  color: #666;
  margin: 0;
}

.login-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid #eee;
}

.login-footer p {
  margin: 0;
  font-size: 12px;
  color: #999;
}
</style>
