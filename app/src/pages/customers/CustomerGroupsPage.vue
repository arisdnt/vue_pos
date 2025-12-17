<template>
  <WinPage>
    <WinPageHeader title="Grup Pelanggan">
      <template #actions>
        <WinButton variant="primary" @click="openCreateModal">+ Tambah Grup</WinButton>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <WinCard no-padding>
        <div class="table-container">
          <div class="filter-section">
            <WinTableFilter v-model:searchQuery="searchQuery" searchPlaceholder="Cari grup pelanggan..." />
            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">{{ error }}</WinAlert>
          </div>

          <WinTable :columns="columns" :data="filteredGroups" :loading="loading" :max-height="'100%'" empty-text="Tidak ada grup pelanggan" actions>
            <template #cell(description)="{ row }">{{ row.description || '-' }}</template>
            <template #actions="{ row }">
              <WinIconButton :icon="Pencil" size="sm" tooltip="Edit" @click="openEditModal(row)" />
              <WinIconButton :icon="Trash2" size="sm" variant="danger" tooltip="Hapus" @click="confirmDelete(row)" />
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal" :title="modalMode === 'create' ? 'Tambah Grup' : 'Edit Grup'" size="sm">
      <WinAlert v-if="formError" type="error" :closeable="true" @close="formError = ''">{{ formError }}</WinAlert>
      <form @submit.prevent="handleSubmit">
        <WinField label="Nama Grup" required><WinInput v-model="formData.name" placeholder="Nama grup" required /></WinField>
        <WinField label="Deskripsi"><WinTextarea v-model="formData.description" placeholder="Deskripsi (opsional)" rows="2" /></WinField>
        <div class="form-actions">
          <WinButton type="button" variant="default" @click="closeModal">Batal</WinButton>
          <WinButton type="submit" variant="primary" :loading="saving">Simpan</WinButton>
        </div>
      </form>
    </WinModal>

    <WinDialog v-model="showDeleteDialog" title="Konfirmasi Hapus" message="Apakah Anda yakin ingin menghapus grup pelanggan ini?" confirm-text="Hapus" cancel-text="Batal" @confirm="deleteGroupConfirmed" />
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter, WinButton, WinIconButton, WinAlert, WinModal, WinDialog, WinField, WinInput, WinTextarea } from '@/components/base'
import { useCustomerGroups } from '@/composables/useCustomerGroups'

const { customerGroups, loading, error, createCustomerGroup, updateCustomerGroup, deleteCustomerGroup, filterCustomerGroups } = useCustomerGroups()

const searchQuery = ref('')
const showModal = ref(false)
const showDeleteDialog = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedGroup = ref<any | null>(null)
const saving = ref(false)
const formError = ref('')
const defaultFormData = { name: '', description: '' }
const formData = ref({ ...defaultFormData })

const columns = [
  { key: 'name', label: 'Nama Grup', width: '200px' },
  { key: 'description', label: 'Deskripsi', width: '300px' }
]

const filteredGroups = computed(() => filterCustomerGroups(searchQuery.value))

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { ...defaultFormData }
  formError.value = ''
  showModal.value = true
}

function openEditModal(group: any) {
  modalMode.value = 'edit'
  formData.value = { name: group.name, description: group.description }
  selectedGroup.value = group
  formError.value = ''
  showModal.value = true
}

function confirmDelete(group: any) {
  selectedGroup.value = group
  showDeleteDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''
  try {
    if (modalMode.value === 'create') await createCustomerGroup(formData.value)
    else if (selectedGroup.value) await updateCustomerGroup(selectedGroup.value.id, formData.value)
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Gagal menyimpan data'
  } finally {
    saving.value = false
  }
}

async function deleteGroupConfirmed() {
  if (!selectedGroup.value) return
  try {
    await deleteCustomerGroup(selectedGroup.value.id)
    showDeleteDialog.value = false
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus grup'
  }
}

function closeModal() {
  showModal.value = false
  selectedGroup.value = null
  formData.value = { ...defaultFormData }
}
</script>

<style scoped>
.table-container { display: flex; flex-direction: column; height: 100%; }
.filter-section { padding: 6px 12px; flex-shrink: 0; }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--win-border); }
</style>
