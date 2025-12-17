import { ref, computed } from 'vue'
import type { Database } from '@/types/database'
import { db, queueSync } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'

type ProductCategory = Database['public']['Tables']['product_categories']['Row']
type ProductCategoryInsert = Database['public']['Tables']['product_categories']['Insert']
type ProductCategoryUpdate = Database['public']['Tables']['product_categories']['Update']

export function useProductCategories() {
    const parentCategories = ref<{ id: string; name: string }[]>([])
    const loading = ref(false)
    const error = ref('')

    const { data: categories } = useDexieLiveQuery<ProductCategory[]>(
        async () => {
            const rows = (await db.table('product_categories').toArray()) as ProductCategory[]
            return rows
        },
        [],
    )

    async function fetchCategories() {
        // Data categories sekarang di-drive oleh Dexie liveQuery.
        // Fungsi ini dipertahankan untuk kompatibilitas.
        error.value = ''
    }

    async function fetchParentCategories(storeId?: string) {
        try {
            const rows = (await db.table('product_categories').toArray()) as ProductCategory[]
            const roots = rows.filter(r => r.parent_id === null)

            parentCategories.value = (storeId ? roots.filter(r => r.store_id === storeId) : roots).map(
                (r) => ({ id: r.id, name: r.name }),
            )
        } catch (e) {
            console.warn('Failed to load parent categories from Dexie:', e)
        }
    }

    async function createCategory(data: ProductCategoryInsert) {
        const id =
            typeof crypto !== 'undefined' && 'randomUUID' in crypto
                ? crypto.randomUUID()
                : `${Date.now()}-${Math.random().toString(16).slice(2)}`

        const nowIso = new Date().toISOString()

        const category: ProductCategory = {
            id,
            store_id: data.store_id ?? null,
            name: data.name,
            description: data.description ?? null,
            parent_id: data.parent_id ?? null,
            display_order: data.display_order ?? 0,
            displays_on_pos: data.displays_on_pos ?? true,
            total_items: data.total_items ?? 0,
            created_at: nowIso,
            updated_at: nowIso,
        }

        await db.table('product_categories').put(category)
        await queueSync('product_categories', id, 'insert', category as ProductCategoryInsert)

        return category
    }

    async function updateCategory(id: string, data: ProductCategoryUpdate) {
        const tbl = db.table('product_categories')
        const existing = (await tbl.get(id)) as ProductCategory | undefined

        if (!existing) {
            console.warn('[useProductCategories] Category not found in Dexie')
            return
        }

        const nowIso = new Date().toISOString()
        const updated: ProductCategory = {
            ...existing,
            ...data,
            updated_at: nowIso,
        }

        await tbl.put(updated)

        const patch: ProductCategoryUpdate = {
            ...data,
            updated_at: updated.updated_at,
        }

        await queueSync('product_categories', id, 'update', patch)

        return updated
    }

    async function deleteCategory(id: string) {
        const categoriesTable = db.table('product_categories')
        const productsTable = db.table('products')

        const childCount = await categoriesTable.where('parent_id').equals(id).count()
        if (childCount > 0) {
            throw new Error('Tidak dapat menghapus kategori yang memiliki sub-kategori')
        }

        const productsWithCategory = await productsTable.where('category_id').equals(id).count()
        if (productsWithCategory > 0) {
            throw new Error('Tidak dapat menghapus kategori yang memiliki produk')
        }

        await categoriesTable.delete(id)
        await queueSync('product_categories', id, 'delete', null)
    }

    function filterCategories(search: string, filters: Record<string, any>) {
        return categories.value.filter(c => {
            // Search filter
            if (search) {
                const q = search.toLowerCase()
                const matchSearch =
                    c.name.toLowerCase().includes(q) ||
                    (c.description?.toLowerCase().includes(q) ?? false)
                if (!matchSearch) return false
            }

            // Parent filter
            if (filters.parent_id !== undefined && filters.parent_id !== '') {
                if (filters.parent_id === 'null') {
                    if (c.parent_id !== null) return false
                } else {
                    if (c.parent_id !== filters.parent_id) return false
                }
            }

            // POS display filter
            if (filters.displays_on_pos !== undefined && filters.displays_on_pos !== '') {
                const showOnPos = filters.displays_on_pos === 'true'
                if (c.displays_on_pos !== showOnPos) return false
            }

            return true
        })
    }

    // Build category tree for display
    const categoryTree = computed(() => {
        const roots = categories.value.filter(c => !c.parent_id)
        const children = categories.value.filter(c => c.parent_id)

        return roots.map(root => ({
            ...root,
            children: children.filter(c => c.parent_id === root.id)
        }))
    })

    return {
        categories,
        parentCategories,
        categoryTree,
        loading,
        error,
        fetchCategories,
        fetchParentCategories,
        createCategory,
        updateCategory,
        deleteCategory,
        filterCategories
    }
}
