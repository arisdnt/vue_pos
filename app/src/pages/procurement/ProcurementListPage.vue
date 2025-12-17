<template>
  <WinPage>
    <WinPageHeader title="Pembelian (PO)">
      <template #actions>
        <WinButton variant="primary" @click="openCreateModal">
          + Purchase Order
        </WinButton>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <WinCard no-padding>
        <div class="table-container">
          <div class="filter-section">
            <WinTableFilter
              v-model:searchQuery="searchQuery"
              v-model:filters="filters"
              :columns="filterColumns"
              searchPlaceholder="Cari nama PO, supplier, atau nomor invoice..."
              @filter-change="applyFilters"
            />

            <WinAlert v-if="error" type="error" :closeable="true" @close="error = ''">
              {{ error }}
            </WinAlert>
          </div>

          <WinTable
            :columns="columns"
            :data="filteredProcurements"
            :loading="loading"
            :max-height="'100%'"
            empty-text="Belum ada pembelian"
            actions
          >
            <template #cell(payment_status)="{ row }">
              <WinBadge :variant="row.payment_status === 'paid' ? 'success' : 'default'">
                {{ formatPaymentStatus(row.payment_status) }}
              </WinBadge>
            </template>

            <template #cell(delivery_status)="{ row }">
              <WinBadge :variant="row.delivery_status === 'received' ? 'success' : 'default'">
                {{ formatDeliveryStatus(row.delivery_status) }}
              </WinBadge>
            </template>

            <template #cell(value)="{ row }">
              {{ formatCurrency(row.value || 0) }}
            </template>

            <template #cell(created_at)="{ row }">
              {{ formatDate(row.created_at) }}
            </template>
          </WinTable>
        </div>
      </WinCard>
    </WinPageContent>

    <WinModal v-model="showModal" title="Purchase Order Baru" size="md">
      <WinAlert v-if="formError" type="error" :closeable="true" @close="formError = ''">
        {{ formError }}
      </WinAlert>

      <form @submit.prevent="handleSubmit" class="po-form">
        <div class="form-section">
          <div class="form-row">
            <WinField label="Nama / Judul PO" required>
              <WinInput v-model="form.name" placeholder="Contoh: PO Pembelian Barang" required />
            </WinField>
          </div>

          <div class="form-row">
            <WinField label="Supplier" required>
              <WinSelect v-model="form.provider_id" required>
                <option value="">-- Pilih Supplier --</option>
                <option v-for="p in providers" :key="p.id" :value="p.id">
                  {{ p.first_name }} {{ p.last_name || '' }}
                </option>
              </WinSelect>
            </WinField>

            <WinField label="Nomor Invoice">
              <WinInput v-model="form.invoice_reference" placeholder="Nomor invoice (opsional)" />
            </WinField>
          </div>

          <div class="form-row">
            <WinField label="Tanggal Invoice">
              <WinInput v-model="form.invoice_date" type="date" />
            </WinField>

            <WinField label="Status Pembayaran">
              <WinSelect v-model="form.payment_status">
                <option value="unpaid">Belum Dibayar</option>
                <option value="partial">Sebagian</option>
                <option value="paid">Lunas</option>
              </WinSelect>
            </WinField>
          </div>

          <WinField label="Catatan">
            <WinTextarea v-model="form.description" rows="2" placeholder="Catatan untuk PO ini (opsional)" />
          </WinField>
        </div>

        <div class="form-section">
          <div class="section-header">
            <span class="section-title">Ringkasan</span>
          </div>
          <div class="form-row">
            <WinField label="Scan Barcode / SKU">
              <WinInput
                v-model="scanValue"
                placeholder="Fokus di sini lalu scan barcode atau ketik SKU lalu Enter"
                @keyup.enter.prevent="handleScan"
              />
            </WinField>
          </div>
          <div class="form-row">
            <WinField label="Tambah Item">
              <div class="item-row">
                <WinSelect v-model="newItem.product_id">
                  <option value="">-- Pilih Produk --</option>
                  <option v-for="p in productOptions" :key="p.id" :value="p.id">
                    {{ p.name }}
                  </option>
                </WinSelect>
                <WinInput
                  v-model.number="newItem.quantity"
                  type="number"
                  min="1"
                  placeholder="Qty"
                />
                <WinInput
                  v-model.number="newItem.purchase_price"
                  type="number"
                  min="0"
                  placeholder="Harga Beli"
                />
                <WinButton type="button" variant="primary" @click="addItem">
                  Tambah
                </WinButton>
              </div>
            </WinField>
          </div>

          <div v-if="items.length" class="items-table">
            <div class="items-header">
              <span>Produk</span>
              <span>Qty</span>
              <span>Harga</span>
              <span>Total</span>
              <span></span>
            </div>
            <div v-for="(item, index) in items" :key="index" class="items-row">
              <span>{{ item.name }}</span>
              <span>{{ item.quantity }}</span>
              <span>{{ formatCurrency(item.purchase_price) }}</span>
              <span>{{ formatCurrency(item.purchase_price * item.quantity) }}</span>
              <span>
                <WinButton type="button" variant="default" @click="removeItem(index)">
                  Hapus
                </WinButton>
              </span>
            </div>
          </div>

          <div class="summary-row">
            <span>Total Item</span>
            <span>{{ items.length }}</span>
          </div>
          <div class="summary-row">
            <span>Perkiraan Nilai</span>
            <span>{{ formatCurrency(estimatedValue) }}</span>
          </div>
        </div>

        <div class="form-actions">
          <WinButton type="button" variant="default" @click="closeModal">
            Batal
          </WinButton>
          <WinButton type="submit" variant="primary" :loading="saving">
            {{ saving ? 'Menyimpan...' : 'Simpan PO' }}
          </WinButton>
        </div>
      </form>
    </WinModal>
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  WinPage,
  WinPageHeader,
  WinPageContent,
  WinCard,
  WinTable,
  WinTableFilter,
  WinButton,
  WinBadge,
  WinAlert,
  WinModal,
  WinInput,
  WinSelect,
  WinTextarea,
  WinField,
} from '@/components/base'
import { useProcurements } from '@/composables/useProcurements'
import { useProducts } from '@/composables/useProducts'

const {
  procurements,
  providers,
  loading,
  error,
  createProcurement,
  filterProcurements,
} = useProcurements()

const { products } = useProducts()

const searchQuery = ref('')
const filters = ref<Record<string, any>>({})
const showModal = ref(false)
const saving = ref(false)
const formError = ref('')

const form = ref({
  name: '',
  provider_id: '',
  invoice_reference: '',
  invoice_date: '',
  payment_status: 'unpaid',
  description: '',
})

const items = ref<
  Array<{
    product_id: string
    name: string
    unit_id: string | null
    quantity: number
    purchase_price: number
    expiration_date?: string | null
  }>
>([])

const scanValue = ref('')

const newItem = ref({
  product_id: '',
  quantity: 1,
  purchase_price: 0,
})

const productOptions = computed(() =>
  products.value.map(p => ({
    id: p.id,
    name: p.name,
  })),
)

const estimatedValue = computed(() =>
  items.value.reduce((sum, i) => sum + i.purchase_price * i.quantity, 0),
)

const columns = [
  { key: 'name', label: 'Nama PO', width: '220px' },
  { key: 'provider_name', label: 'Supplier', width: '180px' },
  { key: 'value', label: 'Nilai', width: '140px' },
  { key: 'payment_status', label: 'Pembayaran', width: '120px' },
  { key: 'delivery_status', label: 'Pengiriman', width: '120px' },
  { key: 'created_at', label: 'Dibuat', width: '150px' },
]

const filterColumns = [
  {
    key: 'payment_status',
    label: 'Pembayaran',
    filterType: 'select' as const,
    filterOptions: [
      { value: 'unpaid', label: 'Belum Dibayar' },
      { value: 'partial', label: 'Sebagian' },
      { value: 'paid', label: 'Lunas' },
    ],
  },
  {
    key: 'delivery_status',
    label: 'Pengiriman',
    filterType: 'select' as const,
    filterOptions: [
      { value: 'pending', label: 'Menunggu' },
      { value: 'partial', label: 'Sebagian' },
      { value: 'received', label: 'Diterima' },
    ],
  },
]

const filteredProcurements = computed(() =>
  filterProcurements(searchQuery.value, filters.value),
)

function formatDate(dateString: string | null) {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value || 0)
}

function formatPaymentStatus(status: string | null) {
  if (!status) return '-'
  if (status === 'paid') return 'Lunas'
  if (status === 'partial') return 'Sebagian'
  return 'Belum Dibayar'
}

function formatDeliveryStatus(status: string | null) {
  if (!status) return '-'
  if (status === 'received') return 'Diterima'
  if (status === 'partial') return 'Sebagian'
  return 'Menunggu'
}

function openCreateModal() {
  form.value = {
    name: '',
    provider_id: '',
    invoice_reference: '',
    invoice_date: '',
    payment_status: 'unpaid',
    description: '',
  }
  items.value = []
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function handleSubmit() {
  saving.value = true
  formError.value = ''
  try {
    if (!form.value.provider_id) {
      throw new Error('Supplier wajib dipilih')
    }

    await createProcurement(
      {
        name: form.value.name,
        provider_id: form.value.provider_id || null,
        invoice_reference: form.value.invoice_reference || null,
        invoice_date: form.value.invoice_date
          ? new Date(form.value.invoice_date).toISOString()
          : null,
        payment_status: form.value.payment_status as any,
        description: form.value.description || null,
      },
      items.value,
    )
    closeModal()
  } catch (e: any) {
    formError.value = e.message || 'Gagal menyimpan purchase order'
  } finally {
    saving.value = false
  }
}

function addItem() {
  if (!newItem.value.product_id) {
    formError.value = 'Pilih produk terlebih dahulu'
    return
  }
  if (newItem.value.quantity <= 0 || newItem.value.purchase_price <= 0) {
    formError.value = 'Qty dan harga harus lebih dari 0'
    return
  }

  const product = products.value.find(p => p.id === newItem.value.product_id)
  if (!product) {
    formError.value = 'Produk tidak ditemukan'
    return
  }

  items.value.push({
    product_id: product.id,
    name: product.name,
    unit_id: null,
    quantity: newItem.value.quantity,
    purchase_price: newItem.value.purchase_price,
    expiration_date: null,
  })

  // Reset form item baru
  newItem.value = {
    product_id: '',
    quantity: 1,
    purchase_price: 0,
  }
  formError.value = ''
}

function removeItem(index: number) {
  items.value.splice(index, 1)
}

async function handleScan() {
  const code = scanValue.value.trim()
  if (!code) return

  const lower = code.toLowerCase()
  const product = products.value.find(p => {
    return (
      (p.barcode && p.barcode.toLowerCase() === lower) ||
      (p.sku && p.sku.toLowerCase() === lower) ||
      p.name.toLowerCase() === lower
    )
  })

  if (!product) {
    formError.value = 'Produk dengan barcode/SKU tersebut tidak ditemukan'
    scanValue.value = ''
    return
  }

  const existing = items.value.find(i => i.product_id === product.id)
  if (existing) {
    existing.quantity += 1
  } else {
    items.value.push({
      product_id: product.id,
      name: product.name,
      unit_id: null,
      quantity: 1,
      purchase_price: 0,
      expiration_date: null,
    })
  }

  scanValue.value = ''
  formError.value = ''
}

function applyFilters() {
  // Filtering is reactive via computed
}
</script>

<style scoped>
.table-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.filter-section {
  padding: 6px 12px;
  flex-shrink: 0;
}

.po-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-row > * {
  flex: 1;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--win-text-secondary, #666);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 8px;
  padding-top: 16px;
  border-top: 1px solid var(--win-border);
}

.item-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.item-row > * {
  flex: 1;
}

.items-table {
  margin-top: 8px;
  border: 1px solid var(--win-border);
  border-radius: 2px;
  overflow: hidden;
  font-size: 13px;
}

.items-header,
.items-row {
  display: grid;
  grid-template-columns: 2fr 0.6fr 1fr 1fr 0.8fr;
  gap: 8px;
  padding: 6px 8px;
}

.items-header {
  background-color: var(--win-panel);
  font-weight: 600;
}

.items-row:nth-child(odd) {
  background-color: #fafafa;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }

  .items-header,
  .items-row {
    grid-template-columns: 2fr 0.6fr 1fr 1fr;
  }
}
</style>
