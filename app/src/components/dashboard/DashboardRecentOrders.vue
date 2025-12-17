<template>
  <div class="recent-orders">
    <div class="section-header">
      <div class="section-title">Transaksi Terbaru</div>
    </div>
    <div class="orders-list">
      <div v-for="order in data" :key="order.id" class="order-item">
        <div class="order-main">
          <div class="order-code">{{ order.code }}</div>
          <div class="order-customer">{{ order.customer_name || 'Walk-in' }}</div>
        </div>
        <div class="order-meta">
          <div class="order-total">{{ formatCurrency(order.total) }}</div>
          <WinBadge :variant="getStatusVariant(order.payment_status)" class="order-status">{{ formatStatus(order.payment_status) }}</WinBadge>
        </div>
        <div class="order-time">{{ formatTime(order.created_at) }}</div>
      </div>
      <div v-if="!data.length" class="empty-state">Belum ada transaksi</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { WinBadge } from '@/components/base'
import type { RecentOrder } from '@/services/dashboardService'

defineProps<{ data: RecentOrder[] }>()

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

function formatStatus(status: string): string {
  return { paid: 'Lunas', unpaid: 'Belum', partial: 'Sebagian' }[status] || status
}

function getStatusVariant(status: string): 'success' | 'error' | 'warning' | 'default' {
  return { paid: 'success', unpaid: 'error', partial: 'warning' }[status] as any || 'default'
}
</script>

<style scoped>
.recent-orders { display: flex; flex-direction: column; height: 100%; }
.section-header { padding: 12px 16px; border-bottom: 1px solid var(--win-border); }
.section-title { font-size: 13px; font-weight: 600; color: var(--win-text); text-transform: uppercase; letter-spacing: 0.5px; }
.orders-list { flex: 1; overflow-y: auto; }
.order-item { display: grid; grid-template-columns: 1fr auto 60px; gap: 12px; padding: 10px 16px; border-bottom: 1px solid var(--win-border); align-items: center; }
.order-item:last-child { border-bottom: none; }
.order-code { font-size: 13px; font-weight: 500; font-family: 'Consolas', monospace; }
.order-customer { font-size: 11px; color: var(--win-text-secondary); }
.order-meta { display: flex; flex-direction: column; align-items: flex-end; gap: 2px; }
.order-total { font-size: 13px; font-weight: 500; }
.order-status { font-size: 10px; }
.order-time { font-size: 11px; color: var(--win-text-secondary); text-align: right; }
.empty-state { padding: 24px; text-align: center; color: var(--win-text-secondary); font-size: 13px; }
</style>
