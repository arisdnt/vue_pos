<template>
  <WinPage>
    <WinPageHeader title="Transaksi" />

    <WinPageContent>
      <WinCard no-padding>
        <div class="table-container">
          <div class="filter-section">
            <WinTableFilter v-model:searchQuery="searchQuery" v-model:filters="filters" :columns="filterColumns" searchPlaceholder="Cari kode, pelanggan..." />
            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">{{ error }}</WinAlert>
          </div>

          <WinTable :columns="columns" :data="filteredOrders" :loading="loading" :max-height="'100%'" empty-text="Tidak ada data transaksi" actions>
            <template #cell(customer_name)="{ row }">{{ row.customer_name || '-' }}</template>
            <template #cell(type)="{ row }"><WinBadge variant="default">{{ formatType(row.type) }}</WinBadge></template>
            <template #cell(payment_status)="{ row }">
              <WinBadge :variant="getPaymentVariant(row.payment_status)">{{ formatPaymentStatus(row.payment_status) }}</WinBadge>
            </template>
            <template #cell(total)="{ row }">{{ formatCurrency(row.total) }}</template>
            <template #cell(created_at)="{ row }">{{ formatDate(row.created_at) }}</template>
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
import { WinPage, WinPageHeader, WinPageContent, WinCard, WinTable, WinTableFilter, WinIconButton, WinBadge, WinAlert, WinModal, WinButton } from '@/components/base'
import OrderDetail from '@/components/orders/OrderDetail.vue'
import { useOrders, type OrderWithCustomer } from '@/composables/useOrders'

const { orders, loading, error, filterOrders, formatCurrency, formatDate } = useOrders()

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showDetailModal = ref(false)
const selectedOrder = ref<OrderWithCustomer | null>(null)

const columns = [
  { key: 'code', label: 'Kode', width: '130px' },
  { key: 'customer_name', label: 'Pelanggan', width: '180px' },
  { key: 'type', label: 'Tipe', width: '100px' },
  { key: 'payment_status', label: 'Pembayaran', width: '110px' },
  { key: 'total', label: 'Total', width: '140px' },
  { key: 'created_at', label: 'Tanggal', width: '150px' }
]

const filterColumns = [
  { key: 'payment_status', label: 'Pembayaran', filterType: 'select' as const, filterOptions: [{ value: 'paid', label: 'Lunas' }, { value: 'unpaid', label: 'Belum Bayar' }, { value: 'partial', label: 'Sebagian' }] },
  { key: 'type', label: 'Tipe', filterType: 'select' as const, filterOptions: [{ value: 'sale', label: 'Penjualan' }, { value: 'refund', label: 'Refund' }] }
]

const filteredOrders = computed(() => filterOrders(searchQuery.value, filters.value))

function formatType(type: string): string {
  const map: Record<string, string> = { sale: 'Penjualan', refund: 'Refund', 'void': 'Void' }
  return map[type] || type
}

function formatPaymentStatus(status: string): string {
  const map: Record<string, string> = { paid: 'Lunas', unpaid: 'Belum Bayar', partial: 'Sebagian' }
  return map[status] || status
}

function getPaymentVariant(status: string): 'success' | 'error' | 'warning' | 'default' {
  const map: Record<string, 'success' | 'error' | 'warning'> = { paid: 'success', unpaid: 'error', partial: 'warning' }
  return map[status] || 'default'
}

function viewDetail(order: OrderWithCustomer) {
  selectedOrder.value = order
  showDetailModal.value = true
}
</script>

<style scoped>
.table-container { display: flex; flex-direction: column; height: 100%; }
.filter-section { padding: 6px 12px; flex-shrink: 0; }
</style>
