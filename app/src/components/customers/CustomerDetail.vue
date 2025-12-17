<template>
  <div class="customer-detail" v-if="customer">
    <div class="detail-section">
      <div class="detail-row">
        <span class="detail-label">Nama Lengkap</span>
        <span class="detail-value">{{ customer.first_name }} {{ customer.last_name || '' }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Email</span>
        <span class="detail-value">{{ customer.email || '-' }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Telepon</span>
        <span class="detail-value">{{ customer.phone || '-' }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Jenis Kelamin</span>
        <span class="detail-value">{{ formatGender(customer.gender) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Tanggal Lahir</span>
        <span class="detail-value">{{ formatDate(customer.birth_date) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Dibuat pada</span>
        <span class="detail-value">{{ formatDateTime(customer.created_at) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Database } from '@/types/database'

type Customer = Database['public']['Tables']['customers']['Row']

defineProps<{ customer: Customer | null }>()

function formatGender(gender: string | null): string {
  if (!gender) return '-'
  const map: Record<string, string> = { male: 'Laki-laki', female: 'Perempuan', other: 'Lainnya' }
  return map[gender] || gender
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

function formatDateTime(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.customer-detail { padding: 8px 0; }
.detail-section { display: flex; flex-direction: column; gap: 12px; }
.detail-row { display: flex; gap: 16px; }
.detail-label { flex: 0 0 140px; color: var(--win-text-secondary); font-size: 13px; }
.detail-value { flex: 1; font-size: 13px; color: var(--win-text); }
</style>
