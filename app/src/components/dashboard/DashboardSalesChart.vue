<template>
  <div class="sales-chart">
    <div class="chart-header">
      <div class="chart-title">Penjualan 7 Hari Terakhir</div>
    </div>
    <div class="chart-body">
      <div v-for="day in data" :key="day.date" class="chart-bar-container">
        <div class="bar-wrapper">
          <div class="bar" :style="{ height: getBarHeight(day.total) }" :title="formatCurrency(day.total)"></div>
        </div>
        <div class="bar-value">{{ formatShort(day.total) }}</div>
        <div class="bar-label">{{ day.dayName }}</div>
      </div>
    </div>
    <div v-if="!data.length" class="empty-state">Tidak ada data penjualan</div>
  </div>
</template>

<script setup lang="ts">
import type { WeeklySale } from '@/services/dashboardService'

const props = defineProps<{ data: WeeklySale[]; maxValue: number }>()

function getBarHeight(value: number): string {
  if (props.maxValue === 0) return '4px'
  const percentage = (value / props.maxValue) * 100
  return `${Math.max(percentage, 2)}%`
}

function formatShort(value: number): string {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}jt`
  if (value >= 1000) return `${(value / 1000).toFixed(0)}rb`
  return `${value}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}
</script>

<style scoped>
.sales-chart { display: flex; flex-direction: column; height: 100%; }
.chart-header { padding: 12px 16px; border-bottom: 1px solid var(--win-border); }
.chart-title { font-size: 13px; font-weight: 600; color: var(--win-text); text-transform: uppercase; letter-spacing: 0.5px; }
.chart-body { flex: 1; display: flex; gap: 8px; padding: 16px; align-items: flex-end; min-height: 180px; }
.chart-bar-container { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
.bar-wrapper { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; min-height: 120px; }
.bar { width: 100%; max-width: 40px; background: var(--win-accent); transition: height 0.3s ease; }
.bar:hover { background: var(--win-accent-hover); }
.bar-value { font-size: 10px; color: var(--win-text-secondary); font-weight: 500; }
.bar-label { font-size: 11px; color: var(--win-text-secondary); font-weight: 600; }
.empty-state { padding: 40px; text-align: center; color: var(--win-text-secondary); font-size: 13px; }
</style>
