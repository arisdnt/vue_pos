<template>
  <WinPage>
    <WinPageHeader title="Transaksi Hari Ini">
      <template #actions>
        <WinBadge variant="primary">{{ todayOrders.length }} transaksi</WinBadge>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <WinCard no-padding>
        <div class="table-container">
          <div class="filter-section">
            <WinTableFilter v-model:searchQuery="searchQuery" v-model:filters="filters" :columns="filterColumns" searchPlaceholder="Cari kode, pelanggan..." />
            <div class="today-info">{{ formatTodayDate() }}</div>
          </div>

          <WinTable :columns="columns" :data="filteredOrders" :loading="loading" :max-height="'100%'" empty-text="Tidak ada transaksi hari ini" actions>
            <template #cell(customer_name)="{ row }">{{ row.customer_name || '-' }}</template>
            <template #cell(type)="{ row }"><WinBadge variant="default">{{ formatType(row.type) }}</WinBadge></template>
            <template #cell(payment_status)="{ row }">
              <WinBadge :variant="getPaymentVariant(row.payment_status)">{{ formatPaymentStatus(row.payment_status) }}</WinBadge>
            </template>
            <template #cell(total)="{ row }">{{ formatCurrency(row.total) }}</template>
            <template #cell(created_at)="{ row }">{{ formatTime(row.created_at) }}</template>
            <template #actions="{ row }">
              <WinIconButton :icon="Eye" size="sm" tooltip="Detail" @click="viewDetail(row)" />
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showDetailModal" title="Detail Transaksi" size="md">
      <OrderDetail :order="selectedOrder" />
      <template #footer>
        <WinButton variant="primary" @click="showDetailModal = false">Tutup</WinButton>
      </template>
    </WinModal>
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye } from 'lucide-vue-next'
import { WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter, WinIconButton, WinBadge, WinModal, WinButton } from '@/components/base'
import OrderDetail from '@/components/orders/OrderDetail.vue'
import { useOrders, type OrderWithCustomer } from '@/composables/useOrders'

const { orders, loading, filterOrders, formatCurrency } = useOrders()

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showDetailModal = ref(false)
const selectedOrder = ref<OrderWithCustomer | null>(null)

const todayOrders = computed(() => {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return orders.value.filter(o => { const d = new Date(o.created_at); d.setHours(0, 0, 0, 0); return d.getTime() === today.getTime() })
})

const filteredOrders = computed(() => {
  let result = todayOrders.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(o => o.code.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q))
  }
  if (filters.value.payment_status) result = result.filter(o => o.payment_status === filters.value.payment_status)
  if (filters.value.type) result = result.filter(o => o.type === filters.value.type)
  return result
})

const columns = [
  { key: 'code', label: 'Kode', width: '130px' },
  { key: 'customer_name', label: 'Pelanggan', width: '180px' },
  { key: 'type', label: 'Tipe', width: '100px' },
  { key: 'payment_status', label: 'Pembayaran', width: '110px' },
  { key: 'total', label: 'Total', width: '140px' },
  { key: 'created_at', label: 'Waktu', width: '100px' }
]

const filterColumns = [
  { key: 'payment_status', label: 'Pembayaran', filterType: 'select' as const, filterOptions: [{ value: 'paid', label: 'Lunas' }, { value: 'unpaid', label: 'Belum Bayar' }, { value: 'partial', label: 'Sebagian' }] },
  { key: 'type', label: 'Tipe', filterType: 'select' as const, filterOptions: [{ value: 'sale', label: 'Penjualan' }, { value: 'refund', label: 'Refund' }] }
]

function formatTodayDate() { return new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }
function formatTime(dateStr: string) { return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
function formatType(type: string) { return { sale: 'Penjualan', refund: 'Refund', void: 'Void' }[type] || type }
function formatPaymentStatus(status: string) { return { paid: 'Lunas', unpaid: 'Belum Bayar', partial: 'Sebagian' }[status] || status }
function getPaymentVariant(status: string): 'success' | 'error' | 'warning' | 'default' { return { paid: 'success', unpaid: 'error', partial: 'warning' }[status] as any || 'default' }

function viewDetail(order: OrderWithCustomer) {
  selectedOrder.value = order
  showDetailModal.value = true
}
</script>

<style scoped>
.table-container { display: flex; flex-direction: column; height: 100%; }
.filter-section { display: flex; align-items: center; justify-content: space-between; padding: 6px 12px; flex-shrink: 0; border-bottom: 1px solid var(--win-border); }
.today-info { font-size: 13px; color: var(--win-text-secondary); font-weight: 500; }
</style>
