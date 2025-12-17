<template>
  <WinPage>
    <WinPageHeader title="Toko">
      <template #actions>
        <WinButton variant="primary" @click="openCreateModal">
          + Tambah Toko
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
              searchPlaceholder="Cari nama toko, kota..."
              @filter-change="applyFilters"
            />

            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">
              {{ error }}
            </WinAlert>
          </div>

          <WinTable
            :columns="columns"
            :data="filteredStores"
            :loading="loading"
            :max-height="'100%'"
            empty-text="Tidak ada data toko"
            actions
          >
            <template #cell(active)="{ row }">
              <WinBadge :variant="row.active ? 'success' : 'error'">
                {{ row.active ? 'Aktif' : 'Nonaktif' }}
              </WinBadge>
            </template>

            <template #cell(phone)="{ row }">
              {{ row.phone || '-' }}
            </template>

            <template #cell(city)="{ row }">
              {{ row.city || '-' }}
            </template>

            <template #cell(users)="{ row }">
              <span v-if="row.assignedUserNames?.length" class="user-list">
                {{ row.assignedUserNames.join(', ') }} ({{ row.assignedUserNames.length }})
              </span>
              <span v-else class="no-users">Belum ada user</span>
            </template>

            <template #actions="{ row }">
              <WinIconButton :icon="Eye" size="sm" tooltip="Detail" @click="viewDetail(row)" />
              <WinIconButton :icon="Pencil" size="sm" tooltip="Edit" @click="openEditModal(row)" />
              <WinIconButton :icon="Trash2" size="sm" variant="danger" tooltip="Hapus" @click="confirmDelete(row)" />
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal" :title="modalMode === 'create' ? 'Tambah Toko' : 'Edit Toko'" size="md">
      <WinAlert v-if="formError" type="error" :closeable="true" @close="formError = ''">
        {{ formError }}
      </WinAlert>
      <StoreForm v-model="formData" :saving="saving" @submit="handleSubmit" @cancel="closeModal" />
    </WinModal>

    <WinModal v-model="showDetailModal" title="Detail Toko" size="md">
      <StoreDetail :store="selectedStore" />
      <template #footer>
        <WinButton variant="primary" @click="showDetailModal = false">Tutup</WinButton>
      </template>
    </WinModal>

    <WinDialog
      v-model="showDeleteDialog"
      title="Konfirmasi Hapus"
      message="Apakah Anda yakin ingin menghapus toko ini?"
      confirm-text="Hapus"
      cancel-text="Batal"
      @confirm="deleteStoreConfirmed"
    />
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Eye, Pencil, Trash2 } from 'lucide-vue-next'
import { 
  WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter,
  WinButton, WinIconButton, WinBadge, WinAlert, WinModal, WinDialog
} from '@/components/base'
import StoreForm from '@/components/stores/StoreForm.vue'
import StoreDetail from '@/components/stores/StoreDetail.vue'
import { useStores } from '@/composables/useStores'
import * as storeUserService from '@/services/storeUserService'
import type { Database } from '@/types/database'

type Store = Database['public']['Tables']['stores']['Row']
type StoreInsert = Database['public']['Tables']['stores']['Insert']

const { stores, loading, error, fetchStores, createStore, updateStore, deleteStore, filterStores } = useStores()

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showModal = ref(false)
const showDetailModal = ref(false)
const showDeleteDialog = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedStore = ref<Store | null>(null)
const saving = ref(false)
const formError = ref('')

const defaultFormData: Partial<StoreInsert> = {
  name: '', description: '', address_line1: '', city: '', province: '',
  phone: '', email: '', active: true
}

const formData = ref<Partial<StoreInsert>>({ ...defaultFormData })

const columns = [
  { key: 'name', label: 'Nama Toko', width: '220px' },
  { key: 'city', label: 'Kota', width: '120px' },
  { key: 'users', label: 'Pengelola', width: '200px' },
  { key: 'active', label: 'Status', width: '90px' }
]

const filterColumns = [
  { key: 'active', label: 'Status', filterType: 'select' as const,
    filterOptions: [{ value: 'true', label: 'Aktif' }, { value: 'false', label: 'Nonaktif' }]
  }
]

const filteredStores = computed(() => filterStores(searchQuery.value, filters.value))

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { ...defaultFormData }
  formError.value = ''
  showModal.value = true
}

function openEditModal(store: Store) {
  modalMode.value = 'edit'
  formData.value = {
    name: store.name, description: store.description, address_line1: store.address_line1,
    city: store.city, province: store.province, phone: store.phone,
    email: store.email, active: store.active
  }
  selectedStore.value = store
  formError.value = ''
  showModal.value = true
}

function viewDetail(store: Store) {
  selectedStore.value = store
  showDetailModal.value = true
}

function confirmDelete(store: Store) {
  selectedStore.value = store
  showDeleteDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''
  try {
    if (modalMode.value === 'create') {
      await createStore(formData.value)
    } else if (selectedStore.value) {
      await updateStore(selectedStore.value.id, formData.value)
    }
    await loadStoresWithUsers()
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Gagal menyimpan data'
  } finally {
    saving.value = false
  }
}

async function deleteStoreConfirmed() {
  if (!selectedStore.value) return
  try {
    await deleteStore(selectedStore.value.id)
    await loadStoresWithUsers()
    showDeleteDialog.value = false
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus toko'
  }
}

function closeModal() {
  showModal.value = false
  selectedStore.value = null
  formData.value = { ...defaultFormData }
}

function applyFilters() {
  // Filtering is reactive via computed
}

async function loadStoresWithUsers() {
  // stores sudah di-handle oleh Dexie + liveQuery (useStores),
  // jadi di sini kita hanya meload user assignment dari Dexie.
  for (const store of stores.value) {
    try {
      const users = await storeUserService.getStoreUsers(store.id)
      ;(store as any).assignedUserNames = users.map(u => u.username)
    } catch (e) {
      ;(store as any).assignedUserNames = []
    }
  }
}

watch(
  () => stores.value,
  () => {
    // setiap kali daftar toko berubah (misalnya setelah bootstrap Dexie
    // atau setelah create/delete store), refresh daftar pengelola
    loadStoresWithUsers()
  },
  { immediate: true },
)
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

.user-list {
  color: var(--win-accent);
  font-size: 13px;
}

.no-users {
  color: var(--win-text-disabled);
  font-size: 13px;
}
</style>
