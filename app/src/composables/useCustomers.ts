import { ref } from 'vue'
import type { Database } from '@/types/database'
import { db, queueSync } from '@/db/dexie'
import { useDexieLiveQuery } from '@/composables/useDexieLiveQuery'
import { useAuthStore } from '@/stores/authStore'

type Customer = Database['public']['Tables']['customers']['Row']
type CustomerInsert = Database['public']['Tables']['customers']['Insert']
type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export function useCustomers() {
    const authStore = useAuthStore()
    const error = ref('')

    const { data: customers, loading } = useDexieLiveQuery<Customer[]>(
        async () => {
            return (await db.table('customers').toArray()) as Customer[]
        },
        []
    )

    async function createCustomer(data: Partial<CustomerInsert>) {
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

        const customer: Customer = {
            id,
            store_id: storeId,
            group_id: data.group_id && data.group_id !== '' ? data.group_id : null,
            first_name: data.first_name ?? '',
            last_name: data.last_name ?? null,
            email: data.email ?? null,
            phone: data.phone ?? null,
            gender: data.gender ?? null,
            birth_date: data.birth_date ?? null,
            purchases_amount: 0,
            owed_amount: 0,
            credit_limit_amount: 0,
            account_amount: 0,
            created_by: authStore.user.id,
            created_at: nowIso,
            updated_at: nowIso,
        }

        await db.table('customers').put(customer)
        await queueSync('customers', customer.id, 'insert', customer as CustomerInsert)
        return customer
    }

    async function updateCustomer(id: string, data: Partial<CustomerUpdate>) {
        const tbl = db.table('customers')
        const existing = (await tbl.get(id)) as Customer | undefined
        if (!existing) throw new Error('Customer not found')

        const nowIso = new Date().toISOString()
        const updated: Customer = { ...existing, ...data, updated_at: nowIso }

        await tbl.put(updated)
        const patch: CustomerUpdate = { ...data, updated_at: updated.updated_at }
        await queueSync('customers', id, 'update', patch)
        return updated
    }

    async function deleteCustomer(id: string) {
        await db.table('customers').delete(id)
        await queueSync('customers', id, 'delete', null)
    }

    function filterCustomers(searchQuery: string, filters: Record<string, any>) {
        let result = customers.value

        if (searchQuery) {
            const query = searchQuery.toLowerCase()
            result = result.filter(c =>
                c.first_name.toLowerCase().includes(query) ||
                c.last_name?.toLowerCase().includes(query) ||
                c.email?.toLowerCase().includes(query) ||
                c.phone?.toLowerCase().includes(query)
            )
        }

        if (filters.gender) result = result.filter(c => c.gender === filters.gender)
        if (filters.store_id) result = result.filter(c => c.store_id === filters.store_id)

        return result
    }

    return { customers, loading, error, createCustomer, updateCustomer, deleteCustomer, filterCustomers }
}
