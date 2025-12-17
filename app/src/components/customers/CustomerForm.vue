<template>
  <form @submit.prevent="handleSubmit" class="customer-form">
    <div class="form-section">
      <div class="section-title">Informasi Dasar</div>
      <div class="form-grid form-grid-2">
        <WinField label="Nama Depan" required>
          <WinInput v-model="localData.first_name" placeholder="Nama depan" required />
        </WinField>
        <WinField label="Nama Belakang">
          <WinInput v-model="localData.last_name" placeholder="Nama belakang (opsional)" />
        </WinField>
      </div>
      <div class="form-grid form-grid-2">
        <WinField label="Email">
          <WinInput v-model="localData.email" type="email" placeholder="Email (opsional)" />
        </WinField>
        <WinField label="Telepon">
          <WinInput v-model="localData.phone" placeholder="Telepon (opsional)" />
        </WinField>
      </div>
      <div class="form-grid form-grid-2">
        <WinField label="Jenis Kelamin">
          <WinSelect v-model="localData.gender">
            <option value="">-- Pilih --</option>
            <option value="male">Laki-laki</option>
            <option value="female">Perempuan</option>
            <option value="other">Lainnya</option>
          </WinSelect>
        </WinField>
        <WinField label="Tanggal Lahir">
          <WinInput v-model="localData.birth_date" type="date" />
        </WinField>
      </div>
      <WinField v-if="showStoreSelect" label="Toko" required>
        <WinSelect v-model="localData.store_id" required>
          <option value="">-- Pilih Toko --</option>
          <option v-for="s in stores" :key="s.id" :value="s.id">{{ s.name }}</option>
        </WinSelect>
      </WinField>
    </div>
    <div class="form-actions">
      <WinButton type="button" variant="default" @click="$emit('cancel')">Batal</WinButton>
      <WinButton type="submit" variant="primary" :loading="saving">{{ saving ? 'Menyimpan...' : 'Simpan' }}</WinButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { WinField, WinInput, WinSelect, WinButton } from '@/components/base'
import type { Database } from '@/types/database'

type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type StoreOption = { id: string; name: string }

const props = defineProps<{
  modelValue: Partial<CustomerInsert>
  stores: StoreOption[]
  saving?: boolean
  showStoreSelect?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<CustomerInsert>): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const localData = ref<Partial<CustomerInsert>>({ ...props.modelValue })

watch(() => props.modelValue, (val) => { localData.value = { ...val } }, { deep: true })
watch(localData, (val) => { emit('update:modelValue', val) }, { deep: true })

function handleSubmit() {
  emit('submit')
}
</script>

<style scoped>
.customer-form { display: flex; flex-direction: column; gap: 20px; }
.form-section { display: flex; flex-direction: column; gap: 12px; }
.section-title { font-size: 13px; font-weight: 600; color: var(--win-text-secondary, #666); text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px; border-bottom: 1px solid var(--win-border, #ccc); }
.form-grid { display: grid; gap: 16px; }
.form-grid-2 { grid-template-columns: repeat(2, 1fr); }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; padding-top: 16px; border-top: 1px solid var(--win-border, #ccc); }
@media (max-width: 768px) { .form-grid-2 { grid-template-columns: 1fr; } }
</style>
