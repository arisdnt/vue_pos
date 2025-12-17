<template>
  <WinCard class="product-panel">
    <div class="search-section">
      <div class="section-title">Cari Barang</div>
      <WinField label="Barcode / SKU / Nama">
        <WinInput ref="searchInputRef" v-model="searchValue" placeholder="Scan barcode atau ketik nama/SKU lalu Enter" @keyup.enter.prevent="$emit('scan', searchValue)" />
      </WinField>
    </div>

    <div class="product-section">
      <div class="section-title">Daftar Produk</div>
      <div class="product-table">
        <div class="product-header">
          <span class="col-name">Nama</span>
          <span class="col-sku">SKU</span>
          <span class="col-barcode">Barcode</span>
          <span class="col-action"></span>
        </div>
        <div class="product-body">
          <div v-for="product in filteredProducts" :key="product.id" class="product-row" @dblclick="$emit('select', product)">
            <span class="col-name">{{ product.name }}</span>
            <span class="col-sku">{{ product.sku }}</span>
            <span class="col-barcode">{{ product.barcode || '-' }}</span>
            <span class="col-action">
              <WinButton variant="default" size="sm" @click.stop="$emit('select', product)">Tambah</WinButton>
            </span>
          </div>
          <div v-if="!filteredProducts.length" class="empty-state">Tidak ada produk ditemukan</div>
        </div>
      </div>
    </div>

    <WinAlert v-if="error" type="error" :closeable="true" @close="$emit('clear-error')">{{ error }}</WinAlert>
  </WinCard>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { WinCard, WinField, WinInput, WinButton, WinAlert } from '@/components/base'
import type { Database } from '@/types/database'

type Product = Database['public']['Tables']['products']['Row']

const props = defineProps<{ products: Product[]; error: string }>()
const emit = defineEmits<{ (e: 'scan', value: string): void; (e: 'select', product: Product): void; (e: 'clear-error'): void }>()

const searchValue = ref('')
const searchInputRef = ref<InstanceType<typeof WinInput> | null>(null)

const filteredProducts = computed(() => {
  const q = searchValue.value.trim().toLowerCase()
  if (!q) return props.products
  return props.products.filter(p => p.name.toLowerCase().includes(q) || p.sku?.toLowerCase().includes(q) || p.barcode?.toLowerCase().includes(q))
})

onMounted(() => { searchInputRef.value?.$el?.focus?.() })

defineExpose({ clearSearch: () => { searchValue.value = '' } })
</script>

<style scoped>
.product-panel { display: flex; flex-direction: column; gap: 16px; height: 100%; }
.search-section, .product-section { display: flex; flex-direction: column; gap: 8px; }
.section-title { font-size: 13px; font-weight: 600; color: var(--win-text-secondary); text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 1px solid var(--win-border); padding-bottom: 4px; }
.product-table { display: flex; flex-direction: column; border: 1px solid var(--win-border); flex: 1; min-height: 0; }
.product-header { display: grid; grid-template-columns: 2fr 1fr 1fr 80px; gap: 8px; padding: 8px 12px; background: var(--win-panel, #f5f5f5); border-bottom: 1px solid var(--win-border); font-size: 12px; font-weight: 600; color: var(--win-text-secondary); }
.product-body { flex: 1; overflow-y: auto; max-height: 320px; }
.product-row { display: grid; grid-template-columns: 2fr 1fr 1fr 80px; gap: 8px; padding: 6px 12px; font-size: 13px; border-bottom: 1px solid var(--win-border); cursor: pointer; transition: background 0.1s; }
.product-row:hover { background: #f0f0f0; }
.product-row:last-child { border-bottom: none; }
.col-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.col-sku, .col-barcode { color: var(--win-text-secondary); font-family: 'Consolas', monospace; font-size: 12px; }
.col-action { display: flex; justify-content: flex-end; }
.empty-state { padding: 24px; text-align: center; color: var(--win-text-secondary); font-size: 13px; }
</style>
