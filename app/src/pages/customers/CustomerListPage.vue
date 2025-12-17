<template>
  <WinPage>
    <WinPageHeader title="Pelanggan">
      <template #actions>
        <WinButton variant="primary" @click="openCreateModal">+ Tambah Pelanggan</WinButton>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <WinCard no-padding>
        <div class="table-container">
          <div class="filter-section">
            <WinTableFilter v-model:searchQuery="searchQuery" v-model:filters="filters" :columns="filterColumns" searchPlaceholder="Cari nama, email, telepon..." />
            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">{{ error }}</WinAlert>
          </div>

          <WinTable :columns="columns" :data="filteredCustomers" :loading="loading" :max-height="'100%'" empty-text="Tidak ada data pelanggan" actions>
            <template #cell(name)="{ row }">{{ row.first_name }} {{ row.last_name || '' }}</template>
            <template #cell(email)="{ row }">{{ row.email || '-' }}</template>
            <template #cell(phone)="{ row }">{{ row.phone || '-' }}</template>
            <template #cell(gender)="{ row }">{{ formatGender(row.gender) }}</template>
            <template #cell(birth_date)="{ row }">{{ formatDate(row.birth_date) }}</template>
            <template #actions="{ row }">
              <WinIconButton :icon="Eye" size="sm" tooltip="Detail" @click="viewDetail(row)" />
              <WinIconButton :icon="Pencil" size="sm" tooltip="Edit" @click="openEditModal(row)" />
              <WinIconButton :icon="Trash2" size="sm" variant="danger" tooltip="Hapus" @click="confirmDelete(row)" />
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal" :title="modalMode === 'create' ? 'Tambah Pelanggan' : 'Edit Pelanggan'" size="md">
      <WinAlert v-if="formError" type="error" :closeable="true" @close="formError = ''">{{ formError }}</WinAlert>
      <CustomerForm v-model="formData" :stores="storesOptions" :saving="saving" :show-store-select="showStoreSelect" @submit="handleSubmit" @cancel="closeModal" />
    </WinModal>

    <WinModal v-model="showDetailModal" title="Detail Pelanggan" size="md">
      <CustomerDetail :customer="selectedCustomer" />
      <template #footer>
        <WinButton variant="primary" @click="showDetailModal = false">Tutup</WinButton>
      </template>
    </WinModal>

    <WinDialog v-model="showDeleteDialog" title="Konfirmasi Hapus" message="Apakah Anda yakin ingin menghapus pelanggan ini?" confirm-text="Hapus" cancel-text="Batal" @confirm="deleteCustomerConfirmed" />
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter, WinButton, WinIconButton, WinAlert, WinModal, WinDialog } from '@/components/base'
import CustomerForm from '@/components/customers/CustomerForm.vue'
import CustomerDetail from '@/components/customers/CustomerDetail.vue'
import { useCustomers } from '@/composables/useCustomers'
import { useAuthStore } from '@/stores/authStore'
import type { Database } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']

const { customers, loading, error, createCustomer, updateCustomer, deleteCustomer, filterCustomers } = useCustomers()

const authStore = useAuthStore()
const storesOptions = computed(() => (authStore.accessibleStores || []).map((s: any) => ({ id: s.id, name: s.name })))
const showStoreSelect = computed(() => authStore.isOwner && storesOptions.value.length > 1)

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showModal = ref(false)
const showDetailModal = ref(false)
const showDeleteDialog = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedCustomer = ref<Customer | null>(null)
const saving = ref(false)
const formError = ref('')
const defaultFormData: Partial<CustomerInsert> = { first_name: '', last_name: '', email: '', phone: '', gender: '', birth_date: '' }
const formData = ref<Partial<CustomerInsert>>({ ...defaultFormData })

const columns = [
  { key: 'name', label: 'Nama', width: '200px' },
  { key: 'email', label: 'Email', width: '180px' },
  { key: 'phone', label: 'Telepon', width: '140px' },
  { key: 'gender', label: 'Jenis Kelamin', width: '120px' },
  { key: 'birth_date', label: 'Tanggal Lahir', width: '140px' }
]

const filterColumns = [
  { key: 'gender', label: 'Jenis Kelamin', filterType: 'select' as const, filterOptions: [{ value: 'male', label: 'Laki-laki' }, { value: 'female', label: 'Perempuan' }, { value: 'other', label: 'Lainnya' }] }
]

const filteredCustomers = computed(() => filterCustomers(searchQuery.value, filters.value))

function formatGender(gender: string | null): string {
  if (!gender) return '-'
  const map: Record<string, string> = { male: 'Laki-laki', female: 'Perempuan', other: 'Lainnya' }
  return map[gender] || gender
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { ...defaultFormData, store_id: storesOptions.value[0]?.id ?? '' }
  formError.value = ''
  showModal.value = true
}

function openEditModal(customer: Customer) {
  modalMode.value = 'edit'
  formData.value = { first_name: customer.first_name, last_name: customer.last_name, email: customer.email, phone: customer.phone, gender: customer.gender, birth_date: customer.birth_date, store_id: customer.store_id }
  selectedCustomer.value = customer
  formError.value = ''
  showModal.value = true
}

function viewDetail(customer: Customer) {
  selectedCustomer.value = customer
  showDetailModal.value = true
}

function confirmDelete(customer: Customer) {
  selectedCustomer.value = customer
  showDeleteDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''
  try {
    if (modalMode.value === 'create') await createCustomer(formData.value)
    else if (selectedCustomer.value) await updateCustomer(selectedCustomer.value.id, formData.value)
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Gagal menyimpan data'
  } finally {
    saving.value = false
  }
}

async function deleteCustomerConfirmed() {
  if (!selectedCustomer.value) return
  try {
    await deleteCustomer(selectedCustomer.value.id)
    showDeleteDialog.value = false
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus pelanggan'
  }
}

function closeModal() {
  showModal.value = false
  selectedCustomer.value = null
  formData.value = { ...defaultFormData }
}
</script>

<style scoped>
.table-container { display: flex; flex-direction: column; height: 100%; }
.filter-section { padding: 6px 12px; flex-shrink: 0; }
</style>
