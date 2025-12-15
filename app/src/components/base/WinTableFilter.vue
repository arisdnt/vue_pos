<template>
  <div class="win-table-filter">
    <div class="filter-row">
      <!-- Search Input - Consistent with filters -->
      <div class="filter-item">
        <WinInput
          v-model="localSearchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          @input="handleSearchInput"
        />
      </div>

      <!-- Column Filters -->
      <div v-for="column in filterableColumns" :key="column.key" class="filter-item">
        <WinSelect
          v-if="column.filterType === 'select'"
          v-model="localFilters[column.key]"
          @change="handleFilterChange"
        >
          <option value="">{{ column.label }}: Semua</option>
          <option v-for="opt in column.filterOptions" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </WinSelect>
        <WinInput
          v-else
          v-model="localFilters[column.key]"
          type="text"
          :placeholder="`${column.label}...`"
          @input="handleFilterChange"
        />
      </div>

      <!-- Clear All Filters -->
      <WinButton
        v-if="hasActiveFilters"
        variant="danger"
        size="md"
        @click="clearAllFilters"
        class="clear-filters-btn"
      >
        <component :is="XCircle" :size="16" style="margin-right: 6px;" />
        Clear
      </WinButton>

      <!-- Active Filter Count - Inline with buttons -->
      <div class="filter-summary" :class="{ visible: activeFilterCount > 0 }">
        <component :is="Filter" :size="14" />
        <span>{{ activeFilterCount || 0 }} aktif</span>
      </div>

      <!-- Slot for custom actions -->
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Filter, XCircle } from 'lucide-vue-next'
import WinButton from './WinButton.vue'
import WinInput from './WinInput.vue'
import WinSelect from './WinSelect.vue'

interface FilterColumn {
  key: string
  label: string
  filterType?: 'text' | 'select'
  filterOptions?: { value: string; label: string }[]
}

const props = withDefaults(defineProps<{
  searchQuery?: string
  filters?: Record<string, any>
  columns?: FilterColumn[]
  searchPlaceholder?: string
  debounceMs?: number
}>(), {
  searchQuery: '',
  filters: () => ({}),
  columns: () => [],
  searchPlaceholder: 'Cari...',
  debounceMs: 300
})

const emit = defineEmits<{
  (e: 'update:searchQuery', value: string): void
  (e: 'update:filters', value: Record<string, any>): void
  (e: 'filter-change'): void
}>()

const localSearchQuery = ref(props.searchQuery)
const localFilters = ref<Record<string, any>>({ ...props.filters })
let debounceTimeout: number | null = null

const filterableColumns = computed(() => {
  return props.columns.filter(col => col.filterType)
})

const hasActiveFilters = computed(() => {
  return localSearchQuery.value !== '' || Object.values(localFilters.value).some(v => v !== '' && v !== null)
})

const activeFilterCount = computed(() => {
  let count = 0
  if (localSearchQuery.value) count++
  count += Object.values(localFilters.value).filter(v => v !== '' && v !== null).length
  return count
})

watch(() => props.searchQuery, (newVal) => {
  localSearchQuery.value = newVal
})

watch(() => props.filters, (newVal) => {
  localFilters.value = { ...newVal }
}, { deep: true })

function handleSearchInput() {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  
  debounceTimeout = window.setTimeout(() => {
    emit('update:searchQuery', localSearchQuery.value)
    emit('filter-change')
  }, props.debounceMs)
}

function handleFilterChange() {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  
  debounceTimeout = window.setTimeout(() => {
    emit('update:filters', { ...localFilters.value })
    emit('filter-change')
  }, props.debounceMs)
}

function clearAllFilters() {
  localSearchQuery.value = ''
  Object.keys(localFilters.value).forEach(key => {
    localFilters.value[key] = ''
  })
  emit('update:searchQuery', '')
  emit('update:filters', { ...localFilters.value })
  emit('filter-change')
}
</script>

<style scoped>
.win-table-filter {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.filter-item {
  flex: 0 0 auto;
  min-width: 200px;
}

.filter-item:first-child {
  min-width: 280px;
}

.clear-filters-btn {
  animation: fade-in 0.2s ease;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.filter-summary {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: linear-gradient(to bottom, #e8f4ff 0%, #e0f0ff 100%);
  border: 1px solid #90caf9;
  border-radius: 2px;
  font-size: 12px;
  color: #0d47a1;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s ease, visibility 0.2s ease;
}

.filter-summary.visible {
  opacity: 1;
  visibility: visible;
}
</style>
