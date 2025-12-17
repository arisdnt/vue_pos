<template>
  <WinCard class="cart-panel" no-padding>
    <div class="cart-header">
      <span class="cart-title">Keranjang</span>
      <WinBadge v-if="items.length" variant="primary">{{ items.length }} item</WinBadge>
    </div>

    <div class="cart-body">
      <div class="items-header">
        <span class="col-name">Produk</span>
        <span class="col-qty">Qty</span>
        <span class="col-price">Harga Beli</span>
        <span class="col-total">Total</span>
        <span class="col-action"></span>
      </div>

      <div v-if="items.length" class="items-list">
        <div v-for="(item, index) in items" :key="item.product_id" class="item-row">
          <span class="col-name">{{ item.name }}</span>
          <span class="col-qty">
            <WinInput v-model.number="item.quantity" type="number" min="1" @change="normalizeItem(item)" />
          </span>
          <span class="col-price">
            <WinInput v-model.number="item.purchase_price" type="number" min="0" @change="normalizeItem(item)" />
          </span>
          <span class="col-total">{{ formatCurrency(item.purchase_price * item.quantity) }}</span>
          <span class="col-action">
            <WinIconButton :icon="Trash2" size="sm" variant="danger" tooltip="Hapus" @click="$emit('remove', index)" />
          </span>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <div class="empty-text">Scan barcode atau tambahkan barang untuk memulai pembelian.</div>
      </div>
    </div>

    <div class="cart-summary">
      <div class="summary-row"><span>Total Item</span><span>{{ items.length }}</span></div>
      <div class="summary-row summary-total"><span>Total Nilai Pembelian</span><span>{{ formatCurrency(totalValue) }}</span></div>
    </div>
  </WinCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Trash2 } from 'lucide-vue-next'
import { WinCard, WinBadge, WinInput, WinIconButton } from '@/components/base'

interface CartItem { product_id: string; name: string; unit_id: string | null; quantity: number; purchase_price: number }

const props = defineProps<{ items: CartItem[] }>()
const emit = defineEmits<{ (e: 'remove', index: number): void; (e: 'update', items: CartItem[]): void }>()

const totalValue = computed(() => props.items.reduce((sum, i) => sum + i.purchase_price * i.quantity, 0))

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0)
}

function normalizeItem(item: CartItem) {
  if (!item.quantity || item.quantity < 1) item.quantity = 1
  if (!item.purchase_price || item.purchase_price < 0) item.purchase_price = 0
  emit('update', props.items)
}
</script>

<style scoped>
.cart-panel { display: flex; flex-direction: column; height: 100%; }
.cart-header { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid var(--win-border); background: var(--win-panel, #f5f5f5); }
.cart-title { font-size: 14px; font-weight: 600; }
.cart-body { flex: 1; display: flex; flex-direction: column; min-height: 0; }
.items-header { display: grid; grid-template-columns: 2fr 70px 100px 100px 50px; gap: 8px; padding: 8px 12px; background: var(--win-panel, #f5f5f5); border-bottom: 1px solid var(--win-border); font-size: 12px; font-weight: 600; color: var(--win-text-secondary); }
.items-list { flex: 1; overflow-y: auto; max-height: 340px; }
.item-row { display: grid; grid-template-columns: 2fr 70px 100px 100px 50px; gap: 8px; padding: 6px 12px; border-bottom: 1px solid var(--win-border); align-items: center; font-size: 13px; }
.item-row:nth-child(odd) { background: #fafafa; }
.col-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-qty :deep(.win-input), .col-price :deep(.win-input) { width: 100%; text-align: right; }
.col-total { font-weight: 500; text-align: right; font-family: 'Consolas', monospace; }
.col-action { display: flex; justify-content: center; }
.empty-state { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 32px; gap: 8px; }
.empty-icon { font-size: 32px; opacity: 0.5; }
.empty-text { font-size: 13px; color: var(--win-text-secondary); text-align: center; }
.cart-summary { border-top: 2px solid var(--win-border); padding: 12px; background: var(--win-panel, #f5f5f5); }
.summary-row { display: flex; justify-content: space-between; font-size: 13px; padding: 4px 0; }
.summary-total { font-weight: 600; font-size: 15px; color: var(--win-accent); border-top: 1px solid var(--win-border); margin-top: 8px; padding-top: 8px; }
</style>
