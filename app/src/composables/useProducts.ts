import { ref } from 'vue'
import type { Database } from '@/types/database'
import { db, queueSync } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'
import { useAuthStore } from '@/stores/authStore'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']
type ProductCategory = Database['public']['Tables']['product_categories']['Row']
type UnitGroup = Database['public']['Tables']['unit_groups']['Row']
type TaxGroup = Database['public']['Tables']['tax_groups']['Row']

export interface ProductWithCategory extends Product {
    category_name?: string
}

export function useProducts() {
    const authStore = useAuthStore()
    const error = ref('')

    // Live query products dari Dexie
    const { data: products, loading } = useDexieLiveQuery<ProductWithCategory[]>(
        async () => {
            const productRows = (await db.table('products').toArray()) as Product[]
            const categoryRows = (await db.table('product_categories').toArray()) as ProductCategory[]

            // Map category names
            const categoryMap = new Map(categoryRows.map(c => [c.id, c.name]))

            return productRows.map<ProductWithCategory>(p => ({
                ...p,
                category_name: p.category_id ? categoryMap.get(p.category_id) : undefined
            }))
        },
        []
    )

    // Live query categories untuk form select
    const { data: categories } = useDexieLiveQuery<ProductCategory[]>(
        async () => {
            return (await db.table('product_categories').toArray()) as ProductCategory[]
        },
        [],
    )

    // Live query unit groups dan tax groups untuk form produk
    const { data: unitGroups } = useDexieLiveQuery<UnitGroup[]>(
        async () => {
            return (await db.table('unit_groups').toArray()) as UnitGroup[]
        },
        [],
    )

    const { data: taxGroups } = useDexieLiveQuery<TaxGroup[]>(
        async () => {
            return (await db.table('tax_groups').toArray()) as TaxGroup[]
        },
        [],
    )

    async function fetchProducts() {
        // Data products sekarang di-drive oleh Dexie liveQuery
        error.value = ''
    }

    async function createProduct(data: Partial<ProductInsert>) {
        console.log('➕ [useProducts] Creating product (Dexie + sync_outbox)...', data)

        if (!authStore.user) {
            console.error('❌ [useProducts] User not authenticated')
            throw new Error('User not authenticated')
        }

        const accessibleStores = (authStore.accessibleStores || []) as any[]

        const id =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`

        const nowIso = new Date().toISOString()

        // Aturan bisnis:
        // - Manager & Kasir hanya memiliki satu toko.
        // - Owner bisa memiliki banyak toko.
        //
        // Implementasi:
        // - Jika user bukan Owner dan memiliki minimal satu toko yang dapat diakses,
        //   pakai toko pertama sebagai store_id (form tidak menampilkan pilihan toko).
        // - Jika user Owner, hormati nilai store_id dari form (jika ada).
        // - Jika tidak ada satupun yang terdeteksi, fallback ke nilai dari form (bisa null)
        //   dan biarkan RLS di Supabase yang memvalidasi.
        let storeId: string | null = null
        if (!authStore.isOwner && accessibleStores.length > 0) {
            storeId = accessibleStores[0].id
        } else if (data.store_id && data.store_id !== '') {
            storeId = data.store_id
        } else if (accessibleStores.length === 1) {
            storeId = accessibleStores[0].id
        } else {
            storeId = null
        }

        const product: Product = {
            id,
            store_id: storeId,
            category_id: data.category_id && data.category_id !== '' ? data.category_id : null,
            unit_group_id: data.unit_group_id && data.unit_group_id !== '' ? data.unit_group_id : null,
            tax_group_id: data.tax_group_id && data.tax_group_id !== '' ? data.tax_group_id : null,
            name: data.name ?? '',
            sku: data.sku ?? '',
            barcode: data.barcode ?? null,
            product_type: data.product_type ?? 'product',
            type: data.type ?? 'tangible',
            status: data.status ?? 'available',
            stock_management: data.stock_management ?? 'enabled',
            description: data.description ?? null,
            tax_type: data.tax_type ?? null,
            tax_value: data.tax_value ?? 0,
            auto_cogs: data.auto_cogs ?? true,
            accurate_tracking: data.accurate_tracking ?? false,
            expires: data.expires ?? false,
            on_expiration: data.on_expiration ?? 'prevent_sales',
            searchable: data.searchable ?? true,
            created_by: authStore.user.id,
            created_at: nowIso,
            updated_at: nowIso,
        }

        // 1) Update local Dexie cache immediately
        await db.table('products').put(product)

        // 2) Queue write to Supabase via sync_outbox
        await queueSync('products', product.id, 'insert', product as ProductInsert)

        console.log('✅ [useProducts] Product created locally and queued for sync')
        return product
    }

    async function updateProduct(id: string, data: Partial<ProductUpdate>) {
        console.log('✏️ [useProducts] Updating product (Dexie + sync_outbox)...', { id, data })

        const tbl = db.table('products')
        const existing = (await tbl.get(id)) as Product | undefined

        if (!existing) {
            console.warn('[useProducts] Product not found in Dexie')
            throw new Error('Product not found')
        }

        const nowIso = new Date().toISOString()
        const updated: Product = {
            ...existing,
            ...data,
            updated_at: nowIso,
        }

        // 1) Update Dexie cache
        await tbl.put(updated)

        // 2) Queue update for Supabase
        const patch: ProductUpdate = {
            ...data,
            updated_at: updated.updated_at,
        }
        await queueSync('products', id, 'update', patch)

        console.log('✅ [useProducts] Product updated locally and queued for sync')
        return updated
    }

    async function deleteProduct(id: string) {
        console.log('🗑️ [useProducts] Deleting product (Dexie + sync_outbox)...', { id })

        // 1) Remove from Dexie
        await db.table('products').delete(id)

        // 2) Queue delete for Supabase
        await queueSync('products', id, 'delete', null)

        console.log('✅ [useProducts] Product deleted locally and queued for sync')
    }

    function filterProducts(searchQuery: string, filters: Record<string, any>) {
        let result = products.value

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(product =>
                product.name.toLowerCase().includes(query) ||
                product.sku.toLowerCase().includes(query) ||
                product.barcode?.toLowerCase().includes(query) ||
                product.description?.toLowerCase().includes(query)
            )
        }

        // Status filter
        if (filters.status) {
            result = result.filter(product => product.status === filters.status)
        }

        // Category filter
        if (filters.category_id) {
            result = result.filter(product => product.category_id === filters.category_id)
        }

        return result
    }

    return {
        products,
        categories,
        unitGroups,
        taxGroups,
        loading,
        error,
        fetchProducts,
        createProduct,
        updateProduct,
        deleteProduct,
        filterProducts
    }
}
