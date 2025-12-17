<template>
  <WinPage>
    <WinPageHeader title="Produk">
      <template #actions>
        <WinButton variant="primary" @click="openCreateModal">+ Tambah Produk</WinButton>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <WinCard no-padding>
        <div class="table-container">
          <div class="filter-section">
            <WinTableFilter v-model:searchQuery="searchQuery" v-model:filters="filters" :columns="filterColumns" searchPlaceholder="Cari nama, SKU, barcode..." />
            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">{{ error }}</WinAlert>
          </div>

          <WinTable :columns="columns" :data="filteredProducts" :loading="loading" :max-height="'100%'" empty-text="Tidak ada data produk" actions>
            <template #cell(status)="{ row }">
              <WinBadge :variant="row.status === 'available' ? 'success' : 'error'">{{ row.status === 'available' ? 'Tersedia' : 'Tidak Tersedia' }}</WinBadge>
            </template>
            <template #cell(category_name)="{ row }">{{ row.category_name || '-' }}</template>
            <template #cell(barcode)="{ row }">{{ row.barcode || '-' }}</template>
            <template #actions="{ row }">
              <WinIconButton :icon="Eye" size="sm" tooltip="Detail" @click="viewDetail(row)" />
              <WinIconButton :icon="Pencil" size="sm" tooltip="Edit" @click="openEditModal(row)" />
              <WinIconButton :icon="Trash2" size="sm" variant="danger" tooltip="Hapus" @click="confirmDelete(row)" />
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal" :title="modalMode === 'create' ? 'Tambah Produk' : 'Edit Produk'" size="lg">
      <WinAlert v-if="formError" type="error" :closeable="true" @close="formError = ''">{{ formError }}</WinAlert>
      <ProductForm v-model="formData" :categories="categories" :stores="storesOptions" :unit-groups="unitGroups" :tax-groups="taxGroups" :saving="saving" :show-store-select="showStoreSelect" @submit="handleSubmit" @cancel="closeModal" />
    </WinModal>

    <WinModal v-model="showDetailModal" title="Detail Produk" size="md">
      <ProductDetail :product="selectedProduct" />
      <template #footer>
        <WinButton variant="primary" @click="showDetailModal = false">Tutup</WinButton>
      </template>
    </WinModal>

    <WinDialog v-model="showDeleteDialog" title="Konfirmasi Hapus" message="Apakah Anda yakin ingin menghapus produk ini?" confirm-text="Hapus" cancel-text="Batal" @confirm="deleteProductConfirmed" />
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter, WinButton, WinIconButton, WinBadge, WinAlert, WinModal, WinDialog } from '@/components/base'
import ProductForm from '@/components/products/ProductForm.vue'
import ProductDetail from '@/components/products/ProductDetail.vue'
import { useProducts, type ProductWithCategory } from '@/composables/useProducts'
import { useAuthStore } from '@/stores/authStore'
import type { Database } from '@/types/database'

type ProductInsert = Database['public']['Tables']['products']['Insert']

const { products, categories, unitGroups, taxGroups, loading, error, createProduct, updateProduct, deleteProduct, filterProducts } = useProducts()

const authStore = useAuthStore()
const storesOptions = computed(() => (authStore.accessibleStores || []).map((s: any) => ({ id: s.id, name: s.name })))
const showStoreSelect = computed(() => authStore.isOwner && storesOptions.value.length > 1)

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showModal = ref(false)
const showDetailModal = ref(false)
const showDeleteDialog = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedProduct = ref<ProductWithCategory | null>(null)
const saving = ref(false)
const formError = ref('')
const defaultFormData: Partial<ProductInsert> = { name: '', sku: '', barcode: '', category_id: '', status: 'available', description: '', stock_management: 'enabled', type: 'tangible', searchable: true }
const formData = ref<Partial<ProductInsert>>({ ...defaultFormData })

const columns = [
  { key: 'name', label: 'Nama Produk', width: '220px' },
  { key: 'sku', label: 'SKU', width: '120px' },
  { key: 'barcode', label: 'Barcode', width: '140px' },
  { key: 'category_name', label: 'Kategori', width: '150px' },
  { key: 'status', label: 'Status', width: '110px' }
]

const filterColumns = computed(() => [
  { key: 'status', label: 'Status', filterType: 'select' as const, filterOptions: [{ value: 'available', label: 'Tersedia' }, { value: 'unavailable', label: 'Tidak Tersedia' }] },
  { key: 'category_id', label: 'Kategori', filterType: 'select' as const, filterOptions: categories.value.map(c => ({ value: c.id, label: c.name })) }
])

const filteredProducts = computed(() => filterProducts(searchQuery.value, filters.value))

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { ...defaultFormData, store_id: storesOptions.value[0]?.id ?? '' }
  formError.value = ''
  showModal.value = true
}

function openEditModal(product: ProductWithCategory) {
  modalMode.value = 'edit'
  formData.value = { name: product.name, sku: product.sku, barcode: product.barcode, category_id: product.category_id, status: product.status, description: product.description, store_id: product.store_id, unit_group_id: product.unit_group_id, tax_group_id: product.tax_group_id, type: product.type, stock_management: product.stock_management, searchable: product.searchable }
  selectedProduct.value = product
  formError.value = ''
  showModal.value = true
}

function viewDetail(product: ProductWithCategory) {
  selectedProduct.value = product
  showDetailModal.value = true
}

function confirmDelete(product: ProductWithCategory) {
  selectedProduct.value = product
  showDeleteDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''
  try {
    if (modalMode.value === 'create') await createProduct(formData.value)
    else if (selectedProduct.value) await updateProduct(selectedProduct.value.id, formData.value)
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Gagal menyimpan data'
  } finally {
    saving.value = false
  }
}

async function deleteProductConfirmed() {
  if (!selectedProduct.value) return
  try {
    await deleteProduct(selectedProduct.value.id)
    showDeleteDialog.value = false
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus produk'
  }
}

function closeModal() {
  showModal.value = false
  selectedProduct.value = null
  formData.value = { ...defaultFormData }
}
</script>

<style scoped>
.table-container { display: flex; flex-direction: column; height: 100%; }
.filter-section { padding: 6px 12px; flex-shrink: 0; }
</style>
