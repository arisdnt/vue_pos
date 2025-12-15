<template>
  <div class="win-pagination">
    <button 
      class="page-btn" 
      :disabled="currentPage === 1"
      @click="goToPage(1)"
    >
      ««
    </button>
    <button 
      class="page-btn" 
      :disabled="currentPage === 1"
      @click="goToPage(currentPage - 1)"
    >
      ‹
    </button>

    <span class="page-info">
      Halaman {{ currentPage }} dari {{ totalPages }}
    </span>

    <button 
      class="page-btn" 
      :disabled="currentPage === totalPages"
      @click="goToPage(currentPage + 1)"
    >
      ›
    </button>
    <button 
      class="page-btn" 
      :disabled="currentPage === totalPages"
      @click="goToPage(totalPages)"
    >
      »»
    </button>

    <select 
      v-if="showPageSize" 
      class="page-size-select"
      :value="pageSize"
      @change="handlePageSizeChange"
    >
      <option v-for="size in pageSizeOptions" :key="size" :value="size">
        {{ size }} / halaman
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  currentPage: number
  pageSize: number
  total: number
  showPageSize?: boolean
  pageSizeOptions?: number[]
}>(), {
  showPageSize: true,
  pageSizeOptions: () => [10, 20, 50, 100]
})

const emit = defineEmits<{
  (e: 'update:currentPage', value: number): void
  (e: 'update:pageSize', value: number): void
}>()

const totalPages = computed(() => Math.ceil(props.total / props.pageSize))

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    emit('update:currentPage', page)
  }
}

function handlePageSizeChange(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:pageSize', Number(target.value))
  emit('update:currentPage', 1)
}
</script>

<style scoped>
.win-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
}

.page-btn {
  padding: 4px 12px;
  border: 1px solid var(--win-border);
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background: #f0f0f0;
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--win-text-secondary);
  margin: 0 8px;
}

.page-size-select {
  padding: 4px 8px;
  border: 1px solid var(--win-border);
  font-size: 13px;
  margin-left: auto;
}
</style>
