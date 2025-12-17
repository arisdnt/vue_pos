<template>
  <form @submit.prevent="handleSubmit" class="product-form">
    <!-- Section: Informasi Dasar -->
    <div class="form-section">
      <div class="section-title">Informasi Dasar</div>
      <div class="form-grid form-grid-3">
        <WinField label="Nama Produk" required>
          <WinInput
            v-model="localData.name"
            placeholder="Masukkan nama produk"
            required
          />
        </WinField>

        <WinField label="SKU" required>
          <WinInput
            v-model="localData.sku"
            placeholder="SKU-001"
            required
          />
        </WinField>

        <WinField label="Barcode">
          <WinInput
            v-model="localData.barcode"
            placeholder="Barcode (opsional)"
          />
        </WinField>
      </div>
    </div>

    <!-- Section: Organisasi -->
    <div class="form-section">
      <div class="section-title">Organisasi</div>
      <div class="form-grid form-grid-3">
        <WinField v-if="showStoreSelect !== false" label="Toko" required>
          <WinSelect v-model="localData.store_id" required>
            <option value="">-- Pilih Toko --</option>
            <option v-for="s in stores" :key="s.id" :value="s.id">
              {{ s.name }}
            </option>
          </WinSelect>
        </WinField>

        <WinField label="Kategori">
          <WinSelect v-model="localData.category_id">
            <option value="">-- Pilih Kategori --</option>
            <option v-for="cat in categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </WinSelect>
        </WinField>

        <WinField label="Grup Satuan">
          <WinSelect v-model="localData.unit_group_id">
            <option value="">-- Pilih Grup Satuan --</option>
            <option v-for="g in unitGroups" :key="g.id" :value="g.id">
              {{ g.name }}
            </option>
          </WinSelect>
        </WinField>
      </div>
    </div>

    <!-- Section: Konfigurasi -->
    <div class="form-section">
      <div class="section-title">Konfigurasi</div>
      <div class="form-grid form-grid-4">
        <WinField label="Status">
          <WinSelect v-model="localData.status">
            <option value="available">Tersedia</option>
            <option value="unavailable">Tidak Tersedia</option>
          </WinSelect>
        </WinField>

        <WinField label="Jenis Produk">
          <WinSelect v-model="localData.type">
            <option value="tangible">Barang</option>
            <option value="service">Jasa</option>
          </WinSelect>
        </WinField>

        <WinField label="Manajemen Stok">
          <WinSelect v-model="localData.stock_management">
            <option value="enabled">Aktif</option>
            <option value="disabled">Nonaktif</option>
          </WinSelect>
        </WinField>

        <WinField label="Grup Pajak">
          <WinSelect v-model="localData.tax_group_id">
            <option value="">-- Tanpa Pajak --</option>
            <option v-for="tg in taxGroups" :key="tg.id" :value="tg.id">
              {{ tg.name }}
            </option>
          </WinSelect>
        </WinField>
      </div>

      <div class="form-checkbox-row">
        <WinCheckbox v-model="localData.searchable">
          Tampilkan saat pencarian produk
        </WinCheckbox>
      </div>
    </div>

    <!-- Section: Deskripsi -->
    <div class="form-section">
      <WinField label="Deskripsi">
        <WinTextarea
          v-model="localData.description"
          placeholder="Deskripsi produk (opsional)"
          rows="2"
        />
      </WinField>
    </div>

    <div class="form-actions">
      <WinButton type="button" variant="default" @click="$emit('cancel')">
        Batal
      </WinButton>
      <WinButton type="submit" variant="primary" :loading="saving">
        {{ saving ? 'Menyimpan...' : 'Simpan' }}
      </WinButton>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { WinField, WinInput, WinSelect, WinTextarea, WinButton, WinCheckbox } from '@/components/base'
import type { Database } from '@/types/database'

type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductCategory = Database['public']['Tables']['product_categories']['Row']
type UnitGroup = Database['public']['Tables']['unit_groups']['Row']
type TaxGroup = Database['public']['Tables']['tax_groups']['Row']

type StoreOption = { id: string; name: string }

const props = defineProps<{
  modelValue: Partial<ProductInsert>
  categories: ProductCategory[]
  stores: StoreOption[]
  unitGroups: UnitGroup[]
  taxGroups: TaxGroup[]
  saving?: boolean
  showStoreSelect?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Partial<ProductInsert>): void
  (e: 'submit'): void
  (e: 'cancel'): void
}>()

const localData = ref<Partial<ProductInsert>>({ ...props.modelValue })

watch(
  () => props.modelValue,
  (val) => {
    localData.value = { ...val }
  },
  { deep: true },
)

watch(
  localData,
  (val) => {
    emit('update:modelValue', val)
  },
  { deep: true },
)

function handleSubmit() {
  emit('submit')
}
</script>

<style scoped>
.product-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--win-text-secondary, #666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--win-border, #ccc);
}

.form-grid {
  display: grid;
  gap: 16px;
}

.form-grid-2 {
  grid-template-columns: repeat(2, 1fr);
}

.form-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.form-grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.form-checkbox-row {
  padding-top: 8px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
  padding-top: 16px;
  border-top: 1px solid var(--win-border, #ccc);
}

/* Responsive: pada layar kecil, kurangi kolom */
@media (max-width: 768px) {
  .form-grid-3,
  .form-grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .form-grid-2,
  .form-grid-3,
  .form-grid-4 {
    grid-template-columns: 1fr;
  }
}
</style>
