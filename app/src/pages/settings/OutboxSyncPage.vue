<template>
  <WinPage>
    <WinPageHeader title="Outbox Sync">
      <template #actions>
        <WinButton variant="default" @click="refreshData">
          ↻ Refresh
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
              searchPlaceholder="Cari table name, record ID..."
              @filter-change="applyFilters"
            />

            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">
              {{ error }}
            </WinAlert>
          </div>

          <WinTable
            :columns="columns"
            :data="filteredItems"
            :loading="loading"
            :max-height="'100%'"
            empty-text="Tidak ada data outbox sync"
          >
            <template #cell(status)="{ row }">
              <WinBadge :variant="getStatusVariant(row.status)">
                {{ row.status }}
              </WinBadge>
            </template>

            <template #cell(operation)="{ row }">
              <WinBadge :variant="getOperationVariant(row.operation)">
                {{ row.operation }}
              </WinBadge>
            </template>

            <template #cell(created_at)="{ row }">
              {{ formatDate(row.created_at) }}
            </template>

            <template #cell(payload)="{ row }">
              <span class="payload-preview" :title="JSON.stringify(row.payload, null, 2)">
                {{ getPayloadPreview(row.payload) }}
              </span>
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { 
  WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter,
  WinButton, WinBadge, WinAlert
} from '@/components/base'
import { db, type SyncOutbox } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'

const error = ref('')
const searchQuery = ref('')
const filters = ref<Record<string, any>>({})

// Live query dari Dexie menggunakan pattern yang sudah ada
const { data: outboxItems, loading } = useDexieLiveQuery<SyncOutbox[]>(
  async () => {
    return await db.sync_outbox.orderBy('created_at').reverse().toArray()
  },
  []
)

const columns = [
  { key: 'id', label: 'ID', width: '60px' },
  { key: 'table_name', label: 'Table', width: '140px' },
  { key: 'record_id', label: 'Record ID', width: '200px' },
  { key: 'operation', label: 'Operation', width: '90px' },
  { key: 'status', label: 'Status', width: '90px' },
  { key: 'retry_count', label: 'Retry', width: '60px' },
  { key: 'payload', label: 'Payload', width: '180px' },
  { key: 'created_at', label: 'Created At', width: '150px' }
]

const filterColumns = [
  { 
    key: 'status', 
    label: 'Status', 
    filterType: 'select' as const,
    filterOptions: [
      { value: 'pending', label: 'Pending' },
      { value: 'syncing', label: 'Syncing' },
      { value: 'synced', label: 'Synced' },
      { value: 'failed', label: 'Failed' }
    ]
  },
  { 
    key: 'operation', 
    label: 'Operation', 
    filterType: 'select' as const,
    filterOptions: [
      { value: 'insert', label: 'Insert' },
      { value: 'update', label: 'Update' },
      { value: 'delete', label: 'Delete' }
    ]
  }
]

const filteredItems = computed(() => {
  let items = outboxItems.value || []
  
  // Apply search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    items = items.filter((item: SyncOutbox) => 
      item.table_name.toLowerCase().includes(query) ||
      item.record_id.toLowerCase().includes(query)
    )
  }
  
  // Apply filters
  if (filters.value.status) {
    items = items.filter((item: SyncOutbox) => item.status === filters.value.status)
  }
  if (filters.value.operation) {
    items = items.filter((item: SyncOutbox) => item.operation === filters.value.operation)
  }
  
  return items
})

function getStatusVariant(status: string): 'success' | 'warning' | 'error' | 'default' {
  switch (status) {
    case 'synced': return 'success'
    case 'pending': return 'warning'
    case 'syncing': return 'default'
    case 'failed': return 'error'
    default: return 'default'
  }
}

function getOperationVariant(operation: string): 'success' | 'warning' | 'error' | 'default' {
  switch (operation) {
    case 'insert': return 'success'
    case 'update': return 'warning'
    case 'delete': return 'error'
    default: return 'default'
  }
}

function formatDate(timestamp: number): string {
  if (!timestamp) return '-'
  return new Date(timestamp).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit', 
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getPayloadPreview(payload: any): string {
  if (!payload) return '-'
  const str = JSON.stringify(payload)
  return str.length > 30 ? str.substring(0, 30) + '...' : str
}

function refreshData() {
  // Live query akan otomatis refresh saat data berubah
  // Ini hanya untuk memberikan feedback visual
  window.location.reload()
}

function applyFilters() {
  // Filtering is reactive via computed
}
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

.payload-preview {
  font-family: var(--win-font-mono, monospace);
  font-size: 11px;
  color: var(--win-text-secondary);
  cursor: help;
}
</style>
