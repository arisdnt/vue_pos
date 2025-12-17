<template>
  <form @submit.prevent="emit('submit')">
    <WinField label="Email" :error="errors?.email" required>
      <WinInput 
        :model-value="modelValue.email"
        @update:model-value="update('email', $event)"
        type="email" 
        :disabled="mode === 'edit'"
        required
      />
    </WinField>

    <WinField v-if="mode === 'create'" label="Password" :error="errors?.password" required>
      <WinInput 
        :model-value="modelValue.password"
        @update:model-value="update('password', $event)"
        type="password" 
        required
      />
    </WinField>

    <WinField label="Role" :error="errors?.role" required>
      <WinSelect 
        :model-value="modelValue.role"
        @update:model-value="update('role', $event)"
        required
      >
        <option value="">Pilih Role</option>
        <option value="owner">Owner</option>
        <option value="manager">Manager</option>
        <option value="cashier">Cashier</option>
      </WinSelect>
    </WinField>

    <WinField label="Status" :error="errors?.status" required>
      <WinSelect 
        :model-value="modelValue.status"
        @update:model-value="update('status', $event)"
        required
      >
        <option value="">Pilih Status</option>
        <option value="active">Aktif</option>
        <option value="inactive">Nonaktif</option>
      </WinSelect>
    </WinField>

    <!-- Store Assignment (only for Manager/Cashier) -->
    <UserStoreAssignment
      v-if="showStoreAssignment"
      :user-id="userId"
      :model-value="storeIds || []"
      @update:model-value="updateStores"
    />

    <div class="modal-actions">
      <WinButton type="button" @click="emit('cancel')">
        Batal
      </WinButton>
      <WinButton type="submit" variant="primary" :disabled="saving">
        {{ saving ? 'Menyimpan...' : 'Simpan' }}
      </WinButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { WinInput, WinSelect, WinButton, WinField } from '@/components/base'
import UserStoreAssignment from './UserStoreAssignment.vue'

interface UserFormData {
  email: string
  password?: string
  role: string
  status: string
}

const props = defineProps<{
  modelValue: UserFormData
  mode: 'create' | 'edit'
  userId?: string
  storeIds?: string[]
  saving?: boolean
  errors?: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: UserFormData): void
  (e: 'update:storeIds', value: string[]): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const showStoreAssignment = computed(() => {
  return props.modelValue.role === 'manager' || props.modelValue.role === 'cashier'
})

function update(key: keyof UserFormData, value: any) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}

function updateStores(storeIds: string[]) {
  emit('update:storeIds', storeIds)
}
</script>

<style scoped>
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
</style>
