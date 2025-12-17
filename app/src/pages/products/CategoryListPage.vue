<template>
  <WinPage>
    <WinPageHeader title="Kategori Produk">
      <template #actions>
        <WinButton variant="primary" @click="openCreateModal">+ Tambah Kategori</WinButton>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <WinCard no-padding>
        <div class="table-container">
          <div class="filter-section">
            <WinTableFilter
              v-model:searchQuery="searchQuery"
              v-model:filters="filters"
              :columns="filterColumns"
              searchPlaceholder="Cari kategori..."
            />
            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">{{ error }}</WinAlert>
          </div>

          <WinTable :columns="columns" :data="filteredCategories" :loading="loading" :max-height="'100%'" empty-text="Tidak ada kategori produk" actions>
            <template #cell(display_order)="{ row }"><span class="order-badge">{{ row.display_order }}</span></template>
            <template #cell(name)="{ row }">
              <span :class="{ 'has-parent': row.parent_id }">
                <span v-if="row.parent_id" class="parent-indicator">└</span>{{ row.name }}
              </span>
            </template>
            <template #cell(parent_id)="{ row }">{{ row.parent_id ? getParentName(row.parent_id) : '-' }}</template>
            <template #cell(displays_on_pos)="{ row }">
              <WinBadge :variant="row.displays_on_pos ? 'success' : 'warning'">{{ row.displays_on_pos ? 'Ya' : 'Tidak' }}</WinBadge>
            </template>
            <template #cell(total_items)="{ row }"><span class="item-count">{{ row.total_items || 0 }}</span></template>
            <template #actions="{ row }">
              <WinIconButton :icon="Pencil" size="sm" tooltip="Edit" @click="openEditModal(row)" />
              <WinIconButton :icon="Trash2" size="sm" variant="danger" tooltip="Hapus" @click="confirmDelete(row)" />
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal" :title="modalMode === 'create' ? 'Tambah Kategori' : 'Edit Kategori'" size="md">
      <WinAlert v-if="formError" type="error" :closeable="true" @close="formError = ''">{{ formError }}</WinAlert>
      <CategoryForm v-model="formData" :parent-categories="parentCategories" :exclude-id="selectedCategory?.id" :saving="saving" @submit="handleSubmit" @cancel="closeModal" />
    </WinModal>

    <WinDialog v-model="showDeleteDialog" title="Konfirmasi Hapus" message="Apakah Anda yakin ingin menghapus kategori ini?" confirm-text="Hapus" cancel-text="Batal" @confirm="deleteCategoryConfirmed" />
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter, WinButton, WinIconButton, WinBadge, WinAlert, WinModal, WinDialog } from '@/components/base'
import CategoryForm from '@/components/products/CategoryForm.vue'
import { useProductCategories } from '@/composables/useProductCategories'
import type { Database } from '@/types/database'

type ProductCategory = Database['public']['Tables']['product_categories']['Row']
type ProductCategoryInsert = Database['public']['Tables']['product_categories']['Insert']

const { categories, parentCategories, loading, error, fetchCategories, fetchParentCategories, createCategory, updateCategory, deleteCategory, filterCategories } = useProductCategories()

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showModal = ref(false)
const showDeleteDialog = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedCategory = ref<ProductCategory | null>(null)
const saving = ref(false)
const formError = ref('')
const defaultFormData: Partial<ProductCategoryInsert> = { name: '', description: '', parent_id: null, display_order: 0, displays_on_pos: true }
const formData = ref<Partial<ProductCategoryInsert>>({ ...defaultFormData })

const columns = [
  { key: 'display_order', label: '#', width: '50px' },
  { key: 'name', label: 'Nama Kategori', width: '200px' },
  { key: 'parent_id', label: 'Induk', width: '150px' },
  { key: 'description', label: 'Deskripsi', width: '250px' },
  { key: 'displays_on_pos', label: 'Tampil POS', width: '100px' },
  { key: 'total_items', label: 'Produk', width: '80px' }
]

const filterColumns = [
  { key: 'displays_on_pos', label: 'Tampil POS', filterType: 'select' as const, filterOptions: [{ value: 'true', label: 'Ya' }, { value: 'false', label: 'Tidak' }] },
  { key: 'parent_id', label: 'Tipe', filterType: 'select' as const, filterOptions: [{ value: 'null', label: 'Kategori Utama' }] }
]

const filteredCategories = computed(() => filterCategories(searchQuery.value, filters.value))

function getParentName(parentId: string): string {
  return categories.value.find(c => c.id === parentId)?.name || '-'
}

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { ...defaultFormData }
  formError.value = ''
  showModal.value = true
}

function openEditModal(category: ProductCategory) {
  modalMode.value = 'edit'
  formData.value = { name: category.name, description: category.description, parent_id: category.parent_id, display_order: category.display_order, displays_on_pos: category.displays_on_pos }
  selectedCategory.value = category
  formError.value = ''
  showModal.value = true
}

function confirmDelete(category: ProductCategory) {
  selectedCategory.value = category
  showDeleteDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''
  try {
    if (modalMode.value === 'create') await createCategory(formData.value as ProductCategoryInsert)
    else if (selectedCategory.value) await updateCategory(selectedCategory.value.id, formData.value)
    await fetchCategories()
    await fetchParentCategories()
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Gagal menyimpan data'
  } finally {
    saving.value = false
  }
}

async function deleteCategoryConfirmed() {
  if (!selectedCategory.value) return
  try {
    await deleteCategory(selectedCategory.value.id)
    await fetchCategories()
    await fetchParentCategories()
    showDeleteDialog.value = false
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus kategori'
  }
}

function closeModal() {
  showModal.value = false
  selectedCategory.value = null
  formData.value = { ...defaultFormData }
}

onMounted(async () => {
  await fetchCategories()
  await fetchParentCategories()
})
</script>

<style scoped>
.table-container { display: flex; flex-direction: column; height: 100%; }
.filter-section { padding: 6px 12px; flex-shrink: 0; }
.order-badge { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; background-color: var(--win-bg); border: 1px solid var(--win-border); border-radius: 4px; font-size: 12px; font-weight: 500; color: var(--win-text-secondary); }
.has-parent { padding-left: 8px; }
.parent-indicator { color: var(--win-text-disabled); margin-right: 4px; }
.item-count { display: inline-flex; align-items: center; justify-content: center; min-width: 24px; height: 20px; padding: 0 6px; background-color: var(--win-accent-light, rgba(0, 120, 212, 0.1)); border-radius: 10px; font-size: 11px; font-weight: 500; color: var(--win-accent); }
</style>
