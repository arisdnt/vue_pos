<template>
  <form class="category-form" @submit.prevent="handleSubmit">
    <WinField label="Nama Kategori" required>
      <WinInput 
        v-model="localData.name" 
        placeholder="Contoh: Makanan, Minuman, Elektronik"
      />
    </WinField>

    <WinField label="Deskripsi">
      <WinTextarea 
        v-model="localData.description" 
        placeholder="Deskripsi kategori (opsional)"
        rows="2"
      />
    </WinField>

    <WinField label="Kategori Induk">
      <WinSelect 
        v-model="localData.parent_id" 
        :options="parentOptions"
        placeholder="-- Pilih kategori induk (opsional) --"
      />
      <template #hint>
        Kosongkan jika ini adalah kategori utama
      </template>
    </WinField>

    <WinField label="Urutan Tampil">
      <WinInput 
        v-model.number="localData.display_order" 
        type="number"
        placeholder="0"
      />
    </WinField>

    <WinField>
      <WinCheckbox v-model="localData.displays_on_pos">
        Tampilkan di POS
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
import { ref, watch, computed } from 'vue'
import { WinField, WinInput, WinTextarea, WinSelect, WinCheckbox, WinButton } from '@/components/base'
import type { Database } from '@/types/database'

type ProductCategoryInsert = Database['public']['Tables']['product_categories']['Insert']

const props = defineProps<{
  modelValue: Partial<ProductCategoryInsert>
  parentCategories?: { id: string; name: string }[]
  saving?: boolean
  excludeId?: string // Exclude this category from parent options (when editing)
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<ProductCategoryInsert>): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const localData = ref<Partial<ProductCategoryInsert>>({ ...props.modelValue })

// Build parent options for select
const parentOptions = computed(() => {
  const options = (props.parentCategories || [])
    .filter(c => c.id !== props.excludeId) // Exclude self when editing
    .map(c => ({
      value: c.id,
      label: c.name
    }))
  
  return [
    { value: null, label: '-- Kategori Utama --' },
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
.category-form {
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
