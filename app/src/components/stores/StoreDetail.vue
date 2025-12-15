<template>
  <div v-if="store" class="detail-view">
    <div class="detail-item">
      <span class="detail-label">Nama Toko:</span>
      <span class="detail-value">{{ store.name }}</span>
    </div>

    <div class="detail-item">
      <span class="detail-label">Deskripsi:</span>
      <span class="detail-value">{{ store.description || '-' }}</span>
    </div>

    <div class="detail-item">
      <span class="detail-label">Alamat:</span>
      <span class="detail-value">{{ store.address_line1 || '-' }}</span>
    </div>

    <div class="detail-item">
      <span class="detail-label">Kota:</span>
      <span class="detail-value">{{ store.city || '-' }}</span>
    </div>

    <div class="detail-item">
      <span class="detail-label">Provinsi:</span>
      <span class="detail-value">{{ store.province || '-' }}</span>
    </div>

    <div class="detail-item">
      <span class="detail-label">Telepon:</span>
      <span class="detail-value">{{ store.phone || '-' }}</span>
    </div>

    <div class="detail-item">
      <span class="detail-label">Email:</span>
      <span class="detail-value">{{ store.email || '-' }}</span>
    </div>

    <div class="detail-item">
      <span class="detail-label">Status:</span>
      <WinBadge :variant="store.active ? 'success' : 'error'">
        {{ store.active ? 'Aktif' : 'Nonaktif' }}
      </WinBadge>
    </div>

    <div class="detail-item">
      <span class="detail-label">Dibuat:</span>
      <span class="detail-value">{{ formatDate(store.created_at) }}</span>
    </div>

    <div class="detail-item">
      <span class="detail-label">Diupdate:</span>
      <span class="detail-value">{{ formatDate(store.updated_at) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WinBadge } from '@/components/base'
import type { Database } from '@/types/database'

type Store = Database['public']['Tables']['stores']['Row']

defineProps<{
  store: Store | null
}>()

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.detail-view {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-item {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  font-size: 14px;
  color: #666;
}

.detail-value {
  font-size: 14px;
  color: #333;
}
</style>
