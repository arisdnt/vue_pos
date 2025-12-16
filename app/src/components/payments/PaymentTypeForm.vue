<template>
  <form class="payment-form" @submit.prevent="handleSubmit">
    <WinField label="Label" required>
      <WinInput 
        v-model="localData.label" 
        placeholder="Contoh: Tunai, QRIS, Transfer Bank"
        :disabled="localData.readonly"
      />
    </WinField>

    <WinField label="Identifier" required>
      <WinInput 
        v-model="localData.identifier" 
        placeholder="Contoh: cash, qris, bank_transfer"
        :disabled="localData.readonly"
      />
      <template #hint>
        Identifier unik untuk sistem (huruf kecil, underscore)
      </template>
    </WinField>

    <WinField label="Deskripsi">
      <WinTextarea 
        v-model="localData.description" 
        placeholder="Deskripsi metode pembayaran"
        rows="2"
      />
    </WinField>

    <WinField label="Prioritas">
      <WinInput 
        v-model.number="localData.priority" 
        type="number"
        placeholder="Urutan tampil (1 = paling atas)"
      />
    </WinField>

    <WinField label="Icon">
      <WinInput 
        v-model="localData.icon" 
        placeholder="Nama icon (opsional)"
      />
    </WinField>

    <WinField>
      <WinCheckbox v-model="localData.active">
        Aktif
      </WinCheckbox>
    </WinField>

    <div class="form-actions">
      <WinButton type="button" variant="secondary" @click="$emit('cancel')">
        Batal
      </WinButton>
      <WinButton type="submit" variant="primary" :loading="saving">
        Simpan
      </WinButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { WinField, WinInput, WinTextarea, WinCheckbox, WinButton } from '@/components/base'
import type { Database } from '@/types/database'

type PaymentTypeInsert = Database['public']['Tables']['payment_types']['Insert']

const props = defineProps<{
  modelValue: Partial<PaymentTypeInsert>
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<PaymentTypeInsert>): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const localData = ref<Partial<PaymentTypeInsert>>({ ...props.modelValue })

watch(() => props.modelValue, (newVal) => {
  localData.value = { ...newVal }
}, { deep: true })

watch(localData, (newVal) => {
  emit('update:modelValue', newVal)
}, { deep: true })

function handleSubmit() {
  emit('submit')
}
</script>

<style scoped>
.payment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid var(--win-border);
}
</style>
