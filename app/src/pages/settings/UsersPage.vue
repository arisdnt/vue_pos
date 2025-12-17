<template>
  <WinPage>
    <WinPageHeader title="Pengguna">
      <template #actions>
        <WinButton variant="primary" @click="openCreateModal">
          + Tambah Pengguna
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
              searchPlaceholder="Cari email, role..."
              @filter-change="applyFilters"
            />

            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">
              {{ error }}
            </WinAlert>
          </div>

          <WinTable
            :columns="columns"
            :data="filteredUsers"
            :loading="loading"
            :max-height="'100%'"
            empty-text="Tidak ada data pengguna"
            actions
          >
            <template #cell(role)="{ row }">
              <WinBadge :variant="getRoleBadgeVariant(row.role)">
                {{ getRoleName(row.role) }}
              </WinBadge>
            </template>

            <template #cell(status)="{ row }">
              <WinBadge :variant="row.status === 'active' ? 'success' : 'error'">
                {{ row.status === 'active' ? 'Aktif' : 'Nonaktif' }}
              </WinBadge>
            </template>

            <template #cell(stores)="{ row }">
              <span v-if="row.role === 'owner'" class="all-stores">Semua Toko</span>
              <span v-else-if="row.assignedStoreNames?.length">
                {{ row.assignedStoreNames.join(', ') }} ({{ row.assignedStoreNames.length }})
              </span>
              <span v-else class="no-stores">-</span>
            </template>

            <template #cell(created_at)="{ row }">
              {{ formatDate(row.created_at) }}
            </template>

            <template #actions="{ row }">
              <WinIconButton :icon="Edit2" size="sm" tooltip="Edit" @click="openEditModal(row)" />
              <WinIconButton :icon="Trash2" size="sm" variant="danger" tooltip="Hapus" @click="confirmDelete(row)" />
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal" :title="modalMode === 'create' ? 'Tambah Pengguna' : 'Edit Pengguna'" size="md">
      <WinAlert v-if="formError" type="error" :closeable="true" @close="formError = ''">
        {{ formError }}
      </WinAlert>
      <UserForm 
        v-model="formData" 
        v-model:store-ids="storeIds"
        :mode="modalMode" 
        :user-id="selectedUser?.id"
        :saving="saving" 
        :errors="formErrors"
        @submit="handleSubmit" 
        @cancel="closeModal" 
      />
    </WinModal>

    <WinDialog
      v-model="showDeleteDialog"
      title="Konfirmasi Hapus"
      message="Apakah Anda yakin ingin menghapus pengguna ini?"
      confirm-text="Hapus"
      cancel-text="Batal"
      @confirm="deleteUserConfirmed"
    />
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Edit2, Trash2 } from 'lucide-vue-next'
import { 
  WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter,
  WinButton, WinIconButton, WinBadge, WinAlert, WinModal, WinDialog
} from '@/components/base'
import UserForm from '@/components/users/UserForm.vue'
import { useUsers } from '@/composables/useUsers'
import * as storeUserService from '@/services/storeUserService'

const { users, loading, error, fetchUsers, createUser, updateUser, deleteUser, filterUsers } = useUsers()

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showModal = ref(false)
const showDeleteDialog = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedUser = ref<any | null>(null)
const saving = ref(false)
const formError = ref('')
const formErrors = ref<Record<string, string>>({})
const storeIds = ref<string[]>([])

const formData = ref({ email: '', password: '', role: '', status: 'active' })

const columns = [
  { key: 'email', label: 'Email', width: '220px' },
  { key: 'role', label: 'Role', width: '100px' },
  { key: 'stores', label: 'Toko', width: '200px' },
  { key: 'status', label: 'Status', width: '90px' },
  { key: 'created_at', label: 'Dibuat', width: '150px' }
]

const filterColumns = [
  { key: 'role', label: 'Role', filterType: 'select' as const,
    filterOptions: [
      { value: 'owner', label: 'Owner' },
      { value: 'manager', label: 'Manager' },
      { value: 'cashier', label: 'Cashier' }
    ]
  },
  { key: 'status', label: 'Status', filterType: 'select' as const,
    filterOptions: [
      { value: 'active', label: 'Aktif' },
      { value: 'inactive', label: 'Nonaktif' }
    ]
  }
]

const filteredUsers = computed(() => filterUsers(searchQuery.value, filters.value))

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { email: '', password: '', role: '', status: 'active' }
  storeIds.value = []
  formError.value = ''
  formErrors.value = {}
  showModal.value = true
}

async function openEditModal(user: any) {
  modalMode.value = 'edit'
  formData.value = { email: user.email, role: user.role, status: user.status, password: '' }
  selectedUser.value = user
  
  // Load user's assigned stores
  if (user.role === 'manager' || user.role === 'cashier') {
    try {
      const assignedStores = await storeUserService.getUserStores(user.id)
      storeIds.value = assignedStores.map(s => s.id)
    } catch (e) {
      console.error('Error loading user stores:', e)
      storeIds.value = []
    }
  } else {
    storeIds.value = []
  }
  
  formError.value = ''
  formErrors.value = {}
  showModal.value = true
}

function confirmDelete(user: any) {
  selectedUser.value = user
  showDeleteDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''
  formErrors.value = {}
  try {
    if (modalMode.value === 'create') {
      await createUser(formData.value.email, formData.value.password!, formData.value.role)
      // Get the newly created user to assign stores
      await fetchUsers()
      const newUser = users.value.find(u => u.email === formData.value.email)
      if (newUser && storeIds.value.length > 0) {
        // Enforce single store assignment at UI level to match DB constraint
        const singleStoreIds = storeIds.value.slice(0, 1)
        await storeUserService.updateUserStoreAssignments(newUser.id, singleStoreIds)
      }
    } else if (selectedUser.value) {
      await updateUser(selectedUser.value.id, { role: formData.value.role, status: formData.value.status })
      // Update store assignments
      if (formData.value.role === 'manager' || formData.value.role === 'cashier') {
        const singleStoreIds = storeIds.value.slice(0, 1)
        await storeUserService.updateUserStoreAssignments(selectedUser.value.id, singleStoreIds)
      }
    }
    await loadUsersWithStores()
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Gagal menyimpan data'
  } finally {
    saving.value = false
  }
}

async function deleteUserConfirmed() {
  if (!selectedUser.value) return
  try {
    await deleteUser(selectedUser.value.id)
    await loadUsersWithStores()
    showDeleteDialog.value = false
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus pengguna'
  }
}

function closeModal() {
  showModal.value = false
  selectedUser.value = null
  storeIds.value = []
}

function applyFilters() {
  // Reactive via computed
}

function getRoleName(role: string): string {
  const roles: Record<string, string> = { owner: 'Owner', manager: 'Manager', cashier: 'Cashier' }
  return roles[role] || role
}

function getRoleBadgeVariant(role: string): 'primary' | 'success' | 'default' {
  const variants: Record<string, 'primary' | 'success' | 'default'> = {
    owner: 'primary', manager: 'success', cashier: 'default'
  }
  return variants[role] || 'default'
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric', month: 'short', day: 'numeric'
  })
}

async function loadUsersWithStores() {
  await fetchUsers()
  // Load store assignments for each user from Dexie
  for (const user of users.value) {
    if (user.role !== 'owner') {
      try {
        const stores = await storeUserService.getUserStores(user.id)
        ;(user as any).assignedStoreNames = stores.map(s => s.name)
      } catch {
        ;(user as any).assignedStoreNames = []
      }
    }
  }
}

onMounted(() => loadUsersWithStores())
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

.all-stores {
  color: var(--win-accent);
  font-weight: 500;
}

.no-stores {
  color: var(--win-text-disabled);
}
</style>
