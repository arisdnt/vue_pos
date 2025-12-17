<template>
  <div class="win-table-container" :style="containerStyle">
    <table class="win-table">
      <thead>
        <tr>
          <th
            v-for="column in columns"
            :key="column.key"
            :style="{ width: column.width }"
            :class="[
              'win-table-header-cell',
              column.align ? `align-${column.align}` : 'align-left'
            ]"
          >
            {{ column.label }}
          </th>
          <th
            v-if="actions"
            class="win-table-header-cell actions-column align-center"
          >
            Aksi
          </th>
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
          :class="['win-table-row', { clickable: clickable }]"
          @click="handleRowClick(row)"
        >
          <td
            v-for="column in columns"
            :key="column.key"
            :class="[
              'win-table-cell',
              column.align ? `align-${column.align}` : 'align-left'
            ]"
          >
            <slot :name="`cell(${column.key})`" :row="row" :column="column">
              {{ getCellValue(row, column.key) }}
            </slot>
          </td>
          <td
            v-if="actions"
            class="win-table-cell actions-cell align-center"
          >
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
  align?: 'left' | 'center' | 'right'
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
  overflow: auto;
  border-radius: 3px;
  border: 1px solid var(--win-border);
  background-color: var(--win-panel);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
}

.win-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
  background-color: #ffffff;
  font-family: var(--font-family);
  font-size: var(--font-size-base);
}

.win-table thead {
  background-color: #f3f3f3;
}

.win-table-header-cell {
  position: sticky;
  top: 0;
  z-index: var(--z-sticky);
  padding: 8px 10px;
  font-weight: 600;
  font-size: var(--font-size-sm);
  color: var(--win-text);
  background: linear-gradient(to bottom, #f6f6f6 0%, #eaeaea 100%);
  border: 1px solid #d9d9d9;
  white-space: nowrap;
  box-shadow: 0 1px 0 rgba(255, 255, 255, 0.6),
    0 2px 0 rgba(0, 0, 0, 0.02);
}

.win-table-header-cell.align-left {
  text-align: left;
}

.win-table-header-cell.align-center {
  text-align: center;
}

.win-table-header-cell.align-right {
  text-align: right;
}

.win-table thead .win-table-header-cell:first-child {
  border-top-left-radius: 4px;
}

.win-table thead .win-table-header-cell:last-child {
  border-top-right-radius: 4px;
}

.win-table-row {
  transition: background-color 0.12s ease, box-shadow 0.12s ease;
}

.win-table-cell {
  padding: 6px 10px;
  font-size: var(--font-size-base);
  color: var(--win-text);
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.win-table-cell.align-left {
  text-align: left;
}

.win-table-cell.align-center {
  text-align: center;
}

.win-table-cell.align-right {
  text-align: right;
}

.win-table-row:nth-child(even) .win-table-cell {
  background-color: #fbfbfb;
}

.win-table-row:hover .win-table-cell {
  background-color: #f3f8ff;
}

.win-table-row.clickable .win-table-cell {
  cursor: pointer;
}

.win-table-row.clickable:hover .win-table-cell {
  background-color: #e8f1ff;
  border-color: #c1d9f3;
}

.win-table-row.clickable:active .win-table-cell {
  background-color: #ddebf7;
  border-color: #8eb2e5;
}

.actions-column {
  width: 120px;
}

.actions-cell {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
}

.loading-cell,
.empty-cell {
  text-align: center;
  padding: 40px 16px;
  color: var(--win-text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 400;
  background: linear-gradient(to bottom, #fafafa 0%, #f7f7f7 100%);
  border: none;
}

.loading-cell {
  background-color: var(--win-panel);
}

/* Subtle Windows-like scrollbars inside table container */
.win-table-container::-webkit-scrollbar {
  height: 8px;
  width: 8px;
}

.win-table-container::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

.win-table-container::-webkit-scrollbar-thumb {
  background-color: #c4c4c4;
  border-radius: 4px;
}

.win-table-container::-webkit-scrollbar-thumb:hover {
  background-color: #a8a8a8;
}
</style>
