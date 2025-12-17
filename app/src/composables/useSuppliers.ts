import { ref } from 'vue'
import { db, queueSync } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'
import { useAuthStore } from '@/stores/authStore'

interface Provider {
    id: string
    store_id: string | null
    name: string
    email: string | null
    phone: string | null
    address: string | null
    city: string | null
    created_at: string
    updated_at: string
}

export function useSuppliers() {
    const authStore = useAuthStore()
    const error = ref('')

    const { data: suppliers, loading } = useDexieLiveQuery<Provider[]>(
        async () => {
            return (await db.table('providers').toArray()) as Provider[]
        },
        []
    )

    async function createSupplier(data: { name: string; email?: string; phone?: string; address?: string; city?: string; store_id?: string }) {
        if (!authStore.user) throw new Error('User not authenticated')

        const accessibleStores = (authStore.accessibleStores || []) as any[]
        const id = typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`
        const nowIso = new Date().toISOString()

        let storeId: string | null = null
        if (!authStore.isOwner && accessibleStores.length > 0) {
            storeId = accessibleStores[0].id
        } else if (data.store_id && data.store_id !== '') {
            storeId = data.store_id
        } else if (accessibleStores.length === 1) {
            storeId = accessibleStores[0].id
        }

        const supplier: Provider = {
            id,
            store_id: storeId,
            name: data.name,
            email: data.email ?? null,
            phone: data.phone ?? null,
            address: data.address ?? null,
            city: data.city ?? null,
            created_at: nowIso,
            updated_at: nowIso,
        }

        await db.table('providers').put(supplier)
        await queueSync('providers', supplier.id, 'insert', supplier)
        return supplier
    }

    async function updateSupplier(id: string, data: { name?: string; email?: string; phone?: string; address?: string; city?: string }) {
        const tbl = db.table('providers')
        const existing = (await tbl.get(id)) as Provider | undefined
        if (!existing) throw new Error('Supplier not found')

        const nowIso = new Date().toISOString()
        const updated: Provider = { ...existing, ...data, updated_at: nowIso }

        await tbl.put(updated)
        await queueSync('providers', id, 'update', { ...data, updated_at: nowIso })
        return updated
    }

    async function deleteSupplier(id: string) {
        await db.table('providers').delete(id)
        await queueSync('providers', id, 'delete', null)
    }

    function filterSuppliers(searchQuery: string) {
        let result = suppliers.value
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(s =>
                s.name.toLowerCase().includes(query) ||
                s.email?.toLowerCase().includes(query) ||
                s.phone?.toLowerCase().includes(query) ||
                s.city?.toLowerCase().includes(query)
            )
        }
        return result
    }

    return { suppliers, loading, error, createSupplier, updateSupplier, deleteSupplier, filterSuppliers }
}
