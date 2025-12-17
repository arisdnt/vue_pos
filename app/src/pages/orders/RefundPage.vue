<template>
  <WinPage>
    <WinPageHeader title="Refund / Retur">
      <template #actions>
        <WinBadge variant="error">{{ refundOrders.length }} refund</WinBadge>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <WinCard no-padding>
        <div class="table-container">
          <div class="filter-section">
            <WinTableFilter v-model:searchQuery="searchQuery" v-model:filters="filters" :columns="filterColumns" searchPlaceholder="Cari kode, pelanggan..." />
          </div>

          <WinTable :columns="columns" :data="filteredOrders" :loading="loading" :max-height="'100%'" empty-text="Tidak ada transaksi refund" actions>
            <template #cell(customer_name)="{ row }">{{ row.customer_name || '-' }}</template>
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

    <WinModal v-model="showDetailModal" title="Detail Refund" size="md">
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

const { orders, loading, formatCurrency, formatDate } = useOrders()

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showDetailModal = ref(false)
const selectedOrder = ref<OrderWithCustomer | null>(null)

const refundOrders = computed(() => orders.value.filter(o => o.type === 'refund'))

const filteredOrders = computed(() => {
  let result = refundOrders.value
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    result = result.filter(o => o.code.toLowerCase().includes(q) || o.customer_name?.toLowerCase().includes(q))
  }
  if (filters.value.payment_status) result = result.filter(o => o.payment_status === filters.value.payment_status)
  return result
})

const columns = [
  { key: 'code', label: 'Kode', width: '140px' },
  { key: 'customer_name', label: 'Pelanggan', width: '180px' },
  { key: 'payment_status', label: 'Status', width: '110px' },
  { key: 'total', label: 'Total Refund', width: '150px' },
  { key: 'created_at', label: 'Tanggal', width: '160px' }
]

const filterColumns = [
  { key: 'payment_status', label: 'Status', filterType: 'select' as const, filterOptions: [{ value: 'paid', label: 'Dikembalikan' }, { value: 'unpaid', label: 'Belum' }, { value: 'partial', label: 'Sebagian' }] }
]

function formatPaymentStatus(status: string) { return { paid: 'Dikembalikan', unpaid: 'Belum', partial: 'Sebagian' }[status] || status }
function getPaymentVariant(status: string): 'success' | 'error' | 'warning' | 'default' { return { paid: 'success', unpaid: 'error', partial: 'warning' }[status] as any || 'default' }

function viewDetail(order: OrderWithCustomer) {
  selectedOrder.value = order
  showDetailModal.value = true
}
</script>

<style scoped>
.table-container { display: flex; flex-direction: column; height: 100%; }
.filter-section { padding: 6px 12px; flex-shrink: 0; }
</style>
