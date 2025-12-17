<template>
  <WinPage>
    <WinPageHeader title="Supplier">
      <template #actions>
        <WinButton variant="primary" @click="openCreateModal">+ Tambah Supplier</WinButton>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <WinCard no-padding>
        <div class="table-container">
          <div class="filter-section">
            <WinTableFilter v-model:searchQuery="searchQuery" searchPlaceholder="Cari nama, email, telepon, kota..." />
            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">{{ error }}</WinAlert>
          </div>

          <WinTable :columns="columns" :data="filteredSuppliers" :loading="loading" :max-height="'100%'" empty-text="Tidak ada data supplier" actions>
            <template #cell(email)="{ row }">{{ row.email || '-' }}</template>
            <template #cell(phone)="{ row }">{{ row.phone || '-' }}</template>
            <template #cell(city)="{ row }">{{ row.city || '-' }}</template>
            <template #actions="{ row }">
              <WinIconButton :icon="Pencil" size="sm" tooltip="Edit" @click="openEditModal(row)" />
              <WinIconButton :icon="Trash2" size="sm" variant="danger" tooltip="Hapus" @click="confirmDelete(row)" />
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal" :title="modalMode === 'create' ? 'Tambah Supplier' : 'Edit Supplier'" size="md">
      <WinAlert v-if="formError" type="error" :closeable="true" @close="formError = ''">{{ formError }}</WinAlert>
      <SupplierForm v-model="formData" :stores="storesOptions" :saving="saving" :show-store-select="showStoreSelect" @submit="handleSubmit" @cancel="closeModal" />
    </WinModal>

    <WinDialog v-model="showDeleteDialog" title="Konfirmasi Hapus" message="Apakah Anda yakin ingin menghapus supplier ini?" confirm-text="Hapus" cancel-text="Batal" @confirm="deleteSupplierConfirmed" />
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter, WinButton, WinIconButton, WinAlert, WinModal, WinDialog } from '@/components/base'
import SupplierForm from '@/components/suppliers/SupplierForm.vue'
import { useSuppliers } from '@/composables/useSuppliers'
import { useAuthStore } from '@/stores/authStore'

const { suppliers, loading, error, createSupplier, updateSupplier, deleteSupplier, filterSuppliers } = useSuppliers()

const authStore = useAuthStore()
const storesOptions = computed(() => (authStore.accessibleStores || []).map((s: any) => ({ id: s.id, name: s.name })))
const showStoreSelect = computed(() => authStore.isOwner && storesOptions.value.length > 1)

const searchQuery = ref('')
const showModal = ref(false)
const showDeleteDialog = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedSupplier = ref<any | null>(null)
const saving = ref(false)
const formError = ref('')
const defaultFormData = { name: '', email: '', phone: '', address: '', city: '' }
const formData = ref({ ...defaultFormData })

const columns = [
  { key: 'name', label: 'Nama Supplier', width: '200px' },
  { key: 'email', label: 'Email', width: '180px' },
  { key: 'phone', label: 'Telepon', width: '140px' },
  { key: 'city', label: 'Kota', width: '150px' }
]

const filteredSuppliers = computed(() => filterSuppliers(searchQuery.value))

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { ...defaultFormData, store_id: storesOptions.value[0]?.id ?? '' }
  formError.value = ''
  showModal.value = true
}

function openEditModal(supplier: any) {
  modalMode.value = 'edit'
  formData.value = { name: supplier.name, email: supplier.email, phone: supplier.phone, address: supplier.address, city: supplier.city, store_id: supplier.store_id }
  selectedSupplier.value = supplier
  formError.value = ''
  showModal.value = true
}

function confirmDelete(supplier: any) {
  selectedSupplier.value = supplier
  showDeleteDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''
  try {
    if (modalMode.value === 'create') await createSupplier(formData.value)
    else if (selectedSupplier.value) await updateSupplier(selectedSupplier.value.id, formData.value)
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Gagal menyimpan data'
  } finally {
    saving.value = false
  }
}

async function deleteSupplierConfirmed() {
  if (!selectedSupplier.value) return
  try {
    await deleteSupplier(selectedSupplier.value.id)
    showDeleteDialog.value = false
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus supplier'
  }
}

function closeModal() {
  showModal.value = false
  selectedSupplier.value = null
  formData.value = { ...defaultFormData }
}
</script>

<style scoped>
.table-container { display: flex; flex-direction: column; height: 100%; }
.filter-section { padding: 6px 12px; flex-shrink: 0; }
</style>
