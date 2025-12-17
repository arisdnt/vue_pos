<template>
  <div class="top-products">
    <div class="section-header">
      <div class="section-title">Produk Terlaris</div>
    </div>
    <div class="product-list">
      <div v-for="(product, index) in data" :key="product.id" class="product-item">
        <div class="rank">{{ index + 1 }}</div>
        <div class="product-info">
          <div class="product-name">{{ product.name }}</div>
          <div class="product-stats">{{ product.sold }} terjual • {{ formatCurrency(product.revenue) }}</div>
        </div>
        <div class="product-bar">
          <div class="bar-fill" :style="{ width: getBarWidth(product.revenue) }"></div>
        </div>
      </div>
      <div v-if="!data.length" class="empty-state">Belum ada data produk</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { TopProduct } from '@/services/dashboardService'

const props = defineProps<{ data: TopProduct[] }>()

const maxRevenue = () => Math.max(...props.data.map(p => p.revenue), 1)

function getBarWidth(revenue: number): string {
  return `${(revenue / maxRevenue()) * 100}%`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}
</script>

<style scoped>
.top-products { display: flex; flex-direction: column; height: 100%; }
.section-header { padding: 12px 16px; border-bottom: 1px solid var(--win-border); }
.section-title { font-size: 13px; font-weight: 600; color: var(--win-text); text-transform: uppercase; letter-spacing: 0.5px; }
.product-list { flex: 1; overflow-y: auto; }
.product-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--win-border); }
.product-item:last-child { border-bottom: none; }
.rank { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: var(--win-panel, #f5f5f5); font-size: 12px; font-weight: 600; color: var(--win-text-secondary); }
.product-info { flex: 1; min-width: 0; }
.product-name { font-size: 13px; font-weight: 500; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.product-stats { font-size: 11px; color: var(--win-text-secondary); }
.product-bar { width: 80px; height: 6px; background: var(--win-panel, #f5f5f5); }
.bar-fill { height: 100%; background: var(--win-accent); transition: width 0.3s; }
.empty-state { padding: 24px; text-align: center; color: var(--win-text-secondary); font-size: 13px; }
</style>
