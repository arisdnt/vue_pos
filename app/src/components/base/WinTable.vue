<template>
  <div class="win-table-container" :style="containerStyle">
    <table class="win-table">
      <thead>
        <tr>
          <th v-for="column in columns" :key="column.key" :style="{ width: column.width }">
            {{ column.label }}
          </th>
          <th v-if="actions" class="actions-column">Aksi</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td :colspan="columns.length + (actions ? 1 : 0)" class="loading-cell">
            <WinSpinner text="Memuat data..." />
          </td>
        </tr>
        <tr v-else-if="!data || data.length === 0">
          <td :colspan="columns.length + (actions ? 1 : 0)" class="empty-cell">
            {{ emptyText }}
          </td>
        </tr>
        <tr 
          v-else 
          v-for="(row, index) in data" 
          :key="getRowKey(row, index)"
          :class="{ clickable: clickable }"
          @click="handleRowClick(row)"
        >
          <td v-for="column in columns" :key="column.key">
            <slot :name="`cell(${column.key})`" :row="row" :column="column">
              {{ getCellValue(row, column.key) }}
            </slot>
          </td>
          <td v-if="actions" class="actions-cell">
            <slot name="actions" :row="row" :index="index"></slot>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WinSpinner from './WinSpinner.vue'

interface Column {
  key: string
  label: string
  width?: string
}

const props = withDefaults(defineProps<{
  columns: Column[]
  data?: any[]
  loading?: boolean
  emptyText?: string
  actions?: boolean
  clickable?: boolean
  rowKey?: string
  maxHeight?: string
}>(), {
  loading: false,
  emptyText: 'Tidak ada data',
  actions: false,
  clickable: false,
  rowKey: 'id',
  maxHeight: '100%'
})

const emit = defineEmits<{
  (e: 'row-click', row: any): void
}>()

const containerStyle = computed(() => ({
  maxHeight: props.maxHeight,
  height: props.maxHeight === '100%' ? '100%' : 'auto'
}))

function getCellValue(row: any, key: string) {
  return row[key]
}

function getRowKey(row: any, index: number) {
  return row[props.rowKey] || index
}

function handleRowClick(row: any) {
  if (props.clickable) {
    emit('row-click', row)
  }
}
</script>

<style scoped>
.win-table-container {
  overflow-y: auto;
  overflow-x: auto;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

.win-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background: white;
  border: 1px solid #e5e5e5;
  border-radius: 3px;
  overflow: hidden;
}

.win-table thead th {
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  color: #333;
  letter-spacing: -0.01em;
  background: linear-gradient(to bottom, #fafafa 0%, #f5f5f5 100%);
  border-bottom: 1px solid #e0e0e0;
  border-right: 1px solid #efefef;
  white-space: nowrap; /* Kept from original .win-table th */
}

.win-table thead th:last-child {
  border-right: none;
}

.win-table tbody td {
  padding: 12px 16px;
  font-size: 14px;
  color: #1a1a1a;
  border-bottom: 1px solid #f0f0f0;
  border-right: 1px solid #f8f8f8;
  background: white;
  transition: background-color 0.15s ease; /* Kept from original .win-table td */
}

.win-table td:last-child {
  border-right: none;
}

.win-table tbody tr {
  transition: all 0.15s ease;
}

.win-table tbody tr:hover {
  background: linear-gradient(to bottom, #fafafa 0%, #f8f8f8 100%);
  box-shadow: inset 0 1px 0 rgba(0, 0, 0, 0.02);
}

.win-table tbody tr:last-child td {
  border-bottom: none;
}

.win-table tbody tr.clickable {
  cursor: pointer;
}

.win-table tbody tr.clickable:hover {
  background: linear-gradient(to bottom, #f0f7ff 0%, #e8f4ff 100%);
  box-shadow: inset 0 0 0 1px rgba(0, 120, 212, 0.1);
}

.actions-column {
  width: 120px;
  text-align: center;
  background: linear-gradient(to bottom, #f8f8f8 0%, #f3f3f3 100%);
}

.actions-cell {
  text-align: center;
  display: flex;
  gap: 6px;
  justify-content: center;
  align-items: center;
  background: rgba(248, 248, 248, 0.3);
}

.win-table tbody tr:hover .actions-cell {
  background: rgba(255, 255, 255, 0.5);
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 48px;
  color: #707070;
  font-size: 14px;
  font-weight: 400;
  background: linear-gradient(to bottom, #fafafa 0%, #f8f8f8 100%);
}

.loading-cell {
  background: white;
}
</style>
