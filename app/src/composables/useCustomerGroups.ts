import { ref } from 'vue'
import { db, queueSync } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'
import { useAuthStore } from '@/stores/authStore'

interface CustomerGroup {
    id: string
    store_id: string | null
    name: string
    description: string | null
    created_at: string
    updated_at: string
}

export function useCustomerGroups() {
    const authStore = useAuthStore()
    const error = ref('')

    const { data: customerGroups, loading } = useDexieLiveQuery<CustomerGroup[]>(
        async () => {
            return (await db.table('customer_groups').toArray()) as CustomerGroup[]
        },
        []
    )

    async function createCustomerGroup(data: { name: string; description?: string; store_id?: string }) {
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

        const group: CustomerGroup = {
            id,
            store_id: storeId,
            name: data.name,
            description: data.description ?? null,
            created_at: nowIso,
            updated_at: nowIso,
        }

        await db.table('customer_groups').put(group)
        await queueSync('customer_groups', group.id, 'insert', group)
        return group
    }

    async function updateCustomerGroup(id: string, data: { name?: string; description?: string }) {
        const tbl = db.table('customer_groups')
        const existing = (await tbl.get(id)) as CustomerGroup | undefined
        if (!existing) throw new Error('Customer group not found')

        const nowIso = new Date().toISOString()
        const updated: CustomerGroup = { ...existing, ...data, updated_at: nowIso }

        await tbl.put(updated)
        await queueSync('customer_groups', id, 'update', { ...data, updated_at: nowIso })
        return updated
    }

    async function deleteCustomerGroup(id: string) {
        await db.table('customer_groups').delete(id)
        await queueSync('customer_groups', id, 'delete', null)
    }

    function filterCustomerGroups(searchQuery: string) {
        let result = customerGroups.value
        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(g => g.name.toLowerCase().includes(query) || g.description?.toLowerCase().includes(query))
        }
        return result
    }

    return { customerGroups, loading, error, createCustomerGroup, updateCustomerGroup, deleteCustomerGroup, filterCustomerGroups }
}
