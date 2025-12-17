<template>
  <div class="order-detail" v-if="order">
    <div class="detail-section">
      <div class="section-title">Informasi Transaksi</div>
      <div class="detail-grid">
        <div class="detail-row"><span class="label">Kode</span><span class="value">{{ order.code }}</span></div>
        <div class="detail-row"><span class="label">Tipe</span><span class="value"><WinBadge variant="default">{{ formatType(order.type) }}</WinBadge></span></div>
        <div class="detail-row"><span class="label">Pelanggan</span><span class="value">{{ order.customer_name || '-' }}</span></div>
        <div class="detail-row"><span class="label">Status Pembayaran</span><span class="value"><WinBadge :variant="paymentVariant">{{ formatPaymentStatus(order.payment_status) }}</WinBadge></span></div>
        <div class="detail-row"><span class="label">Status Proses</span><span class="value"><WinBadge :variant="processVariant">{{ formatProcessStatus(order.process_status) }}</WinBadge></span></div>
        <div class="detail-row"><span class="label">Total</span><span class="value total">{{ formatCurrency(order.total) }}</span></div>
        <div class="detail-row"><span class="label">Tanggal</span><span class="value">{{ formatDate(order.created_at) }}</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { WinBadge } from '@/components/base'
import type { OrderWithCustomer } from '@/composables/useOrders'

const props = defineProps<{ order: OrderWithCustomer | null }>()

const paymentVariant = computed(() => {
  if (!props.order) return 'default'
  const map: Record<string, any> = { paid: 'success', unpaid: 'error', partial: 'warning' }
  return map[props.order.payment_status] || 'default'
})

const processVariant = computed(() => {
  if (!props.order) return 'default'
  const map: Record<string, any> = { completed: 'success', pending: 'warning', cancelled: 'error' }
  return map[props.order.process_status || ''] || 'default'
})

function formatType(type: string): string {
  const map: Record<string, string> = { sale: 'Penjualan', refund: 'Refund', 'void': 'Void' }
  return map[type] || type
}

function formatPaymentStatus(status: string): string {
  const map: Record<string, string> = { paid: 'Lunas', unpaid: 'Belum Bayar', partial: 'Sebagian' }
  return map[status] || status
}

function formatProcessStatus(status: string | null): string {
  if (!status) return '-'
  const map: Record<string, string> = { completed: 'Selesai', pending: 'Pending', cancelled: 'Dibatalkan' }
  return map[status] || status
}

function formatCurrency(value: number | null): string {
  if (value === null) return 'Rp 0'
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}
</script>

<style scoped>
.order-detail { padding: 8px 0; }
.detail-section { display: flex; flex-direction: column; gap: 12px; }
.section-title { font-size: 13px; font-weight: 600; color: var(--win-text-secondary, #666); text-transform: uppercase; letter-spacing: 0.5px; padding-bottom: 8px; border-bottom: 1px solid var(--win-border, #ccc); }
.detail-grid { display: flex; flex-direction: column; gap: 10px; }
.detail-row { display: flex; gap: 16px; }
.label { flex: 0 0 140px; color: var(--win-text-secondary); font-size: 13px; }
.value { flex: 1; font-size: 13px; color: var(--win-text); }
.total { font-weight: 600; color: var(--win-accent); }
</style>
