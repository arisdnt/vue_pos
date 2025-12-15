<template>
  <form @submit.prevent="emit('submit')">
    <div class="form-group">
      <label for="name" class="form-label">Nama Toko *</label>
      <WinInput 
        id="name"
        :model-value="modelValue.name"
        @update:model-value="update('name', $event)"
        placeholder="Nama toko"
        required
      />
    </div>

    <div class="form-group">
      <label for="description" class="form-label">Deskripsi</label>
      <WinTextarea 
        id="description"
        :model-value="modelValue.description || ''"
        @update:model-value="update('description', $event)"
        placeholder="Deskripsi toko"
        :rows="3"
      />
    </div>

    <div class="form-group">
      <label for="address_line1" class="form-label">Alamat</label>
      <WinInput 
        id="address_line1"
        :model-value="modelValue.address_line1 || ''"
        @update:model-value="update('address_line1', $event)"
        placeholder="Alamat lengkap"
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="city" class="form-label">Kota</label>
        <WinInput 
          id="city"
          :model-value="modelValue.city || ''"
          @update:model-value="update('city', $event)"
          placeholder="Kota"
        />
      </div>

      <div class="form-group">
        <label for="province" class="form-label">Provinsi</label>
        <WinInput 
          id="province"
          :model-value="modelValue.province || ''"
          @update:model-value="update('province', $event)"
          placeholder="Provinsi"
        />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="phone" class="form-label">Telepon</label>
        <WinInput 
          id="phone"
          :model-value="modelValue.phone || ''"
          @update:model-value="update('phone', $event)"
          type="tel"
          placeholder="08xxxxxxxxxx"
        />
      </div>

      <div class="form-group">
        <label for="email" class="form-label">Email</label>
        <WinInput 
          id="email"
          :model-value="modelValue.email || ''"
          @update:model-value="update('email', $event)"
          type="email"
          placeholder="email@example.com"
        />
      </div>
    </div>

    <div class="form-group">
      <label class="checkbox-label">
        <WinCheckbox 
          :model-value="modelValue.active"
          @update:model-value="update('active', $event)"
        />
        <span>Toko Aktif</span>
      </label>
    </div>

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
import { WinInput, WinTextarea, WinCheckbox, WinButton } from '@/components/base'
import type { Database } from '@/types/database'

type StoreFormData = Partial<Database['public']['Tables']['stores']['Insert']>

const props = defineProps<{
  modelValue: StoreFormData
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: StoreFormData): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

function update(key: keyof StoreFormData, value: any) {
  emit('update:modelValue', { ...props.modelValue, [key]: value })
}
</script>

<style scoped>
.form-group {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e5e7eb;
}
</style>
