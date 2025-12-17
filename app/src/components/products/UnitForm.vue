<template>
  <form class="unit-form" @submit.prevent="handleSubmit">
    <WinField label="Nama Satuan" required>
      <WinInput 
        v-model="localData.name" 
        placeholder="Contoh: Pcs, Kg, Liter"
      />
    </WinField>

    <WinField label="Identifier" required>
      <WinInput 
        v-model="localData.identifier" 
        placeholder="Contoh: pcs, kg, l"
      />
      <template #hint>
        Kode pendek untuk satuan (huruf kecil)
      </template>
    </WinField>

    <WinField label="Grup Satuan">
      <WinSelect 
        v-model="localData.group_id" 
        :options="groupOptions"
        placeholder="-- Pilih grup satuan --"
      />
    </WinField>

    <WinField label="Nilai Konversi">
      <WinInput 
        v-model.number="localData.value" 
        type="number"
        step="0.00001"
        placeholder="1"
      />
      <template #hint>
        Nilai relatif terhadap satuan dasar dalam grup (misal: 1 Kg = 1000 Gram)
      </template>
    </WinField>

    <WinField label="Deskripsi">
      <WinTextarea 
        v-model="localData.description" 
        placeholder="Deskripsi satuan (opsional)"
        rows="2"
      />
    </WinField>

    <WinField>
      <WinCheckbox v-model="localData.base_unit">
        Satuan Dasar
      </WinCheckbox>
      <template #hint>
        Satuan dasar dalam grup (nilai konversi = 1)
      </template>
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
import { ref, watch, computed } from 'vue'
import { WinField, WinInput, WinTextarea, WinSelect, WinCheckbox, WinButton } from '@/components/base'
import type { Database } from '@/types/database'

type UnitInsert = Database['public']['Tables']['units']['Insert']
type UnitGroup = Database['public']['Tables']['unit_groups']['Row']

const props = defineProps<{
  modelValue: Partial<UnitInsert>
  unitGroups?: UnitGroup[]
  saving?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<UnitInsert>): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const localData = ref<Partial<UnitInsert>>({ ...props.modelValue })

// Build group options for select
const groupOptions = computed(() => {
  const options = (props.unitGroups || []).map(g => ({
    value: g.id,
    label: g.name
  }))
  
  return [
    { value: null, label: '-- Tanpa Grup --' },
    ...options
  ]
})

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
.unit-form {
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
