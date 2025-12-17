<template>
  <WinPage>
    <WinPageHeader title="Satuan Produk">
      <template #actions>
        <WinButton variant="default" @click="openGroupModal">+ Tambah Grup</WinButton>
        <WinButton variant="primary" @click="openCreateModal">+ Tambah Satuan</WinButton>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <WinCard no-padding>
        <div class="table-container">
          <div class="filter-section">
            <WinTableFilter v-model:searchQuery="searchQuery" v-model:filters="filters" :columns="filterColumns" searchPlaceholder="Cari satuan..." />
            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">{{ error }}</WinAlert>
          </div>

          <WinTable :columns="columns" :data="filteredUnits" :loading="loading" :max-height="'100%'" empty-text="Tidak ada satuan produk" actions>
            <template #cell(group_name)="{ row }">
              <WinBadge v-if="row.group_name" variant="default">{{ row.group_name }}</WinBadge>
              <span v-else class="no-group">-</span>
            </template>
            <template #cell(value)="{ row }"><span class="value-badge">{{ formatValue(row.value) }}</span></template>
            <template #cell(base_unit)="{ row }">
              <WinBadge v-if="row.base_unit" variant="success">Dasar</WinBadge>
              <span v-else>-</span>
            </template>
            <template #actions="{ row }">
              <WinIconButton :icon="Pencil" size="sm" tooltip="Edit" @click="openEditModal(row)" />
              <WinIconButton v-if="!row.base_unit" :icon="Trash2" size="sm" variant="danger" tooltip="Hapus" @click="confirmDelete(row)" />
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal" :title="modalMode === 'create' ? 'Tambah Satuan' : 'Edit Satuan'" size="md">
      <WinAlert v-if="formError" type="error" :closeable="true" @close="formError = ''">{{ formError }}</WinAlert>
      <UnitForm v-model="formData" :unit-groups="unitGroups" :saving="saving" @submit="handleSubmit" @cancel="closeModal" />
    </WinModal>

    <WinModal v-model="showGroupModal" title="Tambah Grup Satuan" size="sm">
      <WinAlert v-if="groupFormError" type="error" :closeable="true" @close="groupFormError = ''">{{ groupFormError }}</WinAlert>
      <form @submit.prevent="handleGroupSubmit">
        <WinField label="Nama Grup" required><WinInput v-model="groupFormData.name" placeholder="Contoh: Weight, Volume, Pieces" /></WinField>
        <WinField label="Deskripsi"><WinTextarea v-model="groupFormData.description" placeholder="Deskripsi grup (opsional)" rows="2" /></WinField>
        <div class="form-actions">
          <WinButton type="button" variant="default" @click="showGroupModal = false">Batal</WinButton>
          <WinButton type="submit" variant="primary" :loading="groupSaving">Simpan</WinButton>
        </div>
      </form>
    </WinModal>

    <WinDialog v-model="showDeleteDialog" title="Konfirmasi Hapus" message="Apakah Anda yakin ingin menghapus satuan ini?" confirm-text="Hapus" cancel-text="Batal" @confirm="deleteUnitConfirmed" />
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Pencil, Trash2 } from 'lucide-vue-next'
import { WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter, WinButton, WinIconButton, WinBadge, WinAlert, WinModal, WinDialog, WinField, WinInput, WinTextarea } from '@/components/base'
import UnitForm from '@/components/products/UnitForm.vue'
import { useUnits } from '@/composables/useUnits'
import type { Database } from '@/types/database'

type Unit = Database['public']['Tables']['units']['Row'] & { group_name?: string }
type UnitInsert = Database['public']['Tables']['units']['Insert']

const { units, unitGroups, loading, error, fetchUnits, fetchUnitGroups, createUnit, updateUnit, deleteUnit, createUnitGroup, filterUnits } = useUnits()

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showModal = ref(false)
const showGroupModal = ref(false)
const showDeleteDialog = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const selectedUnit = ref<Unit | null>(null)
const saving = ref(false)
const groupSaving = ref(false)
const formError = ref('')
const groupFormError = ref('')
const defaultFormData: Partial<UnitInsert> = { name: '', identifier: '', description: '', group_id: null, value: 1, base_unit: false }
const formData = ref<Partial<UnitInsert>>({ ...defaultFormData })
const groupFormData = ref({ name: '', description: '' })

const columns = [
  { key: 'name', label: 'Nama', width: '120px' },
  { key: 'identifier', label: 'Identifier', width: '100px' },
  { key: 'group_name', label: 'Grup', width: '120px' },
  { key: 'value', label: 'Nilai', width: '100px' },
  { key: 'base_unit', label: 'Tipe', width: '80px' },
  { key: 'description', label: 'Deskripsi', width: '200px' }
]

const filterColumns = computed(() => [
  { key: 'group_id', label: 'Grup', filterType: 'select' as const, filterOptions: unitGroups.value.map(g => ({ value: String(g.id), label: g.name })) },
  { key: 'base_unit', label: 'Tipe', filterType: 'select' as const, filterOptions: [{ value: 'true', label: 'Satuan Dasar' }, { value: 'false', label: 'Satuan Turunan' }] }
])

const filteredUnits = computed(() => filterUnits(searchQuery.value, filters.value))

function formatValue(value: number | string | null): string {
  if (value === null) return '1'
  const num = Number(value)
  if (num === Math.floor(num)) return String(Math.floor(num))
  return num.toLocaleString('id-ID', { maximumFractionDigits: 5 })
}

function openCreateModal() {
  modalMode.value = 'create'
  formData.value = { ...defaultFormData }
  formError.value = ''
  showModal.value = true
}

function openEditModal(unit: Unit) {
  modalMode.value = 'edit'
  formData.value = { name: unit.name, identifier: unit.identifier, description: unit.description, group_id: unit.group_id, value: Number(unit.value), base_unit: unit.base_unit }
  selectedUnit.value = unit
  formError.value = ''
  showModal.value = true
}

function openGroupModal() {
  groupFormData.value = { name: '', description: '' }
  groupFormError.value = ''
  showGroupModal.value = true
}

function confirmDelete(unit: Unit) {
  selectedUnit.value = unit
  showDeleteDialog.value = true
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''
  try {
    if (modalMode.value === 'create') await createUnit(formData.value as UnitInsert)
    else if (selectedUnit.value) await updateUnit(selectedUnit.value.id, formData.value)
    await fetchUnits()
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Gagal menyimpan data'
  } finally {
    saving.value = false
  }
}

async function handleGroupSubmit() {
  groupSaving.value = true
  groupFormError.value = ''
  try {
    await createUnitGroup(groupFormData.value)
    await fetchUnitGroups()
    showGroupModal.value = false
  } catch (e: any) {
    groupFormError.value = e.message || 'Gagal menyimpan data'
  } finally {
    groupSaving.value = false
  }
}

async function deleteUnitConfirmed() {
  if (!selectedUnit.value) return
  try {
    await deleteUnit(selectedUnit.value.id)
    await fetchUnits()
    showDeleteDialog.value = false
  } catch (e: any) {
    error.value = e.message || 'Gagal menghapus satuan'
  }
}

function closeModal() {
  showModal.value = false
  selectedUnit.value = null
  formData.value = { ...defaultFormData }
}

onMounted(async () => {
  await fetchUnitGroups()
  await fetchUnits()
})
</script>

<style scoped>
.table-container { display: flex; flex-direction: column; height: 100%; }
.filter-section { padding: 6px 12px; flex-shrink: 0; }
.no-group { color: var(--win-text-disabled); }
.value-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 40px; height: 22px; padding: 0 8px; background-color: var(--win-bg); border: 1px solid var(--win-border); border-radius: 4px; font-size: 12px; font-weight: 500; font-family: 'Consolas', 'Courier New', monospace; color: var(--win-text); }
.form-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px; padding-top: 12px; border-top: 1px solid var(--win-border); }
</style>
