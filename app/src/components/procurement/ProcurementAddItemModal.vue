<template>
  <WinModal v-model="isOpen" title="Tambah ke Pembelian" size="md">
    <div v-if="product" class="modal-content">
      <div class="product-info">
        <div class="section-title">Produk</div>
        <div class="product-name">{{ product.name }}</div>
        <div class="product-meta">SKU: {{ product.sku || '-' }} • Barcode: {{ product.barcode || '-' }}</div>
      </div>

      <div class="purchase-info">
        <div class="section-title">Informasi Pembelian</div>
        <div class="form-row">
          <WinField label="Supplier">
            <WinSelect v-model="form.provider_id">
              <option value="">-- Tanpa Supplier --</option>
              <option v-for="p in providers" :key="p.id" :value="p.id">{{ p.first_name }} {{ p.last_name || '' }}</option>
            </WinSelect>
          </WinField>
        </div>
        <div class="form-row">
          <WinField label="Nomor Invoice">
            <WinInput v-model="form.invoice_reference" placeholder="Nomor invoice (opsional)" />
          </WinField>
          <WinField label="Status Pembayaran">
            <WinSelect v-model="form.payment_status">
              <option value="unpaid">Belum Dibayar</option>
              <option value="partial">Sebagian</option>
              <option value="paid">Lunas</option>
            </WinSelect>
          </WinField>
        </div>
      </div>

      <div class="item-detail">
        <div class="section-title">Detail Barang</div>
        <div class="form-row">
          <WinField label="Qty">
            <WinInput v-model.number="lineQuantity" type="number" min="1" />
          </WinField>
          <WinField label="Harga Beli">
            <WinInput v-model.number="linePurchasePrice" type="number" min="0" />
          </WinField>
        </div>
      </div>

      <div class="total-section">
        <span>Total</span>
        <span class="total-value">{{ formatCurrency(lineQuantity * linePurchasePrice) }}</span>
      </div>
    </div>

    <template #footer>
      <WinButton variant="default" @click="isOpen = false">Batal</WinButton>
      <WinButton variant="primary" @click="handleConfirm">Tambahkan ke Keranjang</WinButton>
    </template>
  </WinModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { WinModal, WinField, WinInput, WinSelect, WinButton } from '@/components/base'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']
interface Provider { id: string; first_name: string; last_name: string | null }

const props = defineProps<{ modelValue: boolean; product: Product | null; providers: Provider[]; form: { provider_id: string; invoice_reference: string; payment_status: string } }>()
const emit = defineEmits<{ (e: 'update:modelValue', value: boolean): void; (e: 'confirm', data: { quantity: number; purchase_price: number; unit_id: string | null }): void }>()

const isOpen = ref(props.modelValue)
const lineQuantity = ref(1)
const linePurchasePrice = ref(0)

watch(() => props.modelValue, (v) => { isOpen.value = v })
watch(isOpen, (v) => { emit('update:modelValue', v) })
watch(() => props.product, () => { lineQuantity.value = 1; linePurchasePrice.value = 0 })

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}

function handleConfirm() {
  if (lineQuantity.value <= 0) return
  emit('confirm', { quantity: lineQuantity.value, purchase_price: linePurchasePrice.value, unit_id: (props.product as any)?._unitId ?? null })
  isOpen.value = false
}
</script>

<style scoped>
.modal-content { display: flex; flex-direction: column; gap: 20px; }
.section-title { font-size: 12px; font-weight: 600; color: var(--win-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--win-border); padding-bottom: 4px; margin-bottom: 8px; }
.product-info { }
.product-name { font-size: 16px; font-weight: 600; margin-bottom: 4px; }
.product-meta { font-size: 12px; color: var(--win-text-secondary); }
.form-row { display: flex; gap: 12px; }
.form-row > * { flex: 1; }
.total-section { display: flex; justify-content: space-between; align-items: center; padding: 12px; background: var(--win-panel, #f5f5f5); border: 1px solid var(--win-border); font-size: 14px; font-weight: 600; }
.total-value { font-size: 18px; color: var(--win-accent); }
</style>
