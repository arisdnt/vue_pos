<template>
  <WinPage>
    <WinPageHeader title="Pembelian Cepat">
      <template #actions>
        <WinButton variant="primary" @click="handleSubmit" :loading="saving">{{ saving ? 'Menyimpan...' : 'Simpan Pembelian' }}</WinButton>
      </template>
    </WinPageHeader>

    <WinPageContent>
      <div class="quick-layout">
        <ProcurementProductPanel :products="products" :error="errorMessage" @scan="handleScan" @select="openItemModal" @clear-error="errorMessage = ''" />
        <ProcurementCartPanel :items="items" @remove="removeItem" @update="() => {}" />
      </div>

      <ProcurementAddItemModal v-model="showItemModal" :product="selectedProduct" :providers="providers" :form="form" @confirm="confirmAddItem" />
    </WinPageContent>
  </WinPage>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { WinPage, WinPageHeader, WinPageContent, WinButton } from '@/components/base'
import ProcurementProductPanel from '@/components/procurement/ProcurementProductPanel.vue'
import ProcurementCartPanel from '@/components/procurement/ProcurementCartPanel.vue'
import ProcurementAddItemModal from '@/components/procurement/ProcurementAddItemModal.vue'
import { useProcurements } from '@/composables/useProcurements'
import { useProducts } from '@/composables/useProducts'
import { db } from '@/db/dexie'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
type ProductUnitQuantity = Database['public']['Tables']['product_unit_quantities']['Row']

const { providers, createProcurement } = useProcurements()
const { products } = useProducts()

const form = ref({ provider_id: '', invoice_reference: '', payment_status: 'unpaid' })
const items = ref<Array<{ product_id: string; name: string; unit_id: string | null; quantity: number; purchase_price: number }>>([])
const saving = ref(false)
const errorMessage = ref('')
const showItemModal = ref(false)
const selectedProduct = ref<Product | null>(null)

async function handleScan(code: string) {
  if (!code) return
  errorMessage.value = ''
  let product: Product | undefined
  let unitId: string | null = null

  try {
    const unitRows = (await db.table('product_unit_quantities').where('barcode').equals(code).toArray()) as ProductUnitQuantity[]
    if (unitRows.length > 0) {
      unitId = unitRows[0].unit_id ?? null
      product = (await db.table('products').get(unitRows[0].product_id)) as Product | undefined
    }
  } catch (e) { console.warn('[QuickProcurement] barcode search error', e) }

  if (!product) {
    const lower = code.toLowerCase()
    product = products.value.find(p => (p.barcode?.toLowerCase() === lower) || (p.sku?.toLowerCase() === lower) || (p.name.toLowerCase() === lower))
    if (!product) {
      const nameMatches = products.value.filter(p => p.name.toLowerCase().includes(lower))
      if (nameMatches.length >= 1) product = nameMatches[0]
    }
  }

  if (!product) { errorMessage.value = 'Produk dengan barcode/SKU tersebut tidak ditemukan'; return }
  openItemModal(product, unitId)
}

function openItemModal(product: Product, unitId: string | null = null) {
  selectedProduct.value = product
  ;(selectedProduct.value as any)._unitId = unitId
  showItemModal.value = true
  errorMessage.value = ''
}

function confirmAddItem(data: { quantity: number; purchase_price: number; unit_id: string | null }) {
  if (!selectedProduct.value || data.quantity <= 0) return
  const existing = items.value.find(i => i.product_id === selectedProduct.value!.id)
  if (existing) {
    existing.quantity += data.quantity
    if (!existing.purchase_price && data.purchase_price > 0) existing.purchase_price = data.purchase_price
  } else {
    items.value.push({ product_id: selectedProduct.value.id, name: selectedProduct.value.name, unit_id: data.unit_id, quantity: data.quantity, purchase_price: data.purchase_price })
  }
}

function removeItem(index: number) { items.value.splice(index, 1) }

async function handleSubmit() {
  if (!items.value.length) { errorMessage.value = 'Tambahkan minimal satu barang sebelum menyimpan pembelian'; return }
  saving.value = true; errorMessage.value = ''
  try {
    await createProcurement(
      { name: 'Pembelian Cepat', provider_id: form.value.provider_id || null, invoice_reference: form.value.invoice_reference || null, invoice_date: new Date().toISOString(), payment_status: form.value.payment_status as any, delivery_status: 'received', automatic_approval: true, description: null },
      items.value.map(i => ({ product_id: i.product_id, name: i.name, unit_id: i.unit_id, quantity: i.quantity, purchase_price: i.purchase_price, expiration_date: null }))
    )
    items.value = []; form.value = { provider_id: '', invoice_reference: '', payment_status: 'unpaid' }
  } catch (e: any) { errorMessage.value = e.message || 'Gagal menyimpan pembelian cepat' }
  finally { saving.value = false }
}
</script>

<style scoped>
.quick-layout { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.4fr); gap: 16px; height: 100%; }
@media (max-width: 1024px) { .quick-layout { grid-template-columns: 1fr; } }
</style>
