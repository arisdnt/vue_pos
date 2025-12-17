<template>
  <form @submit.prevent="handleSubmit" class="supplier-form">
    <div class="form-section">
      <div class="section-title">Informasi Supplier</div>
      <div class="form-grid form-grid-2">
        <WinField label="Nama Supplier" required>
          <WinInput v-model="localData.name" placeholder="Nama supplier" required />
        </WinField>
        <WinField label="Kota">
          <WinInput v-model="localData.city" placeholder="Kota (opsional)" />
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
      <WinField label="Alamat">
        <WinTextarea v-model="localData.address" placeholder="Alamat lengkap (opsional)" rows="2" />
      </WinField>
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
import { WinField, WinInput, WinSelect, WinTextarea, WinButton } from '@/components/base'

type StoreOption = { id: string; name: string }

const props = defineProps<{
  modelValue: any
  stores: StoreOption[]
  saving?: boolean
  showStoreSelect?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const localData = ref({ ...props.modelValue })

watch(() => props.modelValue, (val) => { localData.value = { ...val } }, { deep: true })
watch(localData, (val) => { emit('update:modelValue', val) }, { deep: true })

function handleSubmit() {
  emit('submit')
}
</script>

<style scoped>
.supplier-form { display: flex; flex-direction: column; gap: 20px; }
.form-section { display: flex; flex-direction: column; gap: 12px; }
.section-title { font-size: 13px; font-weight: 600; color: var(--win-text-secondary, #666); text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px; border-bottom: 1px solid var(--win-border, #ccc); }
.form-grid { display: grid; gap: 16px; }
.form-grid-2 { grid-template-columns: repeat(2, 1fr); }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 4px; padding-top: 16px; border-top: 1px solid var(--win-border, #ccc); }
@media (max-width: 768px) { .form-grid-2 { grid-template-columns: 1fr; } }
</style>
