<template>
  <div class="product-detail" v-if="product">
    <div class="detail-section">
      <div class="detail-row">
        <span class="detail-label">Nama Produk</span>
        <span class="detail-value">{{ product.name }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">SKU</span>
        <span class="detail-value">{{ product.sku }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Barcode</span>
        <span class="detail-value">{{ product.barcode || '-' }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Kategori</span>
        <span class="detail-value">{{ product.category_name || '-' }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value">
          <WinBadge :variant="product.status === 'available' ? 'success' : 'error'">
            {{ product.status === 'available' ? 'Tersedia' : 'Tidak Tersedia' }}
          </WinBadge>
        </span>
      </div>

      <div class="detail-row" v-if="product.description">
        <span class="detail-label">Deskripsi</span>
        <span class="detail-value">{{ product.description }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Dibuat pada</span>
        <span class="detail-value">{{ formatDate(product.created_at) }}</span>
      </div>

      <div class="detail-row">
        <span class="detail-label">Diperbarui pada</span>
        <span class="detail-value">{{ formatDate(product.updated_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WinBadge } from '@/components/base'
import type { ProductWithCategory } from '@/composables/useProducts'

defineProps<{
  product: ProductWithCategory | null
}>()

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.product-detail {
  padding: 8px 0;
}

.detail-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  gap: 16px;
}

.detail-label {
  flex: 0 0 140px;
  color: var(--win-text-secondary);
  font-size: 13px;
}

.detail-value {
  flex: 1;
  font-size: 13px;
  color: var(--win-text);
}
</style>
