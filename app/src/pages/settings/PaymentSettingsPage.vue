<template>
  <WinPage>
    <WinPageHeader title="Metode Pembayaran">
      <template #actions>
        <WinButton variant="primary" @click="openCreateModal">
          + Tambah Metode
        </WinButton>
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
              searchPlaceholder="Cari metode pembayaran..."
              @filter-change="applyFilters"
            />

            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">
              {{ error }}
            </WinAlert>
          </div>

          <WinTable
            :columns="columns"
            :data="filteredPaymentTypes"
            :loading="loading"
            :max-height="'100%'"
            empty-text="Tidak ada metode pembayaran"
            actions
          >
            <template #cell(priority)="{ row }">
              <span class="priority-badge">{{ row.priority }}</span>
            </template>

            <template #cell(active)="{ row }">
              <WinBadge :variant="row.active ? 'success' : 'error'">
                {{ row.active ? 'Aktif' : 'Nonaktif' }}
              </WinBadge>
            </template>

            <template #cell(readonly)="{ row }">
              <WinBadge v-if="row.readonly" variant="warning">
                Sistem
              </WinBadge>
              <span v-else>-</span>
            </template>

            <template #cell(description)="{ row }">
              <span class="description-text">{{ row.description || '-' }}</span>
            </template>

            <template #actions="{ row }">
              <WinIconButton :icon="Pencil" size="sm" tooltip="Edit" @click="openEditModal(row)" />
              <WinIconButton 
                v-if="!row.readonly" 
                :icon="Trash2" 
                size="sm" 
                variant="danger" 
                tooltip="Hapus" 
                @click="confirmDelete(row)" 
              />
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal" :title="modalMode === 'create' ? 'Tambah Metode Pembayaran' : 'Edit Metode Pembayaran'" size="md">
      <WinAlert v-if="formError" type="error" :closeable="true" @close="formError = ''">
        {{ formError }}
      </WinAlert>
      <PaymentTypeForm v-model="formData" :saving="saving" @submit="handleSubmit" @cancel="closeModal" />
    </WinModal>

    <WinDialog
      v-model="showDeleteDialog"
      title="Konfirmasi Hapus"
      message="Apakah Anda yakin ingin menghapus metode pembayaran ini?"
      confirm-text="Hapus"
      cancel-text="Batal"
      @confirm="deletePaymentTypeConfirmed"
    />
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { 
  WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter,
  WinButton, WinIconButton, WinBadge, WinAlert, WinModal, WinDialog
} from '@/components/base'
import PaymentTypeForm from '@/components/payments/PaymentTypeForm.vue'
import { usePaymentTypes } from '@/composables/usePaymentTypes'
import type { Database } from '@/types/database'

type PaymentType = Database['public']['Tables']['payment_types']['Row']
type PaymentTypeInsert = Database['public']['Tables']['payment_types']['Insert']

const { 
  paymentTypes, 
  loading, 
  error, 
  fetchPaymentTypes, 
  createPaymentType, 
  updatePaymentType, 
  deletePaymentType,
  filterPaymentTypes 
} = usePaymentTypes()

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showModal = ref(false)
const showDeleteDialog = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedPaymentType = ref<PaymentType | null>(null)
const saving = ref(false)
const formError = ref('')

const defaultFormData: Partial<PaymentTypeInsert> = {
  label: '',
  identifier: '',
  description: '',
  priority: 0,
  active: true,
  icon: ''
}

const formData = ref<Partial<PaymentTypeInsert>>({ ...defaultFormData })

const columns = [
  { key: 'priority', label: '#', width: '50px' },
  { key: 'label', label: 'Label', width: '150px' },
  { key: 'identifier', label: 'Identifier', width: '120px' },
  { key: 'description', label: 'Deskripsi', width: '250px' },
  { key: 'active', label: 'Status', width: '90px' },
  { key: 'readonly', label: 'Tipe', width: '80px' }
]

const filterColumns = [
  { 
    key: 'active', 
    label: 'Status', 
    filterType: 'select' as const,
    filterOptions: [
      { value: 'true', label: 'Aktif' }, 
      { value: 'false', label: 'Nonaktif' }
    ]
  }
]

const filteredPaymentTypes = computed(() => filterPaymentTypes(searchQuery.value, filters.value))

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { ...defaultFormData }
  formError.value = ''
  showModal.value = true
}

function openEditModal(paymentType: PaymentType) {
  modalMode.value = 'edit'
  formData.value = {
    label: paymentType.label,
    identifier: paymentType.identifier,
    description: paymentType.description,
    priority: paymentType.priority,
    active: paymentType.active,
    icon: paymentType.icon,
    readonly: paymentType.readonly
  }
  selectedPaymentType.value = paymentType
  formError.value = ''
  showModal.value = true
}

function confirmDelete(paymentType: PaymentType) {
  selectedPaymentType.value = paymentType
  showDeleteDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''
  try {
    if (modalMode.value === 'create') {
      await createPaymentType(formData.value as PaymentTypeInsert)
    } else if (selectedPaymentType.value) {
      await updatePaymentType(selectedPaymentType.value.id, formData.value)
    }
    await fetchPaymentTypes()
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Gagal menyimpan data'
  } finally {
    saving.value = false
  }
}

async function deletePaymentTypeConfirmed() {
  if (!selectedPaymentType.value) return
  try {
    await deletePaymentType(selectedPaymentType.value.id)
    await fetchPaymentTypes()
    showDeleteDialog.value = false
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus metode pembayaran'
  }
}

function closeModal() {
  showModal.value = false
  selectedPaymentType.value = null
  formData.value = { ...defaultFormData }
}

function applyFilters() {
  // Filtering is reactive via computed
}

onMounted(() => fetchPaymentTypes())
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-section {
  padding: 6px 12px;
  flex-shrink: 0;
}

.priority-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: var(--win-bg);
  border: 1px solid var(--win-border);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  color: var(--win-text-secondary);
}

.description-text {
  color: var(--win-text-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 240px;
  display: block;
}
</style>
