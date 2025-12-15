<template>
  <form @submit.prevent="handleSubmit" class="login-form" autocomplete="off">
    <div class="form-group">
      <label for="email">Email</label>
      <input
        id="email"
        v-model="email"
        type="email"
        name="login-email-field"
        class="win-input"
        placeholder="nama@email.com"
        required
        :disabled="loading"
        autocomplete="new-password"
      />
    </div>

    <div class="form-group">
      <label for="password">Password</label>
      <input
        id="password"
        v-model="password"
        type="password"
        name="login-password-field"
        class="win-input"
        placeholder="••••••••"
        required
        :disabled="loading"
        autocomplete="new-password"
      />
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <button type="submit" class="win-button win-button-primary login-button" :disabled="loading">
      <span v-if="loading">Memproses...</span>
      <span v-else>Masuk</span>
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{
  (e: 'submit', credentials: { email: string; password: string }): void
}>()

defineProps<{
  loading: boolean
  error: string
}>()

const email = ref('')
const password = ref('')

function handleSubmit() {
  emit('submit', {
    email: email.value,
    password: password.value
  })
}
</script>

<style scoped>
.login-form {
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.win-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  font-size: 14px;
  font-family: inherit;
  background: #fff;
  transition: border-color 0.2s;
}

.win-input:focus {
  border-color: #0078d4;
  outline: none;
}

.win-input:disabled {
  background: #f5f5f5;
  color: #999;
}

.login-button {
  width: 100%;
  padding: 14px;
  font-size: 15px;
  font-weight: 600;
  background: #0078d4;
  color: white;
  border: none;
  cursor: pointer;
  transition: background 0.2s;
}

.login-button:hover:not(:disabled) {
  background: #005a9e;
}

.login-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.error-message {
  padding: 12px;
  background-color: #fef0f0;
  color: #d13438;
  border: 1px solid #f5c6c6;
  margin-bottom: 16px;
  font-size: 13px;
}
</style>
